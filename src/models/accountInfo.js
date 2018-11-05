import {
  accountPage, addAccountInfo, getAccountInfo, deleteAccountInfo, exportAccountInfo, resetPwd, updateAccountInfo,
  accountRolePage
} from '../services/api';
import { commonData } from '../../mock/commonData';
import { checkCode } from '../utils/utils';

export default {
  namespace: 'accountInfo',
  state: {
    data: {
      data: [],
      pagination: {},
    },
    accountRolePage: {
      data: [],
      pagination: {},
    },
    account: {
      baseUserInfo: {},
    },
  },
  effects: {
    *page(payload, { call, put }) {
      const response = yield call(accountPage, payload.payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *accountRolePage(payload, { call, put }) {
      const response = yield call(accountRolePage, payload.payload);
      yield put({
        type: 'saveAccountRole',
        payload: response,
      });
    },
    *add(payload, { call, put }) {
      const response = yield call(addAccountInfo, payload.payload);
      checkCode(response);
      const userList = yield call(accountPage, commonData.pageInitial);
      yield put({
        type: 'save',
        payload: userList,
      });
    },
    *delete(payload, { call, put }) {
      const response = yield call(deleteAccountInfo, payload.payload);
      checkCode(response);
      if (response.code === 1001) {
        const userList = yield call(accountPage, commonData.pageInitial);
        yield put({
          type: 'save',
          payload: userList,
        });
      }
    },
    *reset(payload, { call }) {
      const response = yield call(resetPwd, payload.payload);
      checkCode(response);
    },
    *get(payload, { call, put }) {
      const response = yield call(getAccountInfo, payload.payload);
      yield put({
        type: 'saveAccount',
        payload: response,
      });
    },
    *update(payload, { call, put }) {
      const response = yield call(updateAccountInfo, payload.payload);
      checkCode(response);
      const accountList = yield call(accountPage, commonData.pageInitial);
      yield put({
        type: 'save',
        payload: accountList,
      });
    },
    *export(payload, { call }) {
      yield call(exportAccountInfo, payload.payload);
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
      };
    },
    saveAccountRole(state, action) {
      return {
        ...state,
        accountRolePage: {
          data: action.payload.data.result,
          pagination: {
            current: action.payload.data.pageNum,
            pageSize: action.payload.data.pageSize,
            total: action.payload.data.sumCount,
          },
        },
      };
    },
    saveAccount(state, action) {
      return {
        ...state,
        account: action.payload.data,
      };
    },
  },
};
