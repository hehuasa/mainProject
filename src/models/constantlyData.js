
import { lineData, getSelctData } from '../utils/Panel';
import { constantlyInfo, addDoorIcon, envMap } from '../utils/MapService';
import {
  getGuardCounting, getGuardDoorCounting, getConditionCalc, findByTime, getAllNewsData, getNewsData, getNewsDataByGroup, getNewsDataByCtrlResourceType,
  getHotFurnaceRunDay, getAlternatorRunDay, getDissociationRunDay,
} from '../services/api';
import { constantlyModal, constantlyPanelModal, constantlyConditionCalc } from '../services/constantlyModal';
// 公共函数，在地图显示各种实时专题数据
const thematicMaping = ({ type, view, deviceArray, searchText, searchFields = ['ObjCode'], graphics, constantlyComponents, map, dispatch, scale }) => {
  const devices = [];
  const cacheObj = {};
  if (constantlyComponents.findIndex(value => value.type === type) === -1) {
    constantlyComponents.push({ type });
  }
  // 缓存数组，处理多条指标的情况
  for (const item of deviceArray) {
    if (cacheObj[item.gISCode] === undefined) {
      cacheObj[item.gISCode] = item;
      cacheObj[item.gISCode].valueArry = [];
      cacheObj[item.gISCode].valueArry.push({ dataTypeName: item.dataTypeName, value: `${item.value} ${item.meterUnit}` });
    } else {
      cacheObj[item.gISCode].valueArry.push({ dataTypeName: item.dataTypeName, value: `${item.value} ${item.meterUnit}` });
    }
  }
  // 如果已经传入地图信息，则不执行搜索
  if (graphics) {
    for (const [_, device] of Object.entries(cacheObj)) {
      for (const graphic of graphics) {
        if (Number(device[searchText]) === Number(graphic.attributes[searchFields])) {
          devices.push({ device: graphic, attributes: device });
          break;
        }
      }
    }
    const domType = 'constantly';
    constantlyInfo(map, view, dispatch, devices, type, constantlyComponents, domType, scale);
  }
  dispatch({
    type: 'resourceTree/saveUniqueKey',
    payload: new Date().getTime(),
  });
};
const thematicMapingDoor = ({ type, deviceArray, view, searchText, searchFields = ['ObjCode'], graphics, constantlyComponents, map, dispatch, domType, scale }) => {
  const devices = [];
  const cacheObj = {};
  // if (constantlyComponents.findIndex(value => value.type === type) === -1) {
  //   constantlyComponents.push({ type });
  // }
  // 缓存数组，处理多条指标的情况
  for (const item of deviceArray) {
    if (cacheObj[item.gISCode] === undefined) {
      cacheObj[item.gISCode] = item;
      cacheObj[item.gISCode].valueArry = [];
      cacheObj[item.gISCode].valueArry.push({ dataTypeName: item.dataTypeName, value: `${item.value} ${item.meterUnit}` });
    } else {
      cacheObj[item.gISCode].valueArry.push({ dataTypeName: item.dataTypeName, value: `${item.value} ${item.meterUnit}` });
    }
  }
  // 如果已经传入地图信息，则不执行搜索
  if (graphics) {
    for (const [_, device] of Object.entries(cacheObj)) {
      for (const graphic of graphics) {
        if (Number(device[searchText]) === Number(graphic.attributes[searchFields])) {
          devices.push({ device: graphic, attributes: device });
          break;
        }
      }
    }
    constantlyInfo(map, view, dispatch, devices, type, [], domType, scale, true);
  }
};
// 看板实时数据处理
const storeRealData = ({ type, resourceID, response }) => {
  if (constantlyPanelModal[type]) {
    if (constantlyPanelModal[type].data) {
      constantlyPanelModal[type].data[resourceID] = response.data;
    } else {
      constantlyPanelModal[type].data = {};
      constantlyPanelModal[type].data[resourceID] = response.data;
    }
  } else {
    constantlyPanelModal[type] = { data: {}, resourceIDs: [], temp: response.data };
  }
  const lineRealData = lineData({ line: constantlyPanelModal[type] }); // 数据转曲线对象数据

  constantlyPanelModal[type].lineRealData = lineRealData;
  if (constantlyPanelModal[type].checkedList === undefined || constantlyPanelModal[type].checkAll === true) {
    constantlyPanelModal[type].plainOptions = lineRealData.dot; // 所有点位 固定
    constantlyPanelModal[type].checkedList = lineRealData.dot; // 显示的点位
    constantlyPanelModal[type].indeterminate = false; // 判断是否已经被全选
    constantlyPanelModal[type].checkAll = true; // 判断是否选择全部 全选为true
  } else {
    const addDot = [];
    for (const item of lineRealData.dot) {
      if (constantlyPanelModal[type].plainOptions.indexOf(item) === -1) {
        addDot.push(item);
      }
    }
    constantlyPanelModal[type].plainOptions = lineRealData.dot;
    constantlyPanelModal[type].checkedList = constantlyPanelModal[type].checkedList.concat(addDot);
    constantlyPanelModal[type].indeterminate = true; // 判断是否已经被全选，有没有被选中的就为true
    constantlyPanelModal[type].checkAll = false; // 判断是否选择全部 全不选为false
    showDot = null;
  }
  if (constantlyPanelModal[type].targetCheckAll === undefined || constantlyPanelModal[type].targetCheckAll === true) {
    constantlyPanelModal[type].target = lineRealData.target; // 所有指标 固定
    constantlyPanelModal[type].targetCheckedList = lineRealData.target; // 显示的指标
    constantlyPanelModal[type].targetIndeterminate = false; // 判断是否已经被全选
    constantlyPanelModal[type].targetCheckAll = true; // 判断是否选择全部 全选为true
  } else {
    const addTarget = [];
    for (const item of lineRealData.target) {
      if (constantlyPanelModal[type].target.indexOf(item) === -1) {
        addTarget.push(item);
      }
    }
    constantlyPanelModal[type].target = lineRealData.target; // 所有指标 固定
    constantlyPanelModal[type].targetCheckedList = constantlyPanelModal[type].targetCheckedList.concat(addTarget);
    constantlyPanelModal[type].targetIndeterminate = true; // 判断是否已经被全选
    constantlyPanelModal[type].targetCheckAll = false; // 判断是否选择全部
  }
};

