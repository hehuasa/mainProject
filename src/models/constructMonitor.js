import { constructMonitorList, getAreaByOrgID, orgList } from '../services/api';

// 获取组织对应的区域
const getAreas = (area, item) => {
  console.log('area', area);
  // for (const areaData of area.data) {
  //   item.areas.push({ areaId: Number(areaData.gISCode), areaName: area.data[0].areaName });
  // }
  if (area.data[0]) {
    item.areas.push({ areaId: Number(area.data[0].gISCode), areaName: area.data[0].areaName });
  }
};
// 将数据按照区域分组
const groupingByAreas = (data) => {
  const array = [];
  for (const item of data) {
    for (const area of item.areas) {
      const index = array.findIndex(value => value.area.areaId === area.areaId);
      if (index !== -1) {
        array[index].count += 1;
        array[index].data.push(item);
      } else {
        array.push({
          area,
          count: 1,
          data: [item],
        });
      }
    }
  }
  return array;
};
export default {
  namespace: 'constructMonitor',

  state: {
    list: [],
    groupingList: [],
    mapSelectedList: { list: [] },
    orgList: [],
  },

  effects: {
    // 作业监控列表
    * fetchConstructMonitorList({ payload }, { call, put }) {
      const { data } = yield call(constructMonitorList, payload);
      // 获取对应的区域
      for (const item of data) {
        const { orgID } = item;
        item.areas = [];
        const area = yield call(getAreaByOrgID, { orgID });
        yield getAreas(area, item);
      }
      // 分组
      const groupingList = groupingByAreas(data);
      yield put({
        type: 'queryList',
        payload: data,
      });
      yield put({
        type: 'queryGroupList',
        payload: groupingList,
      });
    },
    // 根据ID请求组织信息
    // *getOrgById(payload, { call, put }) {
    //     const response = yield call(orgGet, payload.payload);
    //     yield put({
    //         type: 'queryCurrentOrg',
    //         payload: response,
    //     });
    // },
    // 请求所有组织信息
    * fetchOrgList(_, { call, put }) {
      const response = yield call(orgList);
      yield put({
        type: 'queryOrgList',
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
    queryOrgList(state, { payload }) {
      return {
        ...state,
        orgList: payload,
      };
    },
    queryGroupList(state, { payload }) {
      return {
        ...state,
        groupingList: payload,
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
