import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import './_.css';
import AppBar from '../app_bar';
import {Provider} from 'react-redux';
import store from '../../store';

function App() {
  return (
    <Provider store={store}>
      <Container className="App">
        <AppBar />
        <Box className="App-header">
          <div id="join-control" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer">
            Learn React
          </a>
        </Box>
      </Container>
    </Provider>
  );
}
export default App;
