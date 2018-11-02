// import { response } from '../../mock/vocsData';
import { vocsList } from '../services/api';

export default {
  namespace: 'vocsMonitor',

  state: {
    list: [],
    mapSelectedList: { list: [], areaName: '', keys: [] },
  },

  effects: {
    // 获取列表
    * fetchList({ payload }, { call, put }) {
      const response = yield call(vocsList, payload);
      yield put({
        type: 'queryList',
        payload: response.data,
      });
    },
  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        list: payload,
      };
    },
    queryMapSelectedList(state, { payload }) {
      return {
        ...state,
        mapSelectedList: payload,
      };
    },
  },
};
