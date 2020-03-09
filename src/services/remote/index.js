import {POST, SYNC, SYNC_RESPONSE, ERROR} from '../../constants';
import store from '../../store';

export async function sig(endpoint, data, beacon) {
  const {app} = store.getState();
  const {myPeerId} = app;

  const path = `http://localhost:3000/signaling/${endpoint}`;
  try {
    const headers = {'Content-Type': 'application/json'};
    const body = JSON.stringify({...data, peerId: myPeerId});

    if (beacon) {
      navigator.sendBeacon(path, body);
      return null;
    }

    let response = await fetch(path, {
      method: POST,
      body,
      headers,
    });

    return await response.json();
  } catch (e) {
    console.error(e);
    return {error: e};
  }
}

let pollingInterval;

export function startPolling() {
  const pollingInterval = setInterval(async () => {
    const payload = await sig(SYNC);
    const {error} = payload;

    if (error) {
      clearInterval(pollingInterval);
      store.dispatch({
        type: ERROR,
        payload,
      });
      return;
    }

    store.dispatch({
      type: SYNC_RESPONSE,
      payload,
    });
  }, 1000);
}

export function stopPolling() {
  clearInterval(pollingInterval);
}
