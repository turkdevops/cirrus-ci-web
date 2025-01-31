import React from 'react';
import { CardContent } from '@mui/material';
import { useFragment } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { BuildDebuggingInformation_build$key } from './__generated__/BuildDebuggingInformation_build.graphql';
import InlineLogs from '../logs/InlineLogs';

interface Props {
  build: BuildDebuggingInformation_build$key;
}

export default function BuildDebuggingInformation(props: Props) {
  let build = useFragment(
    graphql`
      fragment BuildDebuggingInformation_build on Build {
        parsingResult {
          rawYamlConfig
          rawStarlarkConfig
          processedYamlConfig
          outputLogs
          environment
          affectedFiles
        }
      }
    `,
    props.build,
  );

  if (!build.parsingResult) {
    return null;
  }

  const starlarkInformation =
    build.parsingResult.rawStarlarkConfig === '' ? null : (
      <>
        <InlineLogs title="Starlark configuration" lines={build.parsingResult.rawStarlarkConfig.split('\n')} />
        <InlineLogs title="Starlark logs" lines={build.parsingResult.outputLogs} />
        <InlineLogs title="Final configuration" lines={build.parsingResult.processedYamlConfig.split('\n')} />
      </>
    );

  return (
    <Card elevation={24}>
      <CardContent>
        <Typography variant="h6">Debugging Information</Typography>
        <InlineLogs title="YAML configuration" lines={build.parsingResult.rawYamlConfig.split('\n')} />
        <InlineLogs title="Environment Variables" lines={build.parsingResult.environment} />
        <InlineLogs title="Affected Files" lines={build.parsingResult.affectedFiles} />
        {starlarkInformation}
      </CardContent>
    </Card>
  );
}
