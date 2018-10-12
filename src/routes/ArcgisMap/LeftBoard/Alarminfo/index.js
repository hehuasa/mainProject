import React, { PureComponent } from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'dva';
import { Row, Col, Button, Collapse, Table, Checkbox, Divider, Radio, Pagination } from 'antd';
import styles from './index.less';
import UniversalTemplate from './RealTimeData/universalTemplate';
import { mapConstants } from '../../../../services/mapConstant';
import SourceOfRisk from './SourceOfRisk/index';
import levelGray from '../../../../assets/map/alarm/levelGray.png';
import levelRed from '../../../../assets/map/alarm/levelRed.png';
import { alarmStatus, getBrowserStyle, getBrowserScroll } from '../../../../utils/utils';
import { searchByAttr, addVideoIcon, changeIcon, transToPoint } from '../../../../utils/MapService';
import { infoConstantly, constantlyPanelModal, infoPopsModal } from '../../../../services/constantlyModal';
import { getRealHistoryData } from '../../../../utils/Panel';
import close from '../../../../assets/map/叉叉.png';

const CheckboxGroup = Checkbox.Group;

const RadioGroup = Radio.Group;
const getArray = (index1, length, array) => {
  if (index1 < length) {
    array.push(index1);
    index1 += 1;
    getArray(index1, length, array);
  }
  return array;
};
const Panel = Collapse.Panel;
const mapStateToProps = ({ map }) => {
  const { alarmBoardData, mapBoardShow } = map;
  return {
    alarmBoardData,
    mapBoardShow,
  };
};
@connect(({ map, resourceTree, alarm, panelBoard, constantlyData, alarmDeal, homepage, video }) => ({
  mainMap: mapConstants.mainMap,
  mapView: mapConstants.view,
  infoPops: map.infoPops,
  popupScale: map.popupScale,
  mapHeight: homepage.mapHeight,
  videoFooterHeight: homepage.videoFooterHeight,
  resourceTree,
  list: alarm.listWithFault,
  video,
  panelBoard,
  constantlyData,
  alarmBoardData: resourceTree.alarmBoardData,
  alarmDeal,
}))
class AlarmInfo extends PureComponent {
  state = {
    alarmSelectIndex: 0,
    selectedRows: { checkedVideos: [] }, // 表格中被选中的项
  };
  // 报警模板
  componentDidMount() {
    const { dispatch, list } = this.props;
    const { rowInfo, resourceInfo } = this.props.resourceTree;
    const { resourceID, ctrlResourceType } = resourceInfo;
    // 筛选报警信息
    const alarmList = list.filter(item => item.resourceCode === resourceInfo.resourceCode);
    const alarmBoardData = alarmList.length > 0 ? alarmList : {};
    this.props.dispatch({
      type: 'resourceTree/alarmBoardData',
      payload: alarmBoardData,
    });
    this.setState({
      alarmSelectIndex: alarmList.length > 0 ? alarmList.length - 1 : 0,
    });
    if (resourceInfo.extendFields) {
      // const { extendFields } = resourceInfo;
      // 根据资源ID 获取原料信息
      const { rawMaterialID } = rowInfo || {};
      dispatch({
        type: 'resourceTree/getByResourceID',
        payload: resourceID,
      }).then(() => {
        // 请求原料消防措施与物料危害
        if (rawMaterialID) {
          dispatch({
            type: 'resourceTree/materialHarmInfo',
            payload: { rawMaterialID, pageNum: 1, pageSize: 10000, isQuery: true, fuzzy: false },
          });
          dispatch({
            type: 'resourceTree/materialFireControl',
            payload: { rawMaterialID, pageNum: 1, pageSize: 10000, isQuery: true, fuzzy: false },
          });
        }
      });
    }
    //  请求监测资源与被检测资源
    if (resourceInfo && resourceInfo.resourceID) {
      //  根据资源ID，请求监测该资源的对象
      this.props.dispatch({
        type: 'resourceTree/getBeMonitorsByResourceID',
        payload: { resourceID: resourceInfo.resourceID, ctrlResourceType: '101.102.101' },
      });
      //  根据资源ID，请求该资源监测的对象
      this.props.dispatch({
        type: 'resourceTree/getMonitorsByResourceID',
        payload: { resourceID: resourceInfo.resourceID },
      });
    }
    // 请求实时数据
    if (ctrlResourceType.indexOf('102.102') === 0 || // 外排口
      ctrlResourceType.indexOf('101.107.102') === 0 || // 气体实时数据
      ctrlResourceType.indexOf('103.101.2') === 0 || // 水电汽风实时数据
      ctrlResourceType.indexOf('103.101.1') === 0 // 生产设备 大机组、发电机、锅炉、裂解炉
    ) {
      dispatch({
        type: 'resourceTree/getRealData',
        payload: { ctrlResourceType, resourceID: this.props.resourceTree.resourceInfo.resourceID },
      }).then(() => {
        // 请求阈值
        if (infoConstantly.data) {
          if (infoConstantly.data.universalData) {
            for (const data of infoConstantly.data.universalData) {
              const { dataCode, collectionName, dataType } = data;
              dispatch({
                type: 'constantlyData/getConditionCalc',
                payload: { dataCode, collectionName, dataType },
              });
            }
          }
        }
      });
      infoConstantly.intervalID = setInterval(() => {
        dispatch({
          type: 'resourceTree/getRealData',
          payload: { ctrlResourceType, resourceID: this.props.resourceTree.resourceInfo.resourceID },
        }).then(() => {

          // 请求阈值
          // if (infoConstantly.data) {
          //   if (infoConstantly.data.universalData) {
          //     for (const data of infoConstantly.data.universalData) {
          //       const { dataCode, collectionName, dataType } = data;
          //       dispatch({
          //         type: 'constantlyData/getConditionCalc',
          //         payload: { dataCode, collectionName, dataType },
          //       });
          //     }
          //   }
          // }
        });
      }, infoConstantly.intervalTime);
    }
  //  请求作业监控信息
  }
  componentWillUnmount() {
    const { intervalID } = infoConstantly;
    const { alarmIntervalID } = this.props.resourceTree;
    // 清除实时数据轮循
    if (intervalID) {
      clearInterval(intervalID);
    }
    //  清空 实时数据
    infoConstantly.data = {};
    //  清空报警持续时长的轮询
    clearInterval(alarmIntervalID);
  }
  /**
   * @author HuangJie
   * @date 2018/6/1
   * @Description: 关闭面板
   */
  handleClick = () => {
    const { intervalID } = infoConstantly;
    const { alarmIntervalID } = this.props.resourceTree;
    // 清空设备控制类型
    this.props.dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: '',
    });
    // 清空地图保存的危险源、风险areaCode
    this.props.dispatch({
      type: 'resourceTree/saveRiskID',
      payload: '',
    });
    // 清除实时数据轮循
    if (intervalID) {
      clearInterval(intervalID);
    }
    //  清空 实时数据
    infoConstantly.data = {};
    //  清空报警持续时长的轮询
    clearInterval(alarmIntervalID);
  };
  // 视频点击
  handleVideoClick = (item) => {
    const { gISCode, resourceID, resourceName } = item;
    searchByAttr({ searchText: gISCode, searchFields: ['ObjCode'] }).then((res) => {
      const { infoPops, mapView, dispatch } = this.props;
      mapView.goTo({ center: res[0].feature.geometry, scale: 7000 });
      // 弹窗

      const index = infoPops.findIndex(value => value.key === resourceID);
      const pop = {
        show: true,
        key: resourceID,
        uniqueKey: Math.random() * new Date().getTime(),
      };
      if (index === -1) {
        infoPops.push(pop);
      } else {
        infoPops.splice(index, 1, pop);
      }
      const screenPoint = mapView.toScreen(res[0].feature.geometry);
      infoPopsModal[resourceID] = {
        screenPoint, screenPointBefore: screenPoint, mapStyle: { width: mapView.width, height: mapView.height }, attributes: res[0].feature.attributes, geometry: res[0].feature.geometry, name: resourceName,
      };
      dispatch({
        type: 'map/queryInfoPops',
        payload: infoPops,
      });
    });
  };
  // 视频选择
  handleVideoSelect = (checkedVideos, videoArray) => {
    const { mainMap, mapView, dispatch } = this.props;
    this.setState({ selectedRows: { checkedVideos } });
    const checkedVideos1 = [];
    for (const item of videoArray) {
      const { gISCode, sort } = item;
      const video = checkedVideos.find(value => value === gISCode);
      if (video) {
        checkedVideos1.push({ gISCode, sort });
      }
    }
    addVideoIcon(mainMap, mapView, checkedVideos1, dispatch);
  };
  handleVideoSelectAll = (videoArray, e) => {
    const { mainMap, mapView, dispatch } = this.props;
    if (e.target.checked) {
      const checkedVideos = [];
      const checkedVideos1 = [];
      for (const item of videoArray) {
        const { gISCode, sort } = item;
        checkedVideos.push(item.gISCode);
        checkedVideos1.push({ gISCode, sort });
      }
      this.setState({ selectedRows: { checkedVideos } });
      addVideoIcon(mainMap, mapView, checkedVideos1, dispatch);
    } else {
      this.setState({ selectedRows: { checkedVideos: [] } });
      addVideoIcon(mainMap, mapView, [], dispatch);
    }
  };
  handleMouseOver = (e) => {
    if (e.target.title === '') {
      return false;
    }
    const { mainMap } = this.props;
    changeIcon(mainMap, '视频搜索结果', Number(e.target.title), 'sort', 'locateHover');
  };
  handleMouseOut= (e) => {
    if (e.target.title === '') {
      return false;
    }
    const { mainMap } = this.props;
    changeIcon(mainMap, '视频搜索结果', Number(e.target.title), 'sort', 'locate');
  };
  // 视频播放
  handleVideoPlay = (videoArray) => {
    const { resourceTree, video, dispatch, videoFooterHeight } = this.props;
    const { resourceInfo, ctrlResourceType } = resourceTree;
    // 显示视频
    dispatch({
      type: 'video/switch',
      payload: {
        CmdCode: 'Show',
      },
    });
    if (videoFooterHeight.current === 0) {
      dispatch({
        type: 'homepage/getVideoFooterHeight',
        payload: { current: videoFooterHeight.cache, cache: videoFooterHeight.current },
      });
      dispatch({
        type: 'homepage/getMapHeight',
        payload: { domType: 'map', changingType: 'evrVideo' },
      });
    }
    // 是否是视频设备本身
    if (ctrlResourceType.indexOf('101.102.101') === 0) {
      // 是否有父级平台，有则请求
      if (resourceInfo.parentCode !== null) {
        this.props.dispatch({
          type: 'resourceTree/getResInfoByGISCode',
          payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, resourceCode: resourceInfo.parentCode },
        }).then(() => {
          const { extendFields } = this.props.resourceTree.resInfo;
          const { externalMaps } = this.props.resourceTree.resourceInfo;
          if (externalMaps.length === 0) {
            return false;
          }
          this.props.dispatch({
            type: 'video/play',
            payload: {
              CmdCode: '10004',
              Pos: '',
              PlatForm: {
                strGRTGUID: '',
                strUserName: extendFields.loginUser || 0,
                strPwd: extendFields.loginPWD || 0,
                strIPAddr: extendFields.visitAddr || 0,
                sPort: extendFields.visitPort || 0,
                strDevFactory: extendFields.factoryCode || 0,
                strDevVersion: extendFields.version || 0,
              },
              Device: {
                SerialNumber: resourceInfo.gISCode,
                nDevID: this.props.resourceTree.resourceInfo.extendFields.nDevID || 0,
                strGRTGUID: '',
                strDeviceCode: externalMaps[0].otherCode || 0,
                strDevIP: extendFields.visitAddr || 0,
                sDevPort: extendFields.visitPort || 0,
                nChannelIdx: '0',
              },
            },
          });
        });
      } else {
        // 没有父级，则将自身属性赋值给父级
        const { extendFields } = this.props.resourceTree.resourceInfo;
        const { externalMaps } = this.props.resourceTree.resourceInfo;
        if (externalMaps.length === 0) {
          return false;
        }
        this.props.dispatch({
          type: 'video/play',
          payload: {
            CmdCode: '10004',
            Pos: '',
            PlatForm: {
              strGRTGUID: '',
              strUserName: extendFields.loginUser || 0,
              strPwd: extendFields.loginPWD || 0,
              strIPAddr: extendFields.visitAddr || 0,
              sPort: extendFields.visitPort || 0,
              strDevFactory: extendFields.factoryCode || 0,
              strDevVersion: extendFields.version || 0,
            },
            Device: {
              SerialNumber: resourceInfo.gISCode,
              nDevID: extendFields.nDevID || 0,
              strGRTGUID: '',
              strDeviceCode: externalMaps[0].otherCode || 0,
              strDevIP: extendFields.visitAddr || 0,
              sDevPort: extendFields.visitPort || 0,
              nChannelIdx: '0',
            },
          },
        });
      }
    } else {
      // 不是视频设备，则播放其选中的关联设备
      // 视频数超过4，切换布局
      if (videoArray.length > 4) {
        const { dispatch } = this.props;
        const { winHeight } = getBrowserStyle();
        this.props.dispatch({
          type: 'global/contentHeight',
          payload: 0,
        });
        this.props.dispatch({
          type: 'homepage/VideoFooterHeight',
          payload: winHeight - 50 - 35 - 30 - 16 - 4, // l两个外边距
        });
        const { x } = video.position;
        const { width } = video.size;
        dispatch({
          type: 'video/reposition',
          payload: {
            CmdCode: '10002',
            Point:
              {
                x: x + video.padding.left + video.padding.right,
                y: 50 + 35 + 30 + 16 + 35 + 45 - 30 - getBrowserScroll().scrollTop, // 误差为45
              },
          },
        }).then(() => {
          dispatch({
            type: 'video/resize',
            payload: {
              CmdCode: '10001',
              Size:
                {
                  Width: width - video.padding.left - video.padding.right,
                  Height: winHeight - 50 - 35 - 30 - 35 - 16 - 4,
                },
            },
          }).then(() => {
            dispatch({
              type: 'video/relayout',
              payload: {
                CmdCode: '10003',
                Layout: 'Standard',
                WindowCount: '9',
              },
            });
          });
        });
      }
      for (const item of videoArray) {
        if (this.state.selectedRows.checkedVideos.find(value => value === item.gISCode)) {
          if (item.externalMaps[0].length === 0) {
            return false;
          }
          // 同样判断有无父级
          if (item.parentCode) {
            this.props.dispatch({
              type: 'resourceTree/getResInfoByGISCode',
              payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, resourceCode: item.parentCode },
            }).then(() => {
              const { extendFields } = this.props.resourceTree.resInfo;
              const { externalMaps } = this.props.resourceTree.resourceInfo;
              this.props.dispatch({
                type: 'video/play',
                payload: {
                  CmdCode: '10004',
                  Pos: '',
                  PlatForm: {
                    strGRTGUID: '',
                    strUserName: extendFields.loginUser || 0,
                    strPwd: extendFields.loginPWD || 0,
                    strIPAddr: extendFields.visitAddr || 0,
                    sPort: extendFields.visitPort || 0,
                    strDevFactory: extendFields.factoryCode || 0,
                    strDevVersion: extendFields.version || 0,
                  },
                  Device: {
                    SerialNumber: item.gISCode,
                    nDevID: item.extendFields.nDevID || 0,
                    strGRTGUID: '',
                    strDeviceCode: item.externalMaps[0].otherCode || 0,
                    strDevIP: extendFields.visitAddr || 0,
                    sDevPort: extendFields.visitPort || 0,
                    nChannelIdx: '0',
                  },
                },
              });
            });
          } else {
            const { extendFields } = item.resourceInfo;
            const { externalMaps } = item.resourceInfo;
            if (externalMaps.length === 0) {
              return false;
            }
            this.props.dispatch({
              type: 'video/play',
              payload: {
                CmdCode: '10004',
                Pos: '',
                PlatForm: {
                  strGRTGUID: '',
                  strUserName: extendFields.loginUser || 0,
                  strPwd: extendFields.loginPWD || 0,
                  strIPAddr: extendFields.visitAddr || 0,
                  sPort: extendFields.visitPort || 0,
                  strDevFactory: extendFields.factoryCode || 0,
                  strDevVersion: extendFields.version || 0,
                },
                Device: {
                  SerialNumber: item.gISCode,
                  nDevID: item.extendFields.nDevID || 0,
                  strGRTGUID: '',
                  strDeviceCode: externalMaps[0].otherCode || 0,
                  strDevIP: extendFields.visitAddr || 0,
                  sDevPort: extendFields.visitPort || 0,
                  nChannelIdx: '0',
                },
              },
            });
          }
        }
      }
    }
  };
  // 加入看板
  addToBoard = () => {
    const { resourceTree } = this.props;
    const { resourceInfo } = resourceTree;
    if (!resourceInfo || Object.keys(resourceInfo).length === 0) {
      return;
    }
    const { resourceID, ctrlResourceType, processNumber } = resourceInfo;
    // 判断实时数据面板的名称
    let panelName = '';
    if (ctrlResourceType) {
      switch (true) {
        case ctrlResourceType.indexOf('101.107.102') === 0: // 气体实时数据
          panelName = '气体实时数据看板';
          break;
        case ctrlResourceType.indexOf('102.102') === 0: // 外排口实时数据
          panelName = '环保实时数据看板';
          break;
        case ctrlResourceType.indexOf('103.101.201') === 0: // 水实时数据
          panelName = '水实时数据看板';
          break;
        case ctrlResourceType.indexOf('103.101.202') === 0: // 电实时数据;
          panelName = '电实时数据看板';
          break;
        case ctrlResourceType.indexOf('103.101.203') === 0: // 汽实时数据
          panelName = '汽实时数据看板';
          break;
        case ctrlResourceType.indexOf('103.101.204') === 0: // 风实时数据
          panelName = '风实时数据看板';
          break;
        default: break;
      }
      this.openBoard(`${resourceID}&${processNumber}`, ctrlResourceType, panelName);
    }
  };
  // 地图联动
  linkMap = () => {
    const { resourceTree, infoPops, mapView, dispatch, popupScale } = this.props;
    const { resourceInfo } = resourceTree;
    const { gISCode, resourceName, processNumber } = resourceInfo;
    searchByAttr({ searchText: gISCode, searchFields: ['ObjCode'] }).then((res) => {
      if (res[0].feature.geometry === null) {
        return false;
      }
      const newGeometry = transToPoint(res[0].feature.geometry);
      mapView.goTo({ center: newGeometry, scale: popupScale });
      // 弹窗
      const index = infoPops.findIndex(value => value.key === 'deviceInfo');
      const pop = {
        show: true,
        key: 'deviceInfo',
        uniqueKey: Math.random() * new Date().getTime(),
      };
      if (index === -1) {
        infoPops.push(pop);
      } else {
        infoPops.splice(index, 1, pop);
      }
      const screenPoint = mapView.toScreen(newGeometry);
      const name = resourceInfo.ctrlResourceType !== '101.102.101.101.103' ? processNumber + resourceName : resourceName;
      infoPopsModal.deviceInfo = {
        screenPoint, screenPointBefore: screenPoint, mapStyle: { width: mapView.width, height: mapView.height }, attributes: res[0].feature.attributes, geometry: newGeometry, name,
      };
      dispatch({
        type: 'map/queryInfoPops',
        payload: infoPops,
      });
    });
  };
  /**
   * @author HuangJie
   * @date 2018/5/24
   * @Description: 打开不同类型的面板
   */
  openBoard = (resourceID, ctrlResourceType, panelName) => {
    const { panelBoard } = this.props;
    const { expandKeys, activeKeys } = panelBoard;

    if (constantlyPanelModal[ctrlResourceType]) {
      if (constantlyPanelModal[ctrlResourceType].resourceIDs) {
        if (constantlyPanelModal[ctrlResourceType].resourceIDs.indexOf(resourceID) === -1) {
          constantlyPanelModal[ctrlResourceType].resourceIDs.push(resourceID);
          getRealHistoryData(this.props.dispatch, ctrlResourceType, this.props.panelBoard, resourceID);
        }
      } else {
        constantlyPanelModal[ctrlResourceType] = { resourceIDs: [resourceID] };
        getRealHistoryData(this.props.dispatch, ctrlResourceType, this.props.panelBoard, resourceID);
      }
    } else {
      constantlyPanelModal[ctrlResourceType] = { resourceIDs: [resourceID] };
      getRealHistoryData(this.props.dispatch, ctrlResourceType, this.props.panelBoard, resourceID);
    }
    this.props.dispatch({
      type: 'panelBoard/saveConstantlyPanelModal',
      payload: constantlyPanelModal,
    });

    // 添加面板
    const newArr = [];
    for (const arr of activeKeys) {
      newArr.push(arr.keys);
    }
    if (newArr.indexOf(`${ctrlResourceType}`) === -1) {
      expandKeys.push(`${ctrlResourceType}`);
      this.props.dispatch({
        type: 'panelBoard/queryList',
        payload: {
          expandKeys,
          activeKeys: [
            { name: 'realDataPanel', uniqueKey: 0, keys: `${ctrlResourceType}`, type: 'default', param: { title: panelName } },
              ...activeKeys,
          ],
        },
      });
    } else if (expandKeys.indexOf(`${ctrlResourceType}`) === -1) {
      expandKeys.push(`${ctrlResourceType}`);
      this.props.dispatch({
        type: 'panelBoard/queryList',
        payload: {
          expandKeys,
          activeKeys,
        },
      });
    }
  };
  /**
   * @author HuangJie
   * @date 2018/6/8
   * @Description: 报警处理
   */
  alarmDeal = () => {
    const { alarmBoardData } = this.props;
    this.props.dispatch({
      type: 'alarmDeal/saveAlarmInfo',
      payload: alarmBoardData[this.state.alarmSelectIndex],
    });
    this.props.dispatch({
      type: 'alarmDeal/saveDealModel',
      payload: { isDeal: true },
    });
  };
  // 报警选择
  handleAlarmChange = (evt) => {
    const index = evt.target.value;
    this.setState({ alarmSelectIndex: index });
  };
  render() {
    const { mapHeight } = this.props;
    const { alarmSelectIndex } = this.state;
    const alarmBoardData = JSON.parse(JSON.stringify(this.props.alarmBoardData));
    const { resourceInfo, rowInfo, materialHarmInfo, materialFireControl } = this.props.resourceTree;
    const { universalData } = infoConstantly.data; // 实时数据
    const videoArray = [];
    if (resourceInfo.beMonitorObjs) {
      for (const [index, value] of resourceInfo.beMonitorObjs.entries()) {
        videoArray.push({ sort: index + 1, ...value });
      }
    }
    // 检测对象列表数据
    const monitorsCols = [
      {
        title: '序号',
        dataIndex: 'sort',
        width: 50,
        align: 'center',
      },
      {
        title: '资源名称',
        dataIndex: 'resourceName',
      // width: 120,
      },
      // {
      //   title: '资源编码',
      //   dataIndex: 'processNumber',
      // // width: 100,
      // },
    //   {
    //   title: '安装位置',
    //   dataIndex: 'installPosition',
    //   width: 160,
    // }, {
    //   title: '所在区域',
    //   dataIndex: 'areaName',
    //   width: 160,
    //   render: (text, record) => {
    //     return record.area ? record.area.areaName : '';
    //   },
    // }, {
    //   title: '所属分部',
    //   dataIndex: 'orgnizationName',
    //   width: 160,
    //   render: (text, record) => {
    //     return record.organization ? record.organization.orgnizationName : '';
    //   },
    // }
    ];
    return (
      <div className={styles.warp}>
        <div className={styles.header}>
          <div className={styles.name} title={`${resourceInfo.resourceName}-${resourceInfo.processNumber}`}>{resourceInfo.resourceName}-{resourceInfo.processNumber}</div>
          <div className={styles.close}>
            <Button type="primary" size="small" onClick={this.handleClick}><img src={close} alt="关闭" /></Button>
          </div>
        </div>
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={200}
          autoHeightMax={mapHeight - 73 - 48 - 32 - 32}
        >
          <div className={styles.panelContent}>
            <Collapse
              bordered={false}
              defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17']}
            >
              {alarmBoardData.length > 0 ? (
                <Panel header={<div className={styles.panelHeader}>报警信息</div>} key="17">
                  <RadioGroup onChange={this.handleAlarmChange} value={alarmSelectIndex} className={styles.alarmList}>
                    <Collapse bordered={false} style={{ width: 294, fontSize: 12 }} defaultActiveKey={String(alarmBoardData.length - 1)}>
                      {alarmBoardData.map((item, index) => {
                                    const newIndex = String(JSON.parse(JSON.stringify(index)));
                                    const level = parseInt(item.alarmType.dangerCoefficient, 0);
                                    let index1;
                                    index1 = 0;
                                    const array1 = getArray(index1, level, []);
                                    index1 = 0;
                                    const array2 = getArray(index1, 5 - level, []);
                                    const rate1 = array1.map(() => <span><img src={levelRed} alt="等级" /></span>);
                                    const rate2 = array2.map(() => <span><img src={levelGray} alt="等级" /></span>);
                                    return (
                                      <Panel
                                        header={
                                          <Row>
                                            <Col span={20}>
                                              <span className={styles.type}>{item.alarmType ? item.alarmType.alarmTypeName : ''}</span>
                                              <span>
                                                {rate1}
                                                {rate2}
                                              </span>
                                            </Col>
                                            <Col span={4} onClick={(e) => { e.stopPropagation(); }}>
                                              <Radio value={index} />
                                            </Col>
                                          </Row>
                                            }
                                        key={String(newIndex)}
                                      >
                                        <Row type="flex">
                                          {/* <Col span={8}>报警号：</Col> */}
                                          {/* <Col span={16}>{item.alarmCode}</Col> */}
                                          <Col span={8}>报警状态：</Col>
                                          <Col span={16}>{alarmStatus(item.alarmStatue)}</Col>
                                          <Col span={8}>首报时间：</Col>
                                          <Col span={16}>{item.alarmTime ? moment(item.alarmTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Col>
                                          <Col span={8}>持续时长：</Col>
                                          <Col span={16}>{item.continueTime}</Col>
                                          <Col span={8}>报警位置：</Col><Col span={16}>{item.areaName}</Col>
                                          <Col span={8}>所属装置：</Col><Col span={16}>{item.orgName}</Col>
                                        </Row>
                                      </Panel>
                                    );
                                })}
                    </Collapse>
                  </RadioGroup>
                </Panel>
                ) : null}
              {universalData && universalData.length > 0 ? (
                <Panel header={<div className={styles.panelHeader}>实时数据信息</div>} key="16" className={styles.type}>
                  <UniversalTemplate data={universalData} showDashBoard dispatch={this.props.dispatch} />
                </Panel>
              ) : null
              }
              {
                    resourceInfo && resourceInfo.ctrlResourceType.indexOf('101.201') === -1 ? (
                      <Panel header={<div className={styles.panelHeader}>基本信息</div>} key="1">
                        <Row type="flex">
                          <Col span={8}>资源名称：</Col><Col span={16}>{resourceInfo.resourceName}</Col>
                          <Col span={8}>工艺位号：</Col><Col span={16}>{resourceInfo.processNumber}</Col>
                          <Col span={8}>设备状态：</Col><Col span={16}>{resourceInfo.resourceStatu === null ? '正常' : resourceInfo.resourceStatu}</Col>
                          <Col span={8}>所在区域：</Col><Col span={16}>{resourceInfo.area ? resourceInfo.area.areaName : ''}</Col>
                          <Col span={8}>所属部门：</Col><Col span={16}>{resourceInfo.organization ? resourceInfo.organization.orgnizationName : ''}</Col>
                          <Col span={8}>安装位置：</Col><Col span={16}>{resourceInfo.installPosition}</Col>
                        </Row>
                      </Panel>
) :
                        null
                }

              {/* {resourceInfo.monitorObjs && (resourceInfo.monitorObjs.length > 0) ? ( */}
              {/* <Panel header={<div className={styles.panelHeader}>监控对象</div>} key="2"> */}
              {/* <Table */}
              {/* size="small" */}
              {/* columns={monitorsCols} */}
              {/* dataSource={resourceInfo.monitorObjs} */}
              {/* pagination={{ pageSize: 10 }} */}
              {/* // scroll={{ x: 500, y: 240 }} */}
              {/* rowKey="resourceID" */}
              {/* /> */}
              {/* </Panel>) : null} */}
              {resourceInfo.beMonitorObjs && (resourceInfo.beMonitorObjs.length > 0) ? (
                <Panel header={<div className={styles.panelHeader}>监控摄像机</div>} key="3">
                  <ul
                    className={styles.checkList}
                    onMouseOut={this.handleMouseOut}
                    onMouseOver={this.handleMouseOver}
                  >
                    <li className={styles.title}>
                      <Checkbox
                        value="0"
                        indeterminate={this.state.selectedRows.checkedVideos.length !== videoArray.length && this.state.selectedRows.checkedVideos.length !== 0}
                        onChange={(e) => { this.handleVideoSelectAll(videoArray, e); }}
                        checked={this.state.selectedRows.checkedVideos.length === videoArray.length}
                      />
                      <span>序号</span>
                      <span>名称</span>
                    </li>
                    <CheckboxGroup style={{ width: '100%' }} onChange={(e) => { this.handleVideoSelect(e, videoArray); }} value={this.state.selectedRows.checkedVideos}>
                      {videoArray.map((item) => {
                      return (
                        <li
                          key={item.gISCode}
                          title={item.sort}
                        >
                          <Checkbox value={item.gISCode} title={item.sort} />
                          <span title={item.sort}>{item.sort}</span>
                          <span title={item.sort}>{item.resourceName}</span>
                        </li>);
                    })}
                      {/* <Pagination size="small" total={videoArray.length} pageSize={5} onChange={this.handleChange}/> */}
                    </CheckboxGroup>
                  </ul>
                </Panel>) : null}
              {rowInfo ? (
                <Panel header={<div className={styles.panelHeader}>物料属性</div>} key="4">
                  <Row type="flex">
                    <Col span={8}>物料编码：</Col><Col span={16}>{rowInfo.explosionPoint}</Col>
                    <Col span={8}>物料名称：</Col><Col span={16}>{rowInfo.rawMaterialName}</Col>
                    <Col span={8}>物料类别：</Col><Col span={16}>{rowInfo.rawType}</Col>
                    <Col span={8}>分子式：</Col><Col span={16}>{rowInfo.molecularStructure}</Col>
                    <Col span={8}>相对密度：</Col><Col span={16}>{rowInfo.relativeDensity}</Col>
                    <Col span={8}>引燃温度：</Col><Col span={16}>{rowInfo.boilingPoint}</Col>
                    <Col span={8}>溶解性：</Col><Col span={16}>{rowInfo.solubility}</Col>
                    <Col span={8}>外观与性状：</Col><Col span={16}>{rowInfo.shapeProperty}</Col>
                  </Row>
                </Panel>) : null
              }
              {(rowInfo && rowInfo.healthHazards) ? (
                <Panel header={<div className={styles.panelHeader}>健康危害</div>} key="5">
                  <div>{rowInfo.healthHazards}</div>
                </Panel>
              ) : null}
              {materialFireControl.length > 0 ? (
                <Panel header={<div className={styles.panelHeader}>消防措施</div>} key="6">
                  {materialFireControl.map((item, index) => (
                    <div>
                      <Row gutter={{ xs: 8, sm: 16, md: 24 }} type="flex">
                        <Col span={8}>危险特性：</Col><Col span={16}>{item.dangerous}</Col>
                        <Col span={8}>消防处理：</Col><Col span={16}>{item.fireControlDeal}</Col>
                        <Col span={8}>使用物品：</Col><Col span={16}>{item.useFireDevice}</Col>
                        <Col span={8}>应急处理：</Col><Col span={16}>{item.emergencyDeal}</Col>
                      </Row>
                      {index === (materialFireControl.length - 1) ? null : <Divider dashed />}
                    </div>
                  ))}
                </Panel>
              ) : null}
              {materialHarmInfo.length > 0 ? (
                <Panel header={<div className={styles.panelHeader}>急救措施</div>} key="7">
                  {materialHarmInfo.map((item, index) => (
                    <div>
                      <Row gutter={{ xs: 8, sm: 16, md: 24 }} type="flex">
                        <Col span={8}>危害方式：</Col><Col span={16}>{item.harmMethod}</Col>
                        <Col span={8}>处理方式：</Col><Col span={16}>{item.processMethod}</Col>
                      </Row>
                      {index === (materialHarmInfo.length - 1) ? null : <Divider dashed />}
                    </div>
                  ))}
                </Panel>
              ) : null}
              {resourceInfo && resourceInfo.ctrlResourceType.indexOf('101.201.101') === 0 ? (
                <Panel header={<div className={styles.panelHeader}>危险源</div>} key="14" className={styles.type}>
                  <SourceOfRisk />
                </Panel>
              ) : null
              }
              {resourceInfo && resourceInfo.ctrlResourceType.indexOf('101.201.102') === 0 ? (
                <Panel header={<div className={styles.panelHeader}>安全风险</div>} key="15" className={styles.type}>
                  <SourceOfRisk />
                </Panel>
              ) : null
              }
              {resourceInfo && resourceInfo.ctrlResourceType.indexOf('901.109.131') === 0 ? (
                <Panel header={<div className={styles.panelHeader}>作业监控</div>} key="17" className={styles.type}>
                  <Collapse
                    bordered={false}
                  >
                    <Panel header={<div className={styles.panelHeader}>作业监控1</div>} key="17-1" className={styles.type}>
                      <Row type="flex">
                        <Col span={10}>作业流水号：</Col><Col span={14}>123</Col>
                        <Col span={10}>申请人：</Col><Col span={14}>123</Col>
                        <Col span={10}>申请单位：</Col><Col span={14}>123</Col>
                        <Col span={10}>装置区域：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业开始时间：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业结束时间：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业类别：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业等级：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业地点描述：</Col><Col span={14}>123</Col>
                        <Col span={10}>项目负责人：</Col><Col span={14}>123</Col>
                        <Col span={10}>施工单位：</Col><Col span={14}>123</Col>
                        <Col span={10}>作业内容：</Col><Col span={14}>123</Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </Panel>
              ) : null
              }
            </Collapse>
          </div>
        </Scrollbars>
        <div className={styles.btn}>
          {resourceInfo && resourceInfo.ctrlResourceType.indexOf('101.201') === -1 ?
            <Button size="small" onClick={this.linkMap}>地图定位</Button> :
                null
            }

          {/* 该资源被检测 */}
          {resourceInfo.beMonitorObjs && resourceInfo.beMonitorObjs.length > 0 ?
            <Button size="small" disabled={this.state.selectedRows.checkedVideos.length === 0} onClick={() => { this.handleVideoPlay(videoArray); }}>视频联动</Button> : null
          }
          {/* 视频设备 */}
          {resourceInfo.ctrlResourceType && resourceInfo.ctrlResourceType.indexOf('101.102.101') === 0 ?
            <Button size="small" onClick={this.handleVideoPlay}>播放视频</Button> : null
          }
          {
            resourceInfo.ctrlResourceType && (resourceInfo.ctrlResourceType.indexOf('101.107.102') === 0 ||
              // 环保
              resourceInfo.ctrlResourceType.indexOf('102.102') === 0 ||
              // 生成设备
              resourceInfo.ctrlResourceType.indexOf('103.101.1') === 0 ||
              // 水电汽风
              resourceInfo.ctrlResourceType.indexOf('103.101.2') === 0) ? (
                <Button size="small" onClick={this.addToBoard}>加入看板 </Button>
              ) : null
          }
          {/* 扩音设备或扩音分区 */}
          {resourceInfo.ctrlResourceType && (resourceInfo.ctrlResourceType.indexOf('101.103.102') === 0 ||
            resourceInfo.ctrlResourceType.indexOf('101.103.103') === 0) ?
              <Button size="small">打开/关闭广播</Button> : null
          }
          {alarmBoardData && JSON.stringify(alarmBoardData) !== '{}' ?
            <Button size="small" onClick={this.alarmDeal}>报警处理</Button> : null
          }
        </div>
      </div>);
  }
}
export default connect(mapStateToProps)(AlarmInfo);
