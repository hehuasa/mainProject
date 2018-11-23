
export default {
  namespace: 'mapRelation',
  state: {
    popupShow: true,
    spaceQueryPop: {
      load: false,
      show: false,
      point: {},
      screenPoint: {},
      style: { left: 0, top: 0 },
    },
    infoPops: [],
    clusterPopups: [],
    clusterPopup: { show: false, load: false, data: [] },
    resourceClusterPopup: { show: false, load: false, data: [] },
    alarmClusterPopup: { show: false, load: false, data: [] },
    constructMonitorClusterPopup: { show: false, load: false, data: [] },
    paPopup: { show: false, load: false, data: [] },
    accessPops: { show: false, load: false, data: [] },
    vocsPopup: { show: false, load: false, data: [] },
  },
  effects: {
    // 增加地图聚合气泡窗
    *addClusterPopup({ payload }, { put, select }) {
      // 改变聚合气泡窗顺序
      const { type, data } = payload;
      const newMapRelation = yield select(({ mapRelation }) => mapRelation.clusterPopups);
      const index = newMapRelation.findIndex(value => value.type === type);
      if (index === -1) {
        newMapRelation.unshift({ type, index: newMapRelation.length });
      } else {
        newMapRelation.splice(index, 1);
        newMapRelation.unshift({ type, index: newMapRelation.length });
      }
      // newMapRelation.sort((a, b) => b.index - a.index);
      yield put({
        type: 'queryClusterPopups',
        payload: newMapRelation,
      });
      yield put({
        type,
        payload: data,
      });
    },
    *delClusterPopup({ payload }, { put, select }) {
      // 改变聚合气泡窗顺序
      const { type, data } = payload;
      const newMapRelation = yield select(({ mapRelation }) => mapRelation.clusterPopups);
      const index = newMapRelation.findIndex(value => value.type === type);
      if (index !== -1) {
        newMapRelation.splice(index, 1);
        // newMapRelation.sort((a, b) => b.index - a.index);
        yield put({
          type: 'queryClusterPopups',
          payload: newMapRelation,
        });
      }
      yield put({
        type,
        payload: data,
      });
    },
  },
  reducers: {
    // 统一控制气泡显示
    showPopup(state, { payload }) {
      return {
        ...state,
        popupShow: payload,
      };
    },
    // 弹窗组
    queryInfoPops(state, { payload }) {
      return {
        ...state,
        infoPops: payload,
      };
    },
    // 资源聚合的popup
    resourceClusterPopup(state, { payload }) {
      return {
        ...state,
        resourceClusterPopup: payload,
      };
    },
    // 门禁的popup
    accessPops(state, { payload }) {
      return {
        ...state,
        accessPops: payload,
      };
    },
    // 聚合的popup
    queryClusterPopup(state, { payload }) {
      return {
        ...state,
        clusterPopup: payload,
      };
    },
    // 报警聚合
    alarmClusterPopup(state, { payload }) {
      return {
        ...state,
        alarmClusterPopup: payload,
      };
    },
    // vocs的popup
    vocsPopup(state, { payload }) {
      return {
        ...state,
        vocsPopup: payload,
      };
    },
    // 作业监控popup
    constructMonitorClusterPopup(state, { payload }) {
      return {
        ...state,
        constructMonitorClusterPopup: payload,
      };
    },
    // 地图工具栏，控制点击样式与事件的index
    queryToolsBtnIndex(state, { payload }) {
      return {
        ...state,
        toolsBtnIndex: payload,
      };
    },
    // 周边查询
    setSpaceQuery(state, { payload }) {
      return {
        ...state,
        spaceQueryPop: payload,
      };
    },
  },
};

