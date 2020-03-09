import React from 'react';
import {connect} from 'react-redux';
import {IconButton} from '@material-ui/core';

import {makeStyles} from '@material-ui/styles';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

import {LOADED} from '../../constants';

import {Signaling} from '../../actions';

const useStyles = makeStyles(theme => ({
  micButton: {},
  audioNotRecording: {
    color: 'red',
  },
}));

const PowerButton = function({disabled, audioRecording, action}) {
  const classes = useStyles();

  return (
    <IconButton
      disabled={disabled}
      className={classes.micButton}
      onClick={action}
      color="inherit">
      {audioRecording ? (
        <MicIcon />
      ) : (
        <MicOffIcon className={!disabled && classes.audioNotRecording} />
      )}
    </IconButton>
  );
};

const mapStateToProps = ({app = {}}, ownProps) => {
  const {audioRecording, status} = app;
  return {
    audioRecording,
    disabled: status !== LOADED,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    mute() {
      // do something that mutes
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PowerButton);