export default {
  namespace: 'constantlyData',
  state: {
    // 专题图实时数据
    thematicMap: { isloaded: false, data: {} },
    constantlyComponents: [],
    // 质量检测实时数据
    analysisPoint: {}, // 在线分析点位的实时数据
    analysisPointList: {}, // 区域在线分析点位的实时数据列表
    showLevel: 'plantLevel',
    //  危险源区域code
  },
  effects: {
    // 请求专题图实时数据
    *getConstantlyData({ payload }, { call }) {
      const { type, searchText, map, view, dispatch, searchFields, graphics, constantlyComponents, scale } = payload;
      const response = yield call(getAllNewsData, payload.param);
      thematicMaping({ type, view, deviceArray: constantlyModal[payload.type].data = response.data, searchText, map, dispatch, searchFields, graphics, constantlyComponents, scale });
    },
    // 请求区域（门禁）信息
    *getGuardAreaCounting({ payload }, { call }) {
      const { type, searchText, map, view, dispatch, searchFields, graphics, constantlyComponents, domType, scale } = payload;
      const response = yield call(getGuardCounting);
      thematicMapingDoor({ type, view, deviceArray: constantlyModal[payload.type].data = response.data, searchText, map, dispatch, searchFields, graphics, domType, scale });
    },
    // 设备监测实时值
    *getDeviceMonitorData({ payload }, { call }) {
      const response = yield call(getAllNewsData, payload);
      let runDayUrl;
      switch (payload.selectRunDay) {
        case 'proRptAlternatorInfo':
          runDayUrl = getAlternatorRunDay;
          break;
        case 'proRptDissociationInfo':
          runDayUrl = getDissociationRunDay;
          break;
        case 'proRptHotFurnaceInfo':
            runDayUrl = getHotFurnaceRunDay;
            break;
        default: break;
      }
      // const rundayData = yield call(runDayUrl, { date: new Date().getTime() });
      const runDayData = yield call(runDayUrl, { date: 1538958903000 });
      if (constantlyModal[payload.ctrlResourceType] === undefined) {
        constantlyModal[payload.ctrlResourceType] = {};
        constantlyModal[payload.ctrlResourceType].data = response.data;
        constantlyModal[payload.ctrlResourceType].runDayData = runDayData.data;
      } else {
        constantlyModal[payload.ctrlResourceType].data = response.data;
        constantlyModal[payload.ctrlResourceType].runDayData = runDayData.data;
      }
    },
    *getGuardDoorCounting({ payload }, { call }) {
      const responseDoor = yield call(getGuardDoorCounting);
      const responseArea = yield call(getGuardCounting);
      yield constantlyModal[payload.domTypeDoor].data = responseDoor.data;
      yield constantlyModal[payload.domTypeArea].data = responseArea.data;
    },
    *getImmediateData({ payload }, { call }) {
      const response = yield call(getNewsData, {
        resourceID: payload.resourceID,
      });
      storeRealData({ type: payload.type, resourceID: payload.resourceID, response });
    },
    // 请求阈值
    *getConditionCalc({ payload }, { call }) {
      if (constantlyConditionCalc[payload.dataType] === undefined) {
        const { data } = yield call(getConditionCalc, payload);
        const obj = {
            minValue: data[0].startValue,
            maxValue: data[0].endValue,
            conditionCalc: [],
            quotaName: data[0].baseConditionCalc.dataItem.quotaName,
        };
        for (const item of data) {
          const { alarmType, baseConditionExpressShowInfoVOS } = item;
          const type = { name: alarmType.alarmTypeName, level: alarmType.dangerCoefficient };
          const range = [];
          for (const item1 of baseConditionExpressShowInfoVOS) {
            range.push({
              start: item1.startValue,
              end: item1.endValue,
            });
          }
            obj.conditionCalc.push({ type, range });
        }
          obj.conditionCalc.sort((a, b) => {
              return a.range[0].start - b.range[0].start;
          });
        constantlyConditionCalc[payload.dataType] = obj;
      }
    },
    // 点击加入看板请求曲线图实时数据
    *getHistoryData({ payload }, { call }) {
      const resourceID = payload.resourceID.slice(0, payload.resourceID.indexOf('&'));
      const response = yield call(findByTime, {
        resourceID,
        beginTime: payload.beginTime,
        endTime: payload.endTime,
      });
      storeRealData({ type: payload.type, resourceID: payload.resourceID, response });
    },
    // 请求环保实时数据(根据控制类型)
    *getNewsDataByCtrlResourceType({ payload }, { call }) {
      const { view, map, graphics, dispatch, ctrlResourceType, treeID } = payload;
      const { data } = yield call(getNewsDataByCtrlResourceType, { ctrlResourceType });

      if (constantlyModal.env) {
        if (constantlyModal.env[treeID]) {
          constantlyModal.env.data = data;
          envMap({ view, map, graphics, dispatch });
        }
      }
    },
    // 请求环保实时数据(根据分组ID)
    *getNewsDataByGroup({ payload }, { call }) {
      const { view, map, graphics, dispatch, groupID, treeID } = payload;
      const { data } = yield call(getNewsDataByGroup, { groupID });

      if (constantlyModal.env) {
        if (constantlyModal.env[treeID]) {
          constantlyModal.env.data = data;
          envMap({ view, map, graphics, dispatch });
        }
      }
    },
  },
  reducers: {
    // 存储实时专题的值
    saveThematicMap(state, { payload }) {
      return {
        ...state,
        thematicMap: { isloaded: true, data: payload },
      };
    },
    // 存储门禁及区域的值
    saveGuardCounting(state, { payload }) {
      return {
        ...state,
        guardAreaCounting: payload,
      };
    },
    saveDoorCounting(state, { payload }) {
      return {
        ...state,
        guardDoorCounting: payload,
      };
    },
    // 实时专题图
    constantlyInfo(state, { payload }) {
      return {
        ...state,
        constantlyValue: payload,
      };
    },
    // 门禁实时专题图
    doorConstantlyInfo(state, { payload }) {
      return {
        ...state,
        doorConstantlyValue: payload,
      };
    },
    // 门禁区域实时专题图
    doorAreaConstantlyInfo(state, { payload }) {
      return {
        ...state,
        doorAreaConstantlyValue: payload,
      };
    },
    // 气体实时专题图
    gasConstantlyInfo(state, { payload }) {
      return {
        ...state,
        gasConstantlyValue: payload,
      };
    },
    // 环保实时专题图
    envConstantlyInfo(state, { payload }) {
      return {
        ...state,
        envConstantlyValue: payload,
      };
    },
    // Voc实时专题图
    vocConstantlyInfo(state, { payload }) {
      return {
        ...state,
        vocConstantlyValue: payload,
      };
    },
    // 质量检测地图显示级别 showLevel
    saveShowLevel(state, { payload }) {
      return {
        ...state,
        showLevel: payload,
      };
    },
    // 气体实时数据
    gas(state, { payload }) {
      return {
        ...state,
        gas: {
          ...state.gas,
          temp: payload,
        },
      };
    },
    updataGas(state, { payload }) {
      return {
        ...state,
        gas: payload,
      };
    },
    // 外排口实时数据
    outerDrain(state, { payload }) {
      return {
        ...state,
        outerDrain: {
          ...state.outerDrain,
          temp: payload,
        },
      };
    },
    // 更新外排口实时数据
    updataOuterDrain(state, { payload }) {
      return {
        ...state,
        outerDrain: payload,
      };
    },
    // 水监控实时数据
    waterMonitoring(state, { payload }) {
      return {
        ...state,
        waterMonitoring: {
          ...state.waterMonitoring,
          temp: payload,
        },
      };
    },
    // 更新水监控实时数据
    updataWaterMonitoring(state, { payload }) {
      return {
        ...state,
        waterMonitoring: payload,
      };
    },

    // 电监控实时数据
    electricityMonitoring(state, { payload }) {
      return {
        ...state,
        electricityMonitoring: {
          ...state.electricityMonitoring,
          temp: payload,
        },
      };
    },
    // 更新电监控实时数据
    updataElectricityMonitoring(state, { payload }) {
      return {
        ...state,
        electricityMonitoring: payload,
      };
    },

    // 汽监控实时数据
    gasMonitoring(state, { payload }) {
      return {
        ...state,
        gasMonitoring: {
          ...state.gasMonitoring,
          temp: payload,
        },
      };
    },
    // 更新汽监控实时数据
    updataGasMonitoring(state, { payload }) {
      return {
        ...state,
        gasMonitoring: payload,
      };
    },

    // 风监控实时数据
    windMonitoring(state, { payload }) {
      return {
        ...state,
        windMonitoring: {
          ...state.windMonitoring,
          temp: payload,
        },
      };
    },
    // 更新风监控实时数据
    updataWindMonitoring(state, { payload }) {
      return {
        ...state,
        windMonitoring: payload,
      };
    },

    saveGasResourceIDs(state, { payload }) {
      return {
        ...state,
        gas: {
          ...state.gas,
          resourceIDs: payload,
        },
      };
    },
    saveEnvrResourceIDs(state, { payload }) {
      return {
        ...state,
        outerDrain: {
          ...state.outerDrain,
          resourceIDs: payload,
        },
      };
    },
    // 实时专题图列表与数据
    queryConstantlyComponents(state, { payload }) {
      return {
        ...state,
        constantlyComponents: payload,
      };
    },

  },
};
