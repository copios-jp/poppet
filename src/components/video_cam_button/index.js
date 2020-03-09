import React from 'react';
import {connect} from 'react-redux';
import {IconButton} from '@material-ui/core';

import {makeStyles} from '@material-ui/styles';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import {LOADED} from '../../constants';

import {Signaling} from '../../actions';

const useStyles = makeStyles(theme => ({
  videoCamButton: {},
  videoNotRecording: {
    color: 'red',
  },
}));

const VideoCamButton = function({disabled, videoRecording, action}) {
  const classes = useStyles();

  return (
    <IconButton
      disabled={disabled}
      className={classes.videoCamButton}
      onClick={action}
      color="inherit">
      {videoRecording ? (
        <VideocamIcon />
      ) : (
        <VideocamOffIcon className={!disabled && classes.videoNotRecording} />
      )}
    </IconButton>
  );
};
const mapStateToProps = ({app = {}}, ownProps) => {
  const {videoRecording, status} = app;
  return {
    videoRecording,
    disabled: status !== LOADED,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    action() {
      // do something that toggles video recording
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(VideoCamButton);
