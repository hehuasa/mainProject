import {
  templateList, addTemplate, deleteTemplate, getTemplate, updateTemplate, templatePage,
  getOrgTreeData, getUserByOrgID, addMsgGroup, msgGroupPage, deleteMsgGroup, updateMsgGroup,
  getMsgGroup, addMsg, msgPage, resourcePage, professionPage, alarmTypePage, addMsgRule,
  msgRulePage, getMsgRule, deleteMsgRule, updateMsgRule,
} from '../services/api';
import { commonData } from '../../mock/commonData';
import { checkCode } from '../utils/utils';

export default {
  namespace: 'system',
  state: {
    data: {
      data: [],
      pagination: {},
    },
  },
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(templateList);
      yield put({
        type: 'saveList',
        payload: response.data,
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
      };
    },
  },
};
