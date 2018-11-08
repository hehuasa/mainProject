import { message } from 'antd';
import { getEmgcResource, addEmgcResource, delEmgcResource, selectMaterialCode, getUserPage } from '../services/api';

export default {
  namespace: 'emgcResource',
  state: {
    data: { result: [] },
    repeated: false,
    userData: { result: [] },
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
    // 新增
    *addEmgcResource({ payload }, { call }) {
      const res = yield call(addEmgcResource, payload);
      if (Number(res.code) !== 1001) {
        message.error('操作失败');
      }
    },
    // 删除
    *delEmgcResource({ payload }, { call }) {
      const res = yield call(delEmgcResource, payload);
      if (Number(res.code) !== 1001) {
        message.error('操作失败');
      }
    },
    // 查重
    *selectMaterialCode({ payload }, { call, put }) {
      const { data } = yield call(selectMaterialCode, payload);
      yield put({
        type: 'queryRepeated',
        payload: JSON.parse(data),
      });
    },
    // 查询用户
    *fetchUsers({ payload }, { call, put }) {
      const { data } = yield call(getUserPage, payload);
      yield put({
        type: 'queryUsers',
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
    queryRepeated(state, { payload }) {
      return {
        ...state,
        repeated: payload,
      };
    },
    queryUsers(state, { payload }) {
      return {
        ...state,
        userData: payload,
      };
    },
  },
};
