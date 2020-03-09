import React from 'react';
import {connect} from 'react-redux';
import {IconButton} from '@material-ui/core';

import {makeStyles} from '@material-ui/styles';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import {LOADED} from '../../constants';

import {Signaling} from '../../actions';

const useStyles = makeStyles(theme => ({
  powerButton: {},
}));

const PowerButton = function({disabled, joinAsNewPeer}) {
  const classes = useStyles();

  return (
    <IconButton
      disabled={disabled}
      className={classes.powerButton}
      onClick={joinAsNewPeer}
      color="inherit">
      <PowerSettingsNewIcon />
    </IconButton>
  );
};

const mapStateToProps = ({app = {}}, ownProps) => {
  return {
    disabled: app.status === LOADED,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    joinAsNewPeer() {
      dispatch(Signaling.joinAsNewPeer());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PowerButton);
