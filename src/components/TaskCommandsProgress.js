import {isTaskFinalStatus} from "../utils/status";
import React from "react";
import {taskStatusColor} from "../utils/colors";
import {withStyles, Tooltip, Typography} from "material-ui";
import classNames from 'classnames';
import {formatDuration} from "../utils/time";
import {cirrusColors} from "../cirrusTheme";

let styles = {
  tooltipTitle: {
    color: cirrusColors.cirrusWhite
  }
};

class TaskCommandsProgress extends React.Component {
  render() {
    let {classes, task} = this.props;
    let totalDuration = task.statusDurations.reduce(
      (sum, statusDuration) => sum + statusDuration.durationInSeconds,
      0
    );
    if (!isTaskFinalStatus(task.status)) {
      totalDuration = (Date.now() - task.creationTimestamp) / 1000;
      setTimeout(() => this.forceUpdate(), 1000);
    }

    let bars = [];

    let totalPercent = 0;
    for (let i = 0; i < task.statusDurations.length; ++i) {
      let statusDuration = task.statusDurations[i];
      let isLastBar = i === task.statusDurations.length - 1;

      let percent = 100 * statusDuration.durationInSeconds / totalDuration;
      if (isLastBar) {
        percent = 100 - totalPercent;
      } else {
        totalPercent += percent;
      }
      bars.push(
        <div className="progress-bar"
             role="progressbar"
             key={statusDuration.status}
             style={{width: percent + '%', backgroundColor: taskStatusColor(statusDuration.status)}}
             aria-valuenow={percent}
             aria-valuemin="0"
             aria-valuemax="100"/>
      )
    }

    let tooltipTitle = (
      <div>
        {task.statusDurations.map(statusDuration =>
          <Typography variant="caption" className={classes.tooltipTitle}>{formatDuration(statusDuration.durationInSeconds)}: {statusDuration.status}</Typography>)
        }
      </div>
    );

    return (
      <Tooltip placement="bottom" title={tooltipTitle}>
        <div className={classNames(this.props.className, "progress")}>
          {bars}
        </div>
      </Tooltip>
    );
  }
}

export default withStyles(styles)(TaskCommandsProgress);
