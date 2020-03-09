import {
  JOIN_AS_NEW_PEER_RESPONSE,
  LEAVE_RESPONSE,
  DEVICE_LOADED,
  ERROR,
  SYNC_RESPONSE,
  LOADED,
} from '../../constants';
import {uuidv4} from '../../util';

export const defaultState = {
  status: 'undefined',
  routerRtpCapabilities: {},
  myPeerId: uuidv4(),
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case JOIN_AS_NEW_PEER_RESPONSE:
      return {...state, routerRtpCapabilities: action.payload};
    case DEVICE_LOADED:
      return {...state, status: LOADED};
    case LEAVE_RESPONSE:
      return {...state, status: undefined};
    case SYNC_RESPONSE:
      console.log(action.payload);
      return {...state, ...action.payload};
    case ERROR:
      return {...state, status: ERROR};
    default:
      return state;
  }
};
