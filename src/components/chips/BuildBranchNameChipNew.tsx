import React from 'react';
import { useFragment } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { graphql } from 'babel-plugin-relay/macro';
import cx from 'classnames';

import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { Tooltip } from '@mui/material';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import UnarchiveIcon from '@mui/icons-material/UnarchiveOutlined';

import { shorten } from '../../utils/text';
import { navigateHelper } from '../../utils/navigateHelper';

import { BuildBranchNameChipNew_build$key } from './__generated__/BuildBranchNameChipNew_build.graphql';

const useStyles = makeStyles(theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(0.5),
    },
    chip: {
      flexGrow: 0,
    },
  };
});

interface Props {
  build: BuildBranchNameChipNew_build$key;
  withHeader?: boolean;
  className?: string;
}

export default function BuildBranchNameChipNew(props: Props) {
  let build = useFragment(
    graphql`
      fragment BuildBranchNameChipNew_build on Build {
        id
        branch
        tag
        repository {
          id
          owner
          name
        }
      }
    `,
    props.build,
  );

  let classes = useStyles();
  let navigate = useNavigate();
  let theme = useTheme();

  function handleBranchClick(event) {
    if (build.repository) {
      navigateHelper(
        navigate,
        event,
        '/github/' + build.repository.owner + '/' + build.repository.name + '/' + build.branch,
      );
    } else if (build.repository.id) {
      navigateHelper(navigate, event, '/repository/' + build.repository.id + '/' + build.branch);
    }
  }

  return (
    <div className={props.withHeader ? classes.container : ''}>
      {props.withHeader && (
        <Typography variant="caption" color={theme.palette.text.disabled}>
          Branch
        </Typography>
      )}
      {build.tag ? (
        <Tooltip title={`${build.tag} tag`}>
          <Chip
            className={cx(props.className, classes.chip)}
            label={shorten(build.branch)}
            avatar={<UnarchiveIcon />}
            size="small"
            onClick={handleBranchClick}
            onAuxClick={handleBranchClick}
          />
        </Tooltip>
      ) : (
        <Chip
          className={cx(props.className, classes.chip)}
          label={shorten(build.branch)}
          avatar={<CallSplitIcon />}
          size="small"
          title={build.branch}
          onClick={handleBranchClick}
          onAuxClick={handleBranchClick}
        />
      )}
    </div>
  );
}
