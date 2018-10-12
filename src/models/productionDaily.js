import {
  getDeviceProduction, updateDeviceProduction, getCrackingFurnace, getPowerConsumption,
  updatePowerConsumption, updateCrackingFurnace, getRawMaterial, updateRawMaterial, getSteamBalance,
  getProductionStatus, updateProductionStatus, updateSteamBalance, getDailyProduction,
  getRptAlternatorHistoryData, getRptHotFurnaceHistoryData, getOrganicProductHistoryData, getRptResinReportHistoryData, getProRptRawInfoHistoryData,
  getEquipmentProductInfoHistoryData, getDissociationHistoryData, getThermoelectricFurnace,
  getDynamotor, getOrganicProduct, getResinProduct, getSolidDefects,
  getTimeUsePre, productionStatusPage, getRecycledWater, getWasteWater,
} from '../services/api';
import { checkCode } from '../utils/utils';

export default {
  namespace: 'productionDaily',
  state: {
    // 所有装置信息
    list: [],
    // 装置生产情况
    deviceProduction: [],
    timeUsePre: 0,
    // 裂解炉运行
    crackingFurnace: [],
    // 热电炉运行情况
    thermoelectricFurnace: [],
    // 发电机运行状况
    dynamotor: [],
    // 生产情况
    productionStatus: [],
    // 原材料
    rawMaterial: [],
    // 有机产品
    organicProduct: [],
    // 树脂产品
    resinProduct: [],
    // 固体残次品
    solidDefects: [],
    // 动力消耗
    powerConsumption: [],
    // 水循环
    recycledWater: [],
    // 蒸汽平衡
    steamBalance: {},
    // 生产污水和氮气平衡
    wasteWater: {},
    // 查询时间
    startTimes: null,
    history: [],
    productionStatusPage: {
      data: [],
      pagination: {},
    },
  },
  effects: {
    // 请求所有信息列表
    *fetchList(_, { put, call }) {
      const response = yield call(getDailyProduction);
      yield put({
        type: 'queryList',
        payload: response.data,
      });
    },
    // 请求装置生产情况
    *getDeviceProduction({ payload }, { put, call }) {
      const response = yield call(getDeviceProduction, payload);
      yield put({
        type: 'saveDeviceProduction',
        payload: response.data,
      });
    },
    // 获取时间进度
    *getTimeUsePre({ payload }, { put, call }) {
      const { data } = yield call(getTimeUsePre, payload);
      yield put({
        type: 'queryTimeUsePre',
        payload: data,
      });
    },
    *updateDeviceProduction({ payload }, { put, call }) {
      const res = yield call(updateDeviceProduction, payload);
      if (res.code === 1001) {
        const response = yield call(getDeviceProduction, payload);
        yield put({
          type: 'saveDeviceProduction',
          payload: response.data,
        });
      }
    },
    //  请求裂解炉运行情况
    *getCrackingFurnace({ payload }, { put, call }) {
      const response = yield call(getCrackingFurnace, payload);
      yield put({
        type: 'saveCrackingFurnace',
        payload: response.data,
      });
    },
    //  修改裂解炉运行情况
    *updateCrackingFurnace({ payload }, { put, call }) {
      const update = yield call(updateCrackingFurnace, payload);
      if (update.code === 1001) {
        const response = yield call(getCrackingFurnace, { equipmentRunStateID: 1 });
        yield put({
          type: 'saveCrackingFurnace',
          payload: response.data,
        });
      }
    },
    //  请求热电炉运行情况
    *getThermoelectricFurnace({ payload }, { put, call }) {
      const response = yield call(getThermoelectricFurnace, payload);
      yield put({
        type: 'saveThermoelectricFurnace',
        payload: response.data,
      });
    },
    //  修改热电炉运行情况
    *updateThermoelectricFurnace({ payload }, { put, call }) {
      const update = yield call(updateCrackingFurnace, payload);
      if (update.code === 1001) {
        const response = yield call(getCrackingFurnace, { equipmentRunStateID: 2 });
        yield put({
          type: 'saveThermoelectricFurnace',
          payload: response.data,
        });
      }
    },
    //  请求发电机运行情况
    *getDynamotor({ payload }, { put, call }) {
      const response = yield call(getDynamotor, payload);
      yield put({
        type: 'saveDynamotor',
        payload: response.data,
      });
    },
    //  修改热电炉运行情况
    *updateDynamotor({ payload }, { put, call }) {
      const update = yield call(updateCrackingFurnace, payload);
      if (update.code === 1001) {
        const response = yield call(getCrackingFurnace, { equipmentRunStateID: 3 });
        yield put({
          type: 'saveDynamotor',
          payload: response.data,
        });
      }
    },
    //  请求动力消耗
    *getPowerConsumption({ payload }, { put, call }) {
      const response = yield call(getPowerConsumption, payload);
      yield put({
        type: 'savePowerConsumption',
        payload: response.data,
      });
    },
    //  修改动力消耗
    *updatePowerConsumption({ payload }, { put, call }) {
      const update = yield call(updatePowerConsumption, payload);
      if (update.code === 1001) {
        const response = yield call(getPowerConsumption, { powerConsumetype: 1 });
        yield put({
          type: 'savePowerConsumption',
          payload: response.data,
        });
      }
    },
    //  请求原材料
    *getRawMaterial({ payload }, { put, call }) {
      const response = yield call(getRawMaterial, payload);
      yield put({
        type: 'saveRawMaterial',
        payload: response.data,
      });
    },
    //  修改原材料
    *updateRawMaterial({ payload }, { put, call }) {
      const update = yield call(updateRawMaterial, payload);
      if (update.code === 1001) {
        const response = yield call(getRawMaterial, { rawInfoType: 112.101 });
        yield put({
          type: 'saveRawMaterial',
          payload: response.data,
        });
      }
    },
    // 请求有机产品
    *getOrganicProduct({ payload }, { put, call }) {
      const response = yield call(getOrganicProduct, payload);
      yield put({
        type: 'saveOrganicProduct',
        payload: response.data,
      });
    },
    //  修改有机产品
    *updateOrganicProduct({ payload }, { put, call }) {
      const update = yield call(updateRawMaterial, payload);
      if (update.code === 1001) {
        const response = yield call(getRawMaterial, { rawInfoType: 112.102 });
        yield put({
          type: 'saveOrganicProduct',
          payload: response.data,
        });
      }
    },
    // 请求树脂
    *getResinProduct({ payload }, { put, call }) {
      const response = yield call(getResinProduct, payload);
      yield put({
        type: 'saveResinProduct',
        payload: response.data,
      });
    },
    //  修改树脂产品
    *updateResinProduct({ payload }, { put, call }) {
      const update = yield call(updateRawMaterial, payload);
      if (update.code === 1001) {
        const response = yield call(getRawMaterial, { rawInfoType: 112.103 });
        yield put({
          type: 'saveResinProduct',
          payload: response.data,
        });
      }
    },
    // 全厂蒸汽平衡
    *getSteamBalance({ payload }, { put, call }) {
      const response = yield call(getSteamBalance, payload);
      yield put({
        type: 'saveSteamBalance',
        payload: response.data,
      });
    },
    // 修改蒸汽平衡
    *updateSteamBalance({ payload }, { put, call }) {
      yield call(updateSteamBalance, payload);
      const response = yield call(getSteamBalance, { itemType: 1 });
      yield put({
        type: 'saveSteamBalance',
        payload: response.data,
      });
    },
    // 生产污水
    *getWasteWater({ payload }, { put, call }) {
      const response = yield call(getWasteWater, payload);
      yield put({
        type: 'saveWasteWater',
        payload: response.data,
      });
    },
    // 修改生产污水
    *updateWasteWater({ payload }, { put, call }) {
      yield call(updateSteamBalance, payload);
      const response = yield call(getSteamBalance, { itemType: 2 });
      yield put({
        type: 'saveWasteWater',
        payload: response.data,
      });
    },
    //  请求循环水 与动力消耗同一接口 参数不同 powerConsumetype
    *getRecycledWater({ payload }, { put, call }) {
      const response = yield call(getRecycledWater, payload);
      yield put({
        type: 'saveRecycledWater',
        payload: response.data,
      });
    },
    //  修改循环水
    *updateRecycledWater({ payload }, { put, call }) {
      const update = yield call(updatePowerConsumption, payload);
      if (update.code === 1001) {
        const response = yield call(getPowerConsumption, { powerConsumetype: 2 });
        yield put({
          type: 'saveRecycledWater',
          payload: response.data,
        });
      }
    },
    //  请求生产情况
    *getProductionStatus({ payload }, { put, call }) {
      const response = yield call(getProductionStatus, payload);
      yield put({
        type: 'saveProductionStatus',
        payload: response.data,
      });
    },
    //  请求生产情况 分页 维护页面用
    *productionStatusPage({ payload }, { put, call }) {
      const response = yield call(productionStatusPage, payload);
      yield put({
        type: 'saveProductionStatusPage',
        payload: response.data,
      });
    },
    //  修改生产情况
    *updateProductionStatus({ payload }, { put, call }) {
      const update = yield call(updateProductionStatus, payload);
      checkCode(update);
    },
    // 请求历史数据(装置生产情况)
    *getEquipmentProductInfoHistoryData({ payload }, { put, call }) {
      const response = yield call(getEquipmentProductInfoHistoryData, payload);
      yield put({
        type: 'queryHistory',
        payload: response.data,
      });
    },
      // 请求历史数据(裂解炉)
      *getDissociationHistoryData({ payload }, { put, call }) {
          const response = yield call(getDissociationHistoryData, payload);
          yield put({
              type: 'queryHistory',
              payload: response.data,
          });
      },
      // 请求历史数据(热电炉)
      *getRptHotFurnaceHistoryData({ payload }, { put, call }) {
          const response = yield call(getRptHotFurnaceHistoryData, payload);
          yield put({
              type: 'queryHistory',
              payload: response.data,
          });
      },
      // 请求历史数据(发电机)
      *getRptAlternatorHistoryData({ payload }, { put, call }) {
          const response = yield call(getRptAlternatorHistoryData, payload);
          yield put({
              type: 'queryHistory',
              payload: response.data,
          });
      },
    // 请求历史数据(原材料)
    *getProRptRawInfoHistoryData({ payload }, { put, call }) {
      const response = yield call(getProRptRawInfoHistoryData, payload);
      yield put({
        type: 'queryHistory',
        payload: response.data,
      });
    },
    // 请求历史数据(有机产品)
    *getOrganicProductHistoryData({ payload }, { put, call }) {
      const response = yield call(getOrganicProductHistoryData, payload);
      yield put({
        type: 'queryHistory',
        payload: response.data,
      });
    },
    // 请求历史数据(树脂产品)
    *getRptResinReportHistoryData({ payload }, { put, call }) {
      const response = yield call(getRptResinReportHistoryData, payload);
      yield put({
        type: 'queryHistory',
        payload: response.data,
      });
    },
    // 请求固体残次品
    *getSolidDefects({ payload }, { put, call }) {
      const response = yield call(getSolidDefects, payload);
      yield put({
        type: 'saveSolidDefects',
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
    saveDeviceProduction(state, { payload }) {
      return {
        ...state,
        deviceProduction: payload,
      };
    },
    queryTimeUsePre(state, { payload }) {
      return {
        ...state,
        timeUsePre: payload,
      };
    },
    saveCrackingFurnace(state, { payload }) {
      return {
        ...state,
        crackingFurnace: payload,
      };
    },
    saveThermoelectricFurnace(state, { payload }) {
      return {
        ...state,
        thermoelectricFurnace: payload,
      };
    },
    saveDynamotor(state, { payload }) {
      return {
        ...state,
        dynamotor: payload,
      };
    },
    savePowerConsumption(state, { payload }) {
      return {
        ...state,
        powerConsumption: payload,
      };
    },
    saveStartTimes(state, { payload }) {
      return {
        ...state,
        payload,
      };
    },
    saveRawMaterial(state, { payload }) {
      return {
        ...state,
        rawMaterial: payload,
      };
    },
    saveOrganicProduct(state, { payload }) {
      return {
        ...state,
        organicProduct: payload,
      };
    },
    saveResinProduct(state, { payload }) {
      return {
        ...state,
        resinProduct: payload,
      };
    },
    saveSteamBalance(state, { payload }) {
      return {
        ...state,
        steamBalance: payload,
      };
    },
    saveWasteWater(state, { payload }) {
      return {
        ...state,
        wasteWater: payload,
      };
    },
    saveRecycledWater(state, { payload }) {
      return {
        ...state,
        recycledWater: payload,
      };
    },
    saveProductionStatus(state, { payload }) {
      return {
        ...state,
        productionStatus: payload,
      };
    },
    queryHistory(state, { payload }) {
      return {
        ...state,
        history: payload,
      };
    },
    saveSolidDefects(state, { payload }) {
      return {
        ...state,
        solidDefects: payload,
      };
    },
    saveProductionStatusPage(state, { payload }) {
      return {
        ...state,
        productionStatusPage: {
          data: payload.result,
          pagination: {
            current: payload.pageNum,
            pageSize: payload.pageSize,
            total: payload.sumCount,
          },
        },
      };
    },
  },
};
