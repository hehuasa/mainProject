import { response } from '../../mock/vocsData';
// import { vocsList } from '../services/api';

export default {
  namespace: 'vocsMonitor',

  state: {
    list: [],
    mapSelectedList: { list: [], areaName: '', keys: [] },
  },

  effects: {
    // 获取列表
    * fetchList({ payload }, { call, put }) {
      // const response = yield call(vocsList, payload);
      console.log('response.data.length', response.data.length);
      console.log('response.data', response.data);
      const newData = response.data.filter(value => value.gisCode);
      yield put({
        type: 'queryList',
        payload: newData,
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
