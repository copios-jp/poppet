import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';

const log = store => next => action => {
  if (global.log)
    console.log({[action.type]: Object.assign({}, store.getState(), action)});
  next(action);
};

const store = createStore(reducers, applyMiddleware(thunkMiddleware, log));
export default store;
