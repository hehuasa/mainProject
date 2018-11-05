import { getEmgcResource } from '../services/api';

export default {
  namespace: 'emgcResource',
  state: {
    data: { result: [] },
  },

  effects: {
    // 获取分页数据
    *fetchEmgcResourcePage({ payload }, { call, put }) {
      const { data } = yield call(getEmgcResource, payload);
      yield put({
        type: 'queryEmgcResourcePage',
        payload: data,
      });
    },
  },

  reducers: {
    queryEmgcResourcePage(state, { payload }) {
      return {
        ...state,
        data: payload,
      };
    },
  },
};
