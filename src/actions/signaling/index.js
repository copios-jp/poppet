import {
  JOIN_AS_NEW_PEER,
  JOIN_AS_NEW_PEER_RESPONSE,
  DEVICE_LOADED,
  LEAVE,
  LEAVE_RESPONSE,
} from '../../constants';
import {sig, startPolling, stopPolling} from '../../services/remote';
import {device} from '../../services/media_soup';

export const joinAsNewPeer = body => async dispatch => {
  const {routerRtpCapabilities} = await sig(JOIN_AS_NEW_PEER);
  dispatch({
    type: JOIN_AS_NEW_PEER_RESPONSE,
    payload: routerRtpCapabilities,
  });
  if (!device.loaded) {
    console.log(routerRtpCapabilities);
    await device.load({routerRtpCapabilities});
  }
  dispatch({
    type: DEVICE_LOADED,
    payload: device,
  });
  startPolling();
};

export const leave = body => async dispatch => {
  const payload = await sig(LEAVE);
  dispatch({
    type: LEAVE_RESPONSE,
    payload: payload,
  });
};
export default {
  joinAsNewPeer,
  leave,
};
