import React from 'react';
import {connect} from 'react-redux';
import {IconButton} from '@material-ui/core';

import {makeStyles} from '@material-ui/styles';
import CallEndIcon from '@material-ui/icons/CallEnd';

import {LOADED} from '../../constants';
import {Signaling} from '../../actions';

const useStyles = makeStyles(theme => ({
  callEnd: {},
}));

const CallEndButton = function({disabled, action}) {
  const classes = useStyles();

  return (
    <IconButton
      disabled={disabled}
      className={classes.callEnd}
      onClick={action}
      color="inherit">
      <CallEndIcon />
    </IconButton>
  );
};

const mapStateToProps = ({app = {}}, ownProps) => {
  return {
    disabled: app.status !== LOADED,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    action() {
      dispatch(Signaling.leave());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(CallEndButton);
