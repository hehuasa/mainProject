import React from 'react';
import PropTypes from 'prop-types';
import { Layout, message, Tabs, notification } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, routerRedux } from 'dva/router';
import { Scrollbars } from 'react-custom-scrollbars';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import {
  getBrowserStyle,
  changeVideoPosition,
  changeVideoSize,
  resetAccessStyle,
  getBrowserScroll,
} from '../utils/utils';
import { getMenuData } from '../common/menu';
import logo from '../assets/logo.png';
import styles from './basicLayout.less';
import ResourceTree from '../routes/ResourceTree';
import FunctionTree from '../routes/FunctionTree';
import Developing from '../routes/Exception/Developing';
import OftenFunctionTree from '../routes/OftenFunctionTree';
import HomePageVideo from '../routes/HomePage/Video/HomePageVideo';
import TriggerRight from '../routes/HomePage/Collapsed/TriggerRight';
import PanelBoard from '../routes/HomePage/PanelBoard/index';
import PanelZoom from '../routes/HomePage/PanelBoard/PanelZoom';
import OftenResourceTree from '../routes/OftenResourceTree';
import DrpScreen from '../routes/DrpScreen/DrpScreen';
import TextCarousel from '../routes/TextCarousel/TextCarousel';
import TriggerLeft from '../components/GlobalCommponents/TriggerLeft';
import { mapConstants, mapLayers } from '../services/mapConstant';
import Websocket from '../routes/Websocket/Webscoket';
import VideoSocket from '../routes/Websocket/VideoSocket';
import {
  alarmAnimation,
  alarmCounting,
  clustering,
  delAlarmAnimation,
  getBordStyle,
  searchByAttr,
} from '../utils/MapService';
import { infoPopsModal } from '../services/constantlyModal';


const { Content, Header, Sider, Footer } = Layout;

