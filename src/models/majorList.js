import { addMajorInfo, deleteMajorInfo, majorInfoPage, updateMajorrInfo, majorInfoPageList } from '../services/api';
import { commonData } from '../../mock/commonData';
import { checkCode } from '../utils/utils';

export default {
  namespace: 'majorList',
  state: {
    data: {
      data: [],
      pagination: {},
    },
    list: {
      data: [],
    },
    toggle: true,
  },
  effects: {
    *page(payload, { call, put }) {
      const response = yield call(majorInfoPage, payload.payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add(payload, { call, put }) {
      const response = yield call(addMajorInfo, payload.payload);
      checkCode(response);
    },
    *delete(payload, { call, put }) {
      const response = yield call(deleteMajorInfo, { id: payload.payload });
      checkCode(response);
    },
    // *get(payload, { call, put }) {
    //   const response = yield call(getUserInfo, payload.payload);
    //   if (response.code === 1001) {
    //     yield put({
    //       type: 'user',
    //       payload: response,
    //     });
    //   }
    // },
    *update(payload, { call, put }) {
      const response = yield call(updateMajorrInfo, payload.payload);
      checkCode(response);
    },
    *queryMajorContent(_, { call, put }) {
      const list = yield call(majorInfoPageList);
      yield put({
        type: 'saveList',
        payload: typeof list.data === 'object' ? list : { data: [] },
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: {
          data: action.payload.data.result,
          pagination: {
            current: action.payload.data.pageNum,
            pageSize: action.payload.data.pageSize,
            total: action.payload.data.sumCount,
          },
        },
        toggle: action.toggle,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    // user(state, action) {
    //   return {
    //     ...state,
    //     user: action.payload,
    //   };
    // },
  },
};
