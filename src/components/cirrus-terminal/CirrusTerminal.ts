import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { grpc } from '@improbable-eng/grpc-web';
import { GuestServiceClient } from './api/terminal_pb_service';
import { Data, GuestTerminalRequest, TerminalDimensions } from './api/terminal_pb';
import '../../../node_modules/xterm/css/xterm.css';

enum CirrusTerminalState {
  Connecting = 1,
  Connected = 2,
}

export class CirrusTerminal {
  state: CirrusTerminalState;

  constructor(attachTo: HTMLElement, connectTo: string, locator: string, secret: string) {
    // Instantiate a new Xterm.js terminal and attach it
    // to the element provided by the user
    const term = new Terminal();
    term.open(attachTo);

    // Resize terminal to fit it's containing element
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    this.state = CirrusTerminalState.Connecting;

    // Configure gRPC-Web to use WebSocket transport,
    // otherwise bidirectional streaming wouldn't work
    grpc.setDefaultTransport(grpc.WebsocketTransport());

    // Request a new channel on the terminal server
    const frontendService = new GuestServiceClient(connectTo);
    const terminalChannel = frontendService.terminalChannel();

    // Do I/O
    terminalChannel.on('data', message => {
      if (this.state != CirrusTerminalState.Connected) {
        console.log('spurious message from the server');
        this.state = CirrusTerminalState.Connecting;
      }

      if (message.hasOutput()) {
        const data = message.getOutput().getData();
        term.write(data);
      } else {
        console.log('UI ERROR: broken frontend server');
        this.state = CirrusTerminalState.Connecting;
      }
    });
    terminalChannel.on('end', newStatus => {
      console.log(newStatus);
      this.state = CirrusTerminalState.Connecting;
    });

    const requestedDimensions = new TerminalDimensions();
    requestedDimensions.setWidthColumns(term.cols);
    requestedDimensions.setHeightRows(term.rows);

    const request = new GuestTerminalRequest();
    const hello = new GuestTerminalRequest.Hello();
    hello.setLocator(locator);
    hello.setSecret(secret);
    hello.setRequestedDimensions(requestedDimensions);
    request.setHello(hello);
    terminalChannel.write(request);

    this.state = CirrusTerminalState.Connected;

    term.onData(userInput => {
      const data = new Data();
      data.setData(new TextEncoder().encode(userInput));

      const request = new GuestTerminalRequest();
      request.setInput(data);
      terminalChannel.write(request);
    });
  }
}