const { TabPane } = Tabs;
/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children && item.children.length > 0) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `/${item.path}`,
        to: `/${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};
// 计算content高度

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

class TabsHeader extends React.PureComponent {
  dealData = (array) => {
    const newArray = [];
    for (const item of array) {
      newArray.push(item);
    }
    return newArray;
  };
  render() {
    const array = this.dealData(this.props.title);

    return (
      array.map(item => (
        <div key={Math.random() * new Date().getTime()}>{item}</div>
      )
      )
    );
  }
}

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  state = {
    isMobile,
    leftCollapsed: false,
    visible: true,
    boolean: true,
    skValue: 'sk1',
    speed: 1,
    functionList: [],
    showDrpScreen: false,
    selcetText: undefined, // 头部input的值
  };
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'global/fetchUrl',
    });
  }
  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
    this.props.dispatch({
      type: 'global/getContentHeight',
    });
    this.props.dispatch({
      type: 'global/getWarpContentHeight',
    });
    const { winHeight } = getBrowserStyle();
    // 获取content dom元素
    const getWarp = setInterval(() => {
      if (this.content !== undefined) {
        clearInterval(getWarp);
        mapConstants.domWarp = this.content;
      }
    }, 100);
    // 重设部分组件style（解决插件兼容性问题）
    const a = setInterval(() => {
      const contents = document.getElementsByClassName('ant-layout-sider-children');
      if (contents) {
        for (const content of contents) {
          content.style.height = `${winHeight - 50 - 35 - 30 - 8}px`;
          // content.style.height =  '100%';
        }
        clearInterval(a);
      }
    }, 10);
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '中韩石化应急指挥系统';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - 中韩石化应急指挥系统`;
    }
    return title;
  }
  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      return '/homePage';
    }
    return redirect;
  };
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };
  handleTabClick = (key) => {
    const { video, videoFooterHeight, dispatch, rightCollapsed, accessControlShow } = this.props;
    const { position } = video;
    const { view, accessInfoExtent } = mapConstants;
    mapConstants.domWarp = this.content;
    changeVideoPosition(key, rightCollapsed, position, dispatch);
    if (key.indexOf('homePage') === -1) {
      // 折叠
      dispatch({
        type: 'global/changeRightCollapsed',
        payload: true,
      }).then(() => {
        resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent);
        changeVideoSize(videoFooterHeight, dispatch, 'hide');
      });
    } else {
      // 恢复看板
      if (rightCollapsed) {
        dispatch({
          type: 'global/changeRightCollapsed',
          payload: false,
        }).then(() => {
          changeVideoSize(videoFooterHeight, dispatch, 'show');
          resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent);
        });
      } else {
        changeVideoSize(videoFooterHeight, dispatch, 'show');
        resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent);
      }
    }
  }
  onClickSpeed = (key) => {
    switch (key) {
      case 'sk1':
        this.setState({
          skValue: key,
          speed: 1,
        });
        break;
      case 'sk2':
        this.setState({
          skValue: key,
          speed: 2.5,
        });
        break;
      case 'sk3':
        this.setState({
          skValue: key,
          speed: 5,
        });
        break;
      default:
        this.setState({
          skValue: key,
          speed: 1,
        });
        break;
    }
  }
  onClickQuit = () => {
    const { dispatch, tabs } = this.props;
    const newArray = JSON.parse(JSON.stringify(tabs.tabs));
    for (const tab of newArray) {
      if (tab.closable) {
        dispatch({
          type: 'tabs/delTab',
          payload: tab.key,
        });
      }
    }
    dispatch({
      type: 'login/logout',
    });
    dispatch({
      type: 'video/switch',
      payload: {
        CmdCode: 'Hide',
      },
    });
    // this.props.dispatch({
    //   type: 'video/resize',
    //   payload: {
    //     CmdCode: '10001',
    //     Size:
    //     {
    //       Width: 0,
    //       Height: 0,
    //     },
    //   },
    // });
  };
  onMenuClick = (e) => {
    switch (e.key) {
      case 'sk1':
        this.setState({
          skValue: e.key,
          speed: 1,
        });
        break;
      case 'sk2':
        this.setState({
          skValue: e.key,
          speed: 2.5,
        });
        break;
      case 'sk3':
        this.setState({
          skValue: e.key,
          speed: 5,
        });
        break;
      case 'triggerError':
        this.props.dispatch(routerRedux.push('/exception/trigger'));
        break;
      case 'logout':
        this.props.dispatch({
          type: 'login/logout',
        });
        break;
      default:
        break;
    }
  };
  onChangeSwitch = (boolean) => {
    if (boolean) {
      this.setState({
        boolean,
      });
    } else {
      this.setState({
        boolean,
      });
    }
  };

  onClickCarousel = () => {
    this.setState({
      boolean: false,
    });
  };

  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  };
  handleEdit = (targetKey, addOrRemove) => {
    const { dispatch, video, videoFooterHeight, rightCollapsed, accessControlShow } = this.props;
    const { position } = video;
    const { view, accessInfoExtent } = mapConstants;
    mapConstants.domWarp = this.content;
    dispatch({
      type: 'tabs/del',
      payload: { key: targetKey },
    }).then(() => {
      if (this.props.tabs.activeKey.indexOf('homePage') !== -1) {
        changeVideoPosition(this.props.tabs.activeKey, rightCollapsed, position, dispatch);
        // 折叠
        dispatch({
          type: 'global/changeRightCollapsed',
          payload: false,
        }).then(() => {
          resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent);
          changeVideoSize(videoFooterHeight, dispatch, 'show');
        });
      }
    });

    if (addOrRemove === 'remove' && targetKey === '/command/emergencyEvent') {
      this.setState({
        selcetText: undefined,
      });
      const closePanel = (keys) => {
        const { expandKeys, activeKeys } = this.props.panelBoard;
        const expandNames = expandKeys.filter(item => item !== keys);
        const activeNames = activeKeys.filter(item => item.keys !== keys);
        this.props.dispatch({
          type: 'panelBoard/queryList',
          payload: { expandKeys: expandNames, activeKeys: activeNames },
        });
      };
      closePanel('EventInfo');
    }
  };
  handleTabChange = (targetKey) => {
    this.props.dispatch({
      type: 'tabs/active',
      payload: { key: targetKey },
    });
  };
  // 处理websocket
  onmessage = ({ data }) => {
    const { dispatch, map, alarm } = this.props;
    const { mainMap, view } = mapConstants;
    const { linkMap } = alarm;
    const { popupScale } = map;
    const socketMessage = JSON.parse(data);
    const that = this;
    // 存储报警信息&动画展示
    if (socketMessage.H.F === '501001') {
      // 判断是新增报警还是取消报警（or处理报警）
      switch (Number(socketMessage.B.alarmStatue)) {
        case 1: // 新增报警
          {
            // 请求报警对应的资源(如监控对象)
            dispatch({
              type: 'map/selectByGISCode',
              payload: {
                pageNum: 1,
                pageSize: 1,
                isQuery: true,
                fuzzy: false,
                resourceCode: socketMessage.B.resourceCode,
              },
            });
            // 遍历查看是否报警信息更新
            let isNew = true;
            let isUpdate = false;
            const alarmIndex = alarm.list.findIndex(value => value.alarmCode === socketMessage.B.alarmCode);
            if (alarmIndex !== -1) {
              isNew = false;
              if (alarm.list[alarmIndex].alarmType.dangerCoefficient !== socketMessage.B.alarmType.dangerCoefficient) {
                isUpdate = true;
              }
              alarm.list.splice(alarmIndex, 1, socketMessage.B);
            }
            // for (const [index, item] of alarm.list.entries()) {
            //   if (item.alarmCode === socketMessage.B.alarmCode) {
            //     if (item.displayAlarm.showTrip === socketMessage.B.alarmCode) {
            //       notification.warning({
            //         message: '报警消息有更新',
            //         description: `设备名称: ${socketMessage.B.resourceName}`,
            //       });
            //     }
            //     alarm.list.splice(index, 1, item);
            //     isNew = false;
            //     break;
            //   }
            // }
            if (isNew) {
              notification.warning({
                message: '接收到新报警消息',
                description: `设备名称: ${socketMessage.B.resourceName}`,
                placement: 'bottomRight',
              });
              if (alarm.alarmType) {
                if (alarm.alarmType.profession !== '107.901') {
                  alarm.list.push(socketMessage.B);
                }
              }

              alarm.listWithFault.push(socketMessage.B);
            } else if (isUpdate) {
              notification.warning({
                message: '报警消息有更新',
                description: `设备名称: ${socketMessage.B.resourceName}`,
                placement: 'bottomRight',
              });
            }
            dispatch({
              type: 'alarm/add',
              payload: { list: alarm.list, listWithFault: alarm.listWithFault },
            }).then(() => {
              dispatch({
                type: 'alarm/filter',
                payload: {
                  historyList: that.props.alarm.groupByOverview.list,
                  alarms: alarm.listWithFault,
                  para: alarm.overviewShow,
                },
              }).then(() => {
                if (isNew || isUpdate) {
                  const { resourceGroupByArea, clusterRes } = this.props;
                  // 更新报警聚合
                  const area = mapLayers.AreaLayers[0];
                  const subLayer = mapConstants.baseLayer.findSublayerById(area.id);
                  const queryArea = subLayer.createQuery();
                  queryArea.outFields = ['*'];
                  subLayer.queryFeatures(queryArea).then((res) => {
                    clustering({ view, dispatch, alarms: that.props.alarm.groupByOverview.list, graphics: res.features, overviewShow: that.props.alarm.overviewShow, clusterRes, popupScale, resourceGroupByArea });
                  });
                  // 播放该设备关联的视频
                  dispatch({
                    type: 'resourceTree/getBeMonitorsByResourceID',
                    payload: { resourceID: socketMessage.B.resourceID, ctrlResourceType: '101.102.101' },
                  }).then(() => {
                    if (this.props.resourceInfo.beMonitorObjs && this.props.resourceInfo.beMonitorObjs.length > 0) {
                      // 视频播放
                      this.handleVideoPlay(this.props.resourceInfo.beMonitorObjs[0]);
                    }
                  });
                }
              });
            });
            if (isNew || isUpdate) {
              dispatch({
                type: 'map/searchDeviceByAttr',
                payload: { searchText: socketMessage.B.resourceGisCode, searchFields: ['ObjCode'] },
              }).then(() => {
                // 是否联动地图
                switch (linkMap) {
                  case 0:
                    if (view.goTo) {
                      view.goTo({
                        center: that.props.map.searchDeviceArray[0].feature.geometry,
                        scale: popupScale - 10,
                      }).then(() => {
                        alarmAnimation(
                          {
                            map: mainMap,
                            layer: mainMap.findLayerById('报警动画'),
                            alarm: socketMessage.B,
                            geometry: that.props.map.searchDeviceArray[0].feature.geometry,
                            iconObj: alarm.iconObj,
                            dispatch,
                          });
                      });
                    }
                    break;
                    // case 1:
                    //   const layer = mainMap.findLayerById('装置界区');
                    //   if (layer) {
                    //     alarmCounting(mainMap, view, dispatch, alarm.groupByArea, layer, layer.graphics);
                    //     alarmAnimation(
                    //       mainMap,
                    //       socketMessage.B.alarmType,
                    //       that.props.map.searchDeviceArray[0].feature.geometry,
                    //       socketMessage.B,
                    //       alarm.iconObj,
                    //       dispatch);
                    //   } else {
                    //     view.goTo({
                    //       center: that.props.map.searchDeviceArray[0].feature.geometry,
                    //       scale: scale - 10,
                    //     }).then(() => {
                    //       alarmAnimation(mainMap,
                    //         socketMessage.B.alarmType,
                    //         that.props.map.searchDeviceArray[0].feature.geometry,
                    //         socketMessage.B,
                    //         alarm.iconObj,
                    //         dispatch);
                    //     });
                    //   }
                    //   break;
                  case 2:
                    alarmAnimation(

                      {
                        map: mainMap,
                        layer: mainMap.findLayerById('报警动画'),
                        alarm: socketMessage.B,
                        geometry: that.props.map.searchDeviceArray[0].feature.geometry,
                        iconObj: alarm.iconObj,
                        dispatch,
                      });
                    break;
                  default:
                    break;
                }
                // if (linkMap) {
                //   view.goTo({ center: that.props.map.searchDeviceArray[0].feature.geometry, scale: scale - 10 }).then(() => {
                //     alarmAnimation(mainMap,
                //       socketMessage.B.alarmType,
                //       that.props.map.searchDeviceArray[0].feature.geometry,
                //       socketMessage.B,
                //       alarm.iconObj,
                //       dispatch);
                //   });
                // } else {
                //   const layer = mainMap.findLayerById('装置界区');
                //   if (layer) {
                //     alarmCounting(mainMap, view, dispatch, alarm.groupByArea, layer, layer.graphics);
                //     alarmAnimation(
                //       mainMap,
                //       socketMessage.B.alarmType,
                //       that.props.map.searchDeviceArray[0].feature.geometry,
                //       socketMessage.B,
                //       alarm.iconObj,
                //       dispatch);
                //   } else {
                //     view.goTo({ center: that.props.map.searchDeviceArray[0].feature.geometry, scale: scale - 10 }).then(() => {
                //       alarmAnimation(mainMap,
                //         socketMessage.B.alarmType,
                //         that.props.map.searchDeviceArray[0].feature.geometry,
                //         socketMessage.B,
                //         alarm.iconObj,
                //         dispatch);
                //     });
                //   }
                // }
              });
            }
          }
          break;
        default: // 报警取消或被处理
          notification.info({
            message: '报警已处理或取消',
            description: `设备名称: ${socketMessage.B.resourceName}`,
            placement: 'bottomRight',
          });
          // 删除报警消息
          for (const item of alarm.list) {
            if (item.alarmCode === socketMessage.B.alarmCode) {
              alarm.list.splice(alarm.list.findIndex(value => value === item), 1);
              break;
            }
          }
          const needDelAlarm = alarm.list.find(value => value.alarmCode === socketMessage.B.alarmCode);
          if (needDelAlarm) {
            dispatch({
              type: 'alarm/del',
              payload: { alarm: socketMessage.B },
            }).then(() => {
              dispatch({
                type: 'alarm/filter',
                payload: {
                  historyList: this.props.alarm.groupByOverview.list,
                  alarms: this.props.alarm.listWithFault,
                  para: this.props.alarm.overviewShow,
                },
              }).then(() => {
                const { resourceGroupByArea, clusterRes } = this.props;
                // 更新报警聚合
                const area = mapLayers.AreaLayers[0];
                const subLayer = mapConstants.baseLayer.findSublayerById(area.id);
                const queryArea = subLayer.createQuery();
                queryArea.outFields = ['*'];
                subLayer.queryFeatures(queryArea).then((res) => {
                  clustering({ view, dispatch, alarms: this.props.alarm.groupByOverview.list, graphics: res.features, overviewShow: that.props.alarm.overviewShow, clusterRes, popupScale, resourceGroupByArea });
                });
              });
            });

            // 删除报警图标
            if (mainMap.findLayerById) {
              delAlarmAnimation(mainMap,
                socketMessage.B,
                alarm.iconObj,
                dispatch);
            }
          }
      }
    }
  };
  handleVideoPlay = (item) => {
    const { dispatch, videoFooterHeight } = this.props;
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
    // 播放其关联设备
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
  };
  // 处理视频插件的通讯
  onmessage1 = ({ data }) => {
    const { dispatch, map } = this.props;
    const { view } = mapConstants;
    const { infoPops, popupScale } = map;
    if (data === 'Avengers') {
      dispatch({
        type: 'video/getLoaded',
        payload: true,
      });
    } else {
      const { CmdCode, Serialnumber } = JSON.parse(data);
      if (CmdCode === 'SetMapLocation') {
        searchByAttr({ searchText: Serialnumber, searchFields: ['ObjCode'] }).then(
          (res) => {
            const screenPoint = view.toScreen(res[0].feature.geometry);
            dispatch({
              type: 'map/screenPoint',
              payload: screenPoint,
            });
            dispatch({
              type: 'map/mapPoint',
              payload: res[0].feature.geometry,
            });
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
            infoPopsModal.deviceInfo = {
              screenPoint, screenPointBefore: screenPoint, mapStyle: { width: view.width, height: view.height }, attributes: res[0].feature.attributes, geometry: res[0].feature.geometry, name: res[0].feature.attributes['设备位置'],
            };
            dispatch({
              type: 'map/queryInfoPops',
              payload: infoPops,
            });
            if (res.length > 0) {
              view.goTo({ center: res[0].feature.geometry, scale: popupScale - 10 }).then(() => {
                this.props.dispatch({
                  type: 'resourceTree/selectByGISCode',
                  payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode: Serialnumber },
                });
              });
            }
          }
        );
      }
    }
  };
  // 保存头部input的值
  saveHeaderSelectText = (val) => {
    this.setState({
      selcetText: val,
    });
  };
  render() {
    const {
      currentUser,
      collapsed,
      notices,
      routerData, tabs, fetchingNotices, alarm, video, panelBoard, serviceUrl, contentHeight, warpContentHeight, rightCollapsed, undoneEventList, videoFooterHeight,
      map,
      accessControlShow,
    } = this.props;
    const { showDrpScreen } = this.state;
    const { view } = mapConstants;
    const handleClick = () => {
      this.props.dispatch({
        type: 'commonTree/getContext',
        payload: { show: false },
      });
      this.props.dispatch({
        type: 'resourceTree/getContext',
        payload: { show: false },
      });
      this.props.dispatch({
        type: 'sysFunction/getContext',
        payload: { show: false },
      });
    };
    const layout = (
      <Layout>
        { showDrpScreen ?
          <DrpScreen /> : (
            <div>
              <Websocket onmessage={this.onmessage} socketUrl={serviceUrl.socketUrl} currentUser={currentUser} />
              <VideoSocket onmessage={this.onmessage1} />
              <Header style={{ padding: 0, background: '#296fce', height: 50, lineHeight: 50 }}>
                <GlobalHeader
                  dispatch={this.props.dispatch}
                  logo={logo}
                  currentUser={currentUser}
                  rightCollapsed={rightCollapsed}
                  fetchingNotices={fetchingNotices}
                  notices={notices}
                  collapsed={collapsed}
                  videoFooterHeight={videoFooterHeight}
                  isMobile={this.state.isMobile}
                  alarm={alarm}
                  alarmCount={alarm.count}
                  onNoticeClear={this.handleNoticeClear}
                  onCollapse={this.handleMenuCollapse}
                  onMenuClick={this.onMenuClick}
                  onNoticeVisibleChange={this.handleNoticeVisibleChange}
                  onMenuOpenChange={this.onMenuOpenChange}
                  boolean={this.state.boolean}
                  onChangeSwitch={this.onChangeSwitch}
                  skValue={this.state.skValue}
                  onClickQuit={this.onClickQuit}
                  onClickSpeed={key => this.onClickSpeed(key)}
                  majorList={this.props.majorList}
                  panelBoard={panelBoard}
                  video1={video}
                  undoneEventList={undoneEventList}
                  tabs={tabs}
                  selcetText={this.state.selcetText}
                  saveHeaderSelectText={(val) => { this.saveHeaderSelectText(val); }}
                />
              </Header>
              <Header style={{ padding: 0, background: 'transparent', height: 'auto', lineHeight: 'auto' }}>
                <TextCarousel {...this.state} onClickCarousel={this.onClickCarousel} spaceTime={60000} />
              </Header>
              <Layout style={{ height: warpContentHeight }}>
                <Sider
                  className={styles.slider}
                  width={240}
                  collapsible
                  collapsedWidth={35}
                  trigger={null}
                  collapsed={collapsed}
                >
                  <TriggerLeft video={video} view={view} extent={map.extent} domWarp={this.content} accessControlShow={accessControlShow} />
                  <Tabs
                    tabPosition="left"
                    className={styles.tabs}
                    defaultActiveKey="2"
                    onTabClick={handleClick}
                  >
                    <TabPane tab={<TabsHeader title="功能" />} key="2" className={styles.tabs}>
                      <FunctionTree dispatch={this.props.dispatch} saveHeaderSelectText={(val) => { this.saveHeaderSelectText(val); }} />
                    </TabPane>
                    <TabPane tab={<TabsHeader title="常用功能" />} key="4" className={styles.tabs}>
                      <OftenFunctionTree dispatch={this.props.dispatch} />
                    </TabPane>
                    <TabPane tab={<TabsHeader title="资源" />} key="1" className={styles.tabs}>
                      <ResourceTree dispatch={this.props.dispatch} />
                    </TabPane>
                    <TabPane tab={<TabsHeader title="常用资源" />} key="3" className={styles.tabs}>
                      <OftenResourceTree dispatch={this.props.dispatch} />
                    </TabPane>
                  </Tabs>
                </Sider>
                <Layout>
                  <Content style={{ marginBottom: ' 8px', position: 'relative', height: contentHeight }}>
                    <div ref={(ref) => { this.content = ref; }} style={{ width: '100%', position: 'absolute', zIndex: -20, visibility: 'hidden' }} />
                    <PanelZoom />
                    <Tabs
                      type="editable-card"
                      onEdit={this.handleEdit}
                      onChange={this.handleTabChange}
                      onTabClick={this.handleTabClick}
                      activeKey={tabs.activeKey}
                      className={styles['tabs-row']}
                      // style={{ height: contentHeight }}
                      hideAdd
                    >
                      {tabs.tabs.map((item) => {
                                    const Comp = routerData[item.key] ? routerData[item.key].component ? routerData[item.key].component : null : null;
                                    return (
                                      <TabPane tab={item.title} key={item.key} closable={item.closable}>
                                        <Scrollbars>
                                          { Comp !== null ? (
                                            <Route
                                              path="/"
                                              render={props => <Comp {...props} title={item.title} />}
                                            />
) :
                                            <Developing />}

                                        </Scrollbars>

                                      </TabPane>
                                    );
                                }
                            )}
                    </Tabs>
                  </Content>
                  <Footer style={{ padding: 0, position: 'relative', zIndex: 101 }}><HomePageVideo /></Footer>
                </Layout>
                <Sider className={styles['side-right']} width={440} collapsible collapsed={rightCollapsed} collapsedWidth={0}><TriggerRight domWarp={this.content} accessControlShow={accessControlShow} /><PanelBoard /></Sider>
              </Layout>
            </div>
)}


      </Layout>
    );
    return (
      currentUser.name ? (
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </DocumentTitle>
      ) : null
    );
  }
}

export default connect(({ user, global, loading, tabs, map, sysFunction, alarm, resourceTree, commonTree, majorList, video, panelBoard, homepage, emergency, accessControl }) => {
  return {
    currentUser: user.currentUser,
    collapsed: global.collapsed,
    fetchingNotices: loading.effects['global/fetchNotices'],
    notices: global.notices,
    contentHeight: global.contentHeight,
    warpContentHeight: global.warpContentHeight,
    serviceUrl: global.serviceUrl,
    rightCollapsed: global.rightCollapsed,
    tabs,
    map,
    resourceGroupByArea: resourceTree.resourceGroupByArea,
    clusterRes: resourceTree.clusterRes,
    sysFunction,
    alarm,
    commonTree,
    majorList,
    video,
    panelBoard,
    videoFooterHeight: homepage.videoFooterHeight,
    accessControlShow: accessControl.show,

    undoneEventList: emergency.undoneEventList,
  };
}
)(BasicLayout);
