import React from 'react';
import {AppBar, Toolbar, IconButton, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';

import MenuIcon from '@material-ui/icons/Menu';
import PowerButton from '../power_button';
import MicButton from '../mic_button';
import VideoCamButton from '../video_cam_button';
import CallEndButton from '../call_end_button';
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function() {
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Poppet!
        </Typography>
        <MicButton />
        <CallEndButton />
        <VideoCamButton />
        <PowerButton />
      </Toolbar>
    </AppBar>
  );
}
