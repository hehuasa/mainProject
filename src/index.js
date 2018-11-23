import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import { Modal } from 'antd';
import createHistory from 'history/createHashHistory';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import FastClick from 'fastclick';
import { constantlyModal, infoPopsModal, infoConstantly, constantlyPanelModal } from './services/constantlyModal';
import './rollbar';

import './index.less';

// 1. Initialize
window.serviceUrl = {
  mapApiUrl: '',
  socketUrl: '',
  mapDataUrl: '',
};
const undo = r => (state, action) => {
  const newState = r(state, action);

  if (action.type === 'login/logout') {
    // 清空实时数据
    for (const i in constantlyModal) {
      if (Object.prototype.hasOwnProperty.call(constantlyModal, i)) {
        delete constantlyModal[i];
      }
    }
    for (const i in infoPopsModal) {
      if (Object.prototype.hasOwnProperty.call(infoPopsModal, i)) {
        delete infoPopsModal[i];
      }
    }
    for (const i in constantlyPanelModal) {
      if (Object.prototype.hasOwnProperty.call(constantlyPanelModal, i)) {
        delete constantlyPanelModal[i];
      }
    }
    infoConstantly.intervalTime = 1000 * 3;
    infoConstantly.data = {};
    return newState;
  } else {
    return newState;
  }
};
const onError = (e, dispatch) => {
  if (Number(e.message) === 0) {
    Modal.error({
      title: '该账户未经认证',
      content: '将跳转至登录页.',
      okText: '确定',
      onOk: () => {
        dispatch({
          type: 'login/logout',
        });
      },
    });
  }
  e.preventDefault();
};
const app = dva({
  history: createHistory(),
  onError,
  // onReducer: undo,
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');


FastClick.attach(document.body);

export default app._store;  // eslint-disable-line
