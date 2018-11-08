import React, { PureComponent } from 'react';
import { message } from 'antd';
import esriLoader from 'esri-loader';
import EsriLoaderReact from 'esri-loader-react';
import { connect } from 'dva';
import MapTools from './MapTools/index';
import ContextMenu from './ContextMenu/ContextMenu';
import DemoInfoTemplate from './infoWindow/DemoInfoTemplate';
import MeasurePop from './infoWindow/MeasurePop/MeasurePop';
import SpaceQuery from './infoWindow/spaceQuery/SpaceQuery';
import AlarmCount from './infoWindow/AlarmCount';
import ConstantlyTemplate from './infoWindow/ConstantlyTem/ConstantlyTemplate';
import InfoPops from './infoWindow/Template/InfoPops';
import ClusterPopup from './infoWindow/ClusterPopup/ClusterPopup';
import PAPopup from './infoWindow/PApopup/PApopup';
import { constantlyModal, infoPopsModal } from '../../services/constantlyModal';
import { getBrowserStyle } from '../../utils/utils';
import { mapLayers, mapConstants } from '../../services/mapConstant';
import BreathDemo from './Animation/BreathDemo';
import styles from './index.less';
import Search from './Sraech';
import LeftBoard from './LeftBoard';
import {
  trueMapLocate,
} from '../../utils/mapService';
import trueMap from '../../assets/map/truemap.jpg';
import Legend from './Legend/Legend';

const current = {};

const mapStateToProps = ({ map, homepage, websocket, alarm, resourceTree, constantlyData, loading, global }) => {
  const { infoWindow, mapView, scale, popupScale, baseLayer, trueMapShow, locateTrueMap, mapPoint, screenBeforePoint, searchDeviceArray, screenPoint,
    constantlyValue, doorConstantlyValue, doorAreaConstantlyValue, gasConstantlyValue, envConstantlyValue, paPopup, stopPropagation,
    vocConstantlyValue, waterConstantlyValue, steamConstantlyValue, contextPosition, clusterPopup, isDraw,
    crackingConstantlyValue, generatorConstantlyValue, largeUnitConstantlyValue, boilerConstantlyValue, infoPops, spaceQueryPop,
  } = map;
  const data = [];
  for (const item of constantlyData.constantlyComponents) {
    data.push(item);
  }
  return {
    serviceUrl: global.serviceUrl,
    infoWindow,
    mapHeight: homepage.mapHeight,
    // mainMap,
    mapView,
    scale,
    stopPropagation,
    isDraw,
    popupScale,
    baseLayer,
    contextPosition,
    list: alarm.groupByOverview.list,
    alarmList: websocket.alarmList,
    trueMapShow,
    locateTrueMap,
    mapPoint,
    screenBeforePoint,
    screenPoint,
    searchDeviceArray,
    constantlyValue,
    doorConstantlyValue,
    doorAreaConstantlyValue,
    gasConstantlyValue,
    envConstantlyValue,
    vocConstantlyValue,
    waterConstantlyValue,
    crackingConstantlyValue,
    generatorConstantlyValue,
    largeUnitConstantlyValue,
    boilerConstantlyValue,
    constantlyComponents: data,
    steamConstantlyValue,
    infoPops,
    clusterPopup,
    spaceQueryPop,
    paPopup,
    resourceTree,
    fetchingAlarm: loading.effects['alarm/fetch'],
    fetchingMapApi: loading.effects['global/fetchUrl'],
    fetchLayers: loading.effects['map/fetchLayers'],
  };
};

@connect(mapStateToProps)
export default class ArcgisMap extends PureComponent {
  constructor(props) {
    super(props);
    const timeStample = new Date().getTime();
    this.state = {
      mapDivId: `mapdiv${timeStample}`,
      legendIndex: -1,
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const getMapApi = setInterval(() => {
      if (!this.props.fetchingMapApi) {
        clearInterval(getMapApi);
        // 配置 dojoConfig
        const options = {
          dojoConfig: {
            has: {
              'esri-featurelayer-webgl': 1,
            },
          },
        };
        esriLoader.loadModules(
          ['esri/layers/MapImageLayer', 'esri/layers/ImageryLayer', 'esri/Map', 'esri/views/MapView', 'esri/geometry/Extent', 'esri/geometry/SpatialReference', 'esri/widgets/ScaleBar'],
          options
        ).then(
          ([MapImageLayer, ImageryLayer, Map, MapView, Extent, SpatialReference, ScaleBar]) => {
            esriLoader.loadCss(`${this.props.serviceUrl.mapApiUrl}arcgis/arcgis_js_api/library/4.7/esri/css/main.css`);
            dispatch({
              type: 'map/fetchLayers',
            }).then(() => {
              // 找到底图图层
              const sublayers = [];
              const { winWidth } = getBrowserStyle();
              // 判断分辨率，确定初始显示比例，以及聚合信息显示比例（考虑性能，聚合显示比例比初始比例少4000）
              const scale = winWidth < 1700 ? 15000 : 10000;
              const popupScale = scale - 4000;
              // 需要特殊处理，放在上顶的图层
              for (const layer of mapLayers.FrontLayers) {
                sublayers.push({
                  title: layer.mapLayerName,
                  id: layer.id,
                  visible: false,
                });
              }
              // 普通图层
              for (const layer of mapLayers.FeatureLayers) {
                sublayers.push({
                  title: layer.mapLayerName,
                  id: layer.id,
                  visible: layer.isBaseLayer,
                  maxScale: layer.isArea ? popupScale : 0, // 区域图层显示
                });
              }
              // 栅格图层
              // for (const layer of mapLayers.RasterLayers) {
              //   sublayers.push({
              //     title: layer.mapLayerName,
              //     id: layer.id,
              //     visible: true,
              //   });
              // }
              sublayers.reverse();
              const baseLayer = new MapImageLayer({ url: mapLayers.baseLayer.layerAddress, id: mapLayers.baseLayer.mapLayerName, sublayers });
              const legendLayer = new ImageryLayer({ url: mapLayers.baseLayer.layerAddress, id: mapLayers.baseLayer.mapLayerName }); // 用于加载图例
              mapConstants.mainMap = new Map({
                layers: [baseLayer, legendLayer],
              });
              // dispatch({
              //   type: 'map/getBaseLayer',
              //   payload: baseLayer,
              // });
              mapConstants.baseLayer = baseLayer;
              dispatch({
                type: 'map/getLegendLayer',
                payload: legendLayer,
              });
              const extent = new Extent({
                xmin: 12748163.571481707,
                xmax: 12751351.807024846,
                ymin: 3585571.3320610607,
                ymax: 3587299.0646831924,
                spatialReference: new SpatialReference(102100),
              });
              dispatch({
                type: 'map/mapScale',
                payload: scale,
              });
              dispatch({
                type: 'map/mapPopupScale',
                payload: popupScale,
              });
              // dispatch({
              //   type: 'map/mapExtent',
              //   payload: extent,
              // });
              mapConstants.extent = extent;
              mapConstants.view = new MapView({
                container: this.state.mapDivId,
                ui: { components: [] },
                rotation: 293,
                padding: 320,
                // center: [114.53302201076804, 30.642714242082587],
                // scale,
                extent,
                map: mapConstants.mainMap,
              });
              const scaleBar = new ScaleBar({
                view: mapConstants.view,
                style: 'line',
                unit: 'metric',
              });
              // view.padding.left = 320;
              mapConstants.view.ui.add(
                scaleBar, {
                  position: 'bottom-left',
                });
              // dispatch({
              //   type: 'map/getMap',
              //   payload: map,
              // });
              // dispatch({
              //   type: 'map/getMapView',
              //   payload: view,
              // });
              mapConstants.view.when(() => {
                dispatch({
                  type: 'map/load',
                  payload: true,
                });
                mapConstants.view.on('click', (e) => {
                  if (thisMap.props.stopPropagation) {
                    e.stopPropagation();
                    return false;
                  }
                  // 存储被点击的点
                  dispatch({
                    type: 'map/mapPoint',
                    payload: e.mapPoint,
                  });
                  // addDoorIcon({ map: mainMap, geometry: e.mapPoint});
                  // 获取当前点位，存储屏幕坐标及地理坐标
                  const screenPoint = { x: e.x, y: e.y };
                  dispatch({
                    type: 'map/screenPoint',
                    payload: screenPoint,
                  });
                  if (e.button === 2) {
                    // 判断右键，打开右键菜单,存储屏幕坐标及地理坐标
                    const rightScreenPoint = { x: e.x, y: e.y };
                    dispatch({
                      type: 'map/contextMenu',
                      payload: { left: rightScreenPoint.x, top: rightScreenPoint.y, show: true },
                    });
                    e.stopPropagation();
                  } else { // 关闭右键菜单
                    dispatch({
                      type: 'map/contextMenu',
                      payload: { show: false },
                    });
                  }
                  // 圈选的弹窗
                  const measureLayer = mapConstants.mainMap.findLayerById('圈选');
                  if (measureLayer) {
                    mapConstants.mainMap.remove(measureLayer);
                    dispatch({
                      type: 'map/setSpaceQuery',
                      payload: { load: true, show: true, style: { left: e.screenPoint.x, top: e.screenPoint.y }, point: e.mapPoint, screenPoint: e.screenPoint },
                    });
                  }
                  mapConstants.view.hitTest(e.screenPoint).then(({ results }) => {
                    if (results.length > 0) {
                      const { graphic } = results[0];
                      current.graphic = results[0].graphic;
                      let name;
                      if (graphic) {
                        if (graphic.attributes) {
                          name = graphic.attributes['设备名称'] || graphic.attributes['建筑名称'] || graphic.attributes['罐区名称'] || graphic.attributes['区域名称'] || graphic.attributes['装置区名称'] || graphic.attributes['名称'];
                        }
                        // 判断实景图层是否加载
                        if (graphic.layer.id === '实景地图' || graphic.layer.id === '鼠标示意') {
                          // 切换至实景
                          dispatch({
                            type: 'map/trueMapShow',
                            payload: true,
                          });
                          return false;
                        } else if (name) {
                          // 添加弹窗(地图单击产生的弹窗为唯一，所以key固定)
                          const { infoPops } = this.props;
                          const index = infoPops.findIndex(value => value.key === 'mapClick');
                          const pop = {
                            show: true,
                            key: 'mapClick',
                            uniqueKey: Math.random() * new Date().getTime(),
                          };
                          if (index === -1) {
                            infoPops.push(pop);
                          } else {
                            infoPops.splice(index, 1, pop);
                          }
                          infoPopsModal.mapClick = {
                            screenPoint, screenPointBefore: screenPoint, mapStyle: { width: mapConstants.view.width, height: mapConstants.view.height }, attributes: graphic.attributes, geometry: graphic.geometry, name,
                          };
                          dispatch({
                            type: 'map/queryInfoPops',
                            payload: infoPops,
                          });
                        }
                        if (graphic.attributes.ObjCode || graphic.attributes['唯一编码'] || graphic.attributes.resourceGisCode) {
                          this.props.dispatch({
                            type: 'resourceTree/selectByGISCode',
                            payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode: graphic.attributes.ObjCode || graphic.attributes['唯一编码'] || graphic.attributes.resourceGisCode },
                          }).then(() => {
                            if (this.props.resourceTree.resourceInfo === undefined) {
                              message.error('未请求到资源相关数据');
                            }
                          });
                        } else if (graphic.attributes.isConstructMonitor) {
                          const { list, area, keys } = graphic.attributes;
                          // 作业监控 单独处理
                          dispatch({
                            type: 'resourceTree/saveCtrlResourceType',
                            payload: 'constructMonitor',
                          });
                          dispatch({
                            type: 'constructMonitor/queryMapSelectedList',
                            payload: { list, area, keys },
                          });
                        } else {
                          message.error('未请求到资源相关数据');
                        }
                      } else {
                        dispatch({
                          type: 'map/infoWindow',
                          payload: { show: false, load: false },
                        });
                      }
                    }
                  });
                });
                mapConstants.view.on('drag', (evt) => {
                  if (thisMap.props.stopPropagation) {
                    evt.stopPropagation();
                    return false;
                  }
                  // 禁止鼠标旋转
                  if (evt.button === 2) {
                    evt.stopPropagation();
                  }
                  // 开始拖动
                  const { spaceQueryPop } = this.props;
                  dispatch({
                    type: 'map/contextMenu',
                    payload: { show: false },
                  });
                  switch (evt.action) {
                    case 'start': {
                      // 设备信息气泡窗
                      for (const item of this.props.infoPops) {
                        item.show = false;
                        item.uniqueKey = Math.random() * new Date().getTime();
                      }
                      // 实时数据气泡窗
                      for (const item of this.props.constantlyComponents) {
                        item.show = false;
                      }
                      dispatch({
                        type: 'constantlyData/queryConstantlyComponents',
                        payload: this.props.constantlyComponents,
                      });
                      // 聚合弹窗处理
                      const obj1 = JSON.parse(JSON.stringify(this.props.clusterPopup));
                      dispatch({
                        type: 'map/queryClusterPopup',
                        payload: { show: false, load: obj1.load, data: obj1.data },
                      });
                      // 扩音弹窗处理
                      const paObj = this.props.paPopup;
                      dispatch({
                        type: 'map/queryPAPopup',
                        payload: { show: false, load: false, data: paObj.data },
                      });
                      // 空间查询菜单
                      if (spaceQueryPop.load) {
                        dispatch({
                          type: 'map/setSpaceQuery',
                          payload: {
                            load: true,
                            show: false,
                            style: { left: 0, top: 0 },
                            point: spaceQueryPop.point,
                            screenPoint: spaceQueryPop.screenPoint,
                          },
                        });
                      }
                    }
                      break;
                    default: break;
                  }
                });
                mapConstants.view.on('mouse-wheel', (e) => {
                  if (thisMap.props.stopPropagation) {
                    e.stopPropagation();
                    return false;
                  }
                  const { spaceQueryPop } = this.props;
                  // 暂时关闭右键
                  dispatch({
                    type: 'map/contextMenu',
                    payload: { show: false },
                  });
                  // 弹窗
                  for (const item of this.props.infoPops) {
                    item.show = false;
                    item.uniqueKey = Math.random() * new Date().getTime();
                  }
                  dispatch({
                    type: 'map/queryInfoPops',
                    payload: this.props.infoPops,
                  });
                  // 实时专题图弹窗
                  for (const item of this.props.constantlyComponents) {
                    item.show = false;
                  }
                  dispatch({
                    type: 'constantlyData/queryConstantlyComponents',
                    payload: this.props.constantlyComponents,
                  });
                  // 聚合弹窗处理
                  const obj = JSON.parse(JSON.stringify(this.props.clusterPopup));
                  dispatch({
                    type: 'map/queryClusterPopup',
                    payload: { show: false, load: obj.load, data: obj.data },
                  });
                  // 扩音弹窗处理
                  const paObj = this.props.paPopup;
                  dispatch({
                    type: 'map/queryPAPopup',
                    payload: { show: false, load: false, data: paObj.data },
                  });
                  // 空间查询菜单
                  if (spaceQueryPop.load) {
                    dispatch({
                      type: 'map/setSpaceQuery',
                      payload: { load: true, show: false, style: { left: 0, top: 0 }, point: spaceQueryPop.point, screenPoint: spaceQueryPop.screenPoint },
                    });
                  }
                  if (e.deltaY > 0) {
                    mapConstants.view.scale += 1000;
                  } else {
                    mapConstants.view.scale -= 1000;
                  }
                  e.stopPropagation();
                });
                mapConstants.view.watch('animation', (response) => {
                  if (response === null || response.state === 'finished') {
                    // 弹窗处理
                    const { spaceQueryPop } = this.props;
                    // 弹窗
                    for (const item of this.props.infoPops) {
                      const screenPoint1 = mapConstants.view.toScreen(infoPopsModal[item.key].geometry);
                      infoPopsModal[item.key].screenPointBefore = screenPoint1;
                      infoPopsModal[item.key].screenPoint = screenPoint1;
                      item.uniqueKey = Math.random() * new Date().getTime();
                      item.show = true;
                    }
                    dispatch({
                      type: 'map/queryInfoPops',
                      payload: this.props.infoPops,
                    });
                    // 实时弹窗处理
                    for (const item of this.props.constantlyComponents) {
                      for (const device of constantlyModal[item.type].mapData) {
                        const screenPoint1 = mapConstants.view.toScreen(device.geometry);
                        device.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                        device.style = { left: screenPoint1.x, top: screenPoint1.y };
                      }
                      item.uniqueKey = Math.random() * new Date().getTime();
                      item.show = true;
                    }
                    dispatch({
                      type: 'constantlyData/queryConstantlyComponents',
                      payload: this.props.constantlyComponents,
                    });
                    // 空间查询菜单
                    if (spaceQueryPop.load) {
                      const style = mapConstants.view.toScreen(spaceQueryPop.point);
                      dispatch({
                        type: 'map/setSpaceQuery',
                        payload: { load: true, show: true, style: { left: style.x, top: style.y }, point: spaceQueryPop.point, screenPoint: style },
                      });
                    }
                  } else {
                    // 动画开始时，不渲染弹窗
                    for (const item of this.props.infoPops) {
                      item.show = false;
                      item.uniqueKey = Math.random() * new Date().getTime();
                    }
                    dispatch({
                      type: 'map/queryInfoPops',
                      payload: this.props.infoPops,
                    });
                    for (const item of this.props.constantlyComponents) {
                      item.show = false;
                    }
                    dispatch({
                      type: 'constantlyData/queryConstantlyComponents',
                      payload: this.props.constantlyComponents,
                    });
                  }
                });
                mapConstants.view.watch('scale', () => {
                  // if (newVal > oldVal) {
                  //   mapView.scale += 1000;
                  if (mapConstants.view.scale > 25000) {
                    mapConstants.view.scale = 25000;
                  } else if (mapConstants.view.scale < 1000) {
                    mapConstants.view.scale = 1000;
                  }
                  // } else {
                  //   mapView.scale -= 1000;
                  //   if (mapView.scale < 1000) {
                  //       mapView.scale = 1000;
                  //     }
                  // }
                });
                mapConstants.view.watch('updating', (loading) => {
                  if (!loading) {
                    if (mapConstants.mainMap.findLayerById('报警动画')) {
                      mapConstants.mainMap.reorder(mapConstants.mainMap.findLayerById('报警动画'), mapConstants.mainMap.allLayers.length - 1);
                    }
                    // 弹窗处理
                    const { spaceQueryPop } = this.props;
                    // 弹窗
                    for (const item of this.props.infoPops) {
                      const screenPoint1 = mapConstants.view.toScreen(infoPopsModal[item.key].geometry);
                      infoPopsModal[item.key].screenPointBefore = screenPoint1;
                      infoPopsModal[item.key].screenPoint = screenPoint1;
                      item.uniqueKey = Math.random() * new Date().getTime();
                      item.show = true;
                    }
                    dispatch({
                      type: 'map/queryInfoPops',
                      payload: this.props.infoPops,
                    });
                    // 实时弹窗处理
                    for (const item of this.props.constantlyComponents) {
                      for (const device of constantlyModal[item.type].mapData) {
                        const screenPoint1 = mapConstants.view.toScreen(device.geometry);
                        device.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                        device.style = { left: screenPoint1.x, top: screenPoint1.y };
                      }
                      item.uniqueKey = Math.random() * new Date().getTime();
                      item.show = true;
                    }
                    dispatch({
                      type: 'constantlyData/queryConstantlyComponents',
                      payload: this.props.constantlyComponents,
                    });
                    // 聚合弹窗处理
                    const obj = JSON.parse(JSON.stringify(this.props.clusterPopup));
                    for (const item of obj.data) {
                      const screenPoint1 = mapConstants.view.toScreen(item.geometry);
                      screenPoint1.x -= 20; screenPoint1.y -= 20;
                      // style 的偏移量在css计算会二次渲染，所以在这里一起计算
                      item.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                      item.style = { left: screenPoint1.x, top: screenPoint1.y };
                      item.uniqueKey = Math.random() * new Date().getTime();
                    }
                    const show = (mapConstants.view.scale > this.props.popupScale);
                    dispatch({
                      type: 'map/queryClusterPopup',
                      payload: { show, load: obj.load, data: obj.data },
                    });
                    // 扩音弹窗处理
                    const paObj = this.props.paPopup;
                    for (const item of paObj.data) {
                      const screenPoint1 = mapConstants.view.toScreen(item.data.geometry);
                      item.data.style = { left: screenPoint1.x, top: screenPoint1.y, width: item.data.extent.width / 2, height: item.data.extent.width / 2, lineHeight: `${item.data.extent.width / 2}px` };
                      item.uniqueKey = Math.random() * new Date().getTime();
                    }
                    dispatch({
                      type: 'map/queryPAPopup',
                      payload: { show: true, load: true, data: paObj.data },
                    });
                    // 空间查询菜单
                    if (spaceQueryPop.load) {
                      const style = mapConstants.view.toScreen(spaceQueryPop.point);
                      dispatch({
                        type: 'map/setSpaceQuery',
                        payload: { load: true, show: true, style: { left: style.x, top: style.y }, point: spaceQueryPop.point, screenPoint: style },
                      });
                    }
                  }
                });
              });
              const thisMap = this;
              // let getAlarm = setInterval(() => {
              //   if (!this.props.fetchingAlarm && !this.props.fetchLayers) {
              //     clearInterval(getAlarm);
              //     getAlarm = null;
              //     const { list } = thisMap.props;
              //     // 获取到报警数据后，渲染图标
              //     for (const alarm of list) {
              //       searchByAttr({ searchText: alarm.resourceGisCode, searchFields: ['ObjCode'] }).then(
              //         (res) => {
              //           if (res.length > 0) {
              //             if (list.length === 1) {
              //               mapView.goTo({ center: res[0].feature.geometry, scale: popupScale - 10 }).then(() => {
              //                 alarmAnimation(map, alarm.alarmType, res[0].feature.geometry, alarm, {}, dispatch, popupScale);
              //               });
              //             } else {
              //               alarmAnimation(map, alarm.alarmType, res[0].feature.geometry, alarm, {}, dispatch, popupScale);
              //             }
              //           }
              //         }
              //       );
              //     }
              //   }
              // }, 50);
            });
          });
      }
    }, 100);
    dispatch({
        type: 'homepage/getMapHeight',
        payload: { domType: 'map' },
      }
    );
  }
  preventContext= (e) => {
    e.preventDefault();
  };
  switchMap = () => {
    const { dispatch } = this.props;
    let roadLine;
    for (const layer of mapLayers.FeatureLayers) {
      if (Number(layer.layerType) === 4) {
        // 取出道路图
        roadLine = layer.mapLayerName;
        break;
      }
    }
    trueMapLocate(mapConstants.mainMap, mapConstants.view, roadLine, dispatch);
  };
  test = (type) => {
    const layer = mapConstants.mainMap.findLayerById('环保专题图');
    const graphic1 = layer.graphics.items.find(value => value.attributes.gISCode === current.graphic.attributes.gISCode && value.attributes.isCirle === undefined);
    const graphic2 = layer.graphics.items.find(value => value.attributes.gISCode === current.graphic.attributes.gISCode && value.attributes.isCirle === true);
    // const { symbol } = graphic1;
    const { symbol } = graphic2;
    const newGraphic1 = graphic1.clone();
    const newGraphic = graphic2.clone();
    // const g
    switch (type) {
      case 'x1':
        symbol.xoffset += 0.5;
        newGraphic.symbol = symbol;
        break;
      case 'x2':
        symbol.xoffset -= 0.5;
        newGraphic.symbol = symbol;
        break;
      case 'y1':
        symbol.yoffset += 0.5;
        newGraphic.symbol = symbol;
        break;
      case 'y2':
        symbol.yoffset -= 0.5;
        newGraphic.symbol = symbol;
        break;
      default: break;
    }
    layer.graphics.remove(graphic2);
    layer.graphics.remove(graphic1);
    layer.graphics.add(newGraphic);
    layer.graphics.add(newGraphic1);
  };
  showLegend = () => {
    const { legendIndex } = this.state;
    this.setState({
      legendIndex: legendIndex === -1 ? 12 : -1,
    });
  };
  render() {
    const { stopPropagation, trueMapShow, dispatch, serviceUrl, contextPosition, screenPoint, mapPoint, constantlyComponents, infoPops, clusterPopup, baseLayer, paPopup, mapHeight } = this.props;
    const { legendIndex } = this.state;
    const { allSublayers } = baseLayer;
    // 实时专题图气泡窗
    const ConstantlyComponents = constantlyComponents.map(item =>
      (item.show && constantlyModal[item.type].mapData.length > 0 ? <ConstantlyTemplate key={Math.random() * new Date().getTime()} uniqueKey={item.uniqueKey} constantlyValue={constantlyModal[item.type].mapData} /> : null)
    );
    // 资源气泡窗
    const infoPropComponents = infoPops.map(item =>
      (item.show ? <InfoPops key={item.key} uniqueKey={item.uniqueKey} popValue={infoPopsModal[item.key]} popKey={item.key} /> : null)
    );
    // 聚合气泡窗
    const clusterPropComponents =
      (clusterPopup.show && clusterPopup.load ? clusterPopup.data.map(item => <ClusterPopup key={item.key} uniqueKey={item.uniqueKey} popValue={item} popKey={item.key} />) : null);
    // 扩音对讲气泡窗
    const paPopupComponents =
      (paPopup.show && paPopup.load ? paPopup.data.map(item => <PAPopup dispatch={dispatch} key={item.uniqueKey} uniqueKey={item.uniqueKey} data={item.data} />) : null);
    const mapOptions = {
      url: `${serviceUrl.mapApiUrl}arcgis/arcgis_js_api/library/4.7/init.js`,
    };
    const mapStyle = { height: mapHeight, width: '100%' };
    return (
      serviceUrl.mapApiUrl === '' ? null : (
        <div className={styles.warp} style={{ display: trueMapShow ? 'none' : '' }} >
          <EsriLoaderReact options={mapOptions} />
          <Search stopPropagation={stopPropagation} />
          <LeftBoard />
          {/* <div style={{ position: 'fixed', top: 400, right: 500, zIndex: 3000, width: 200, height: 200, background: '#fff' }}> */}
          {/* <div>x:   <Button onClick={() => this.test('x1')}>+</Button> <Button onClick={() => this.test('x2')}>-</Button></div> */}
          {/* <div>y:   <Button onClick={() => this.test('y1')}>+</Button> <Button onClick={() => this.test('y2')}>-</Button></div> */}
          {/* </div> */}
          {/* <div style={{ overflow: 'hidden' }}> */}
          {/* { allSublayers ? allSublayers.items.map((item) => { */}
          {/* return ( */}
          {/* <Switch checked={ item.visible } onChange={() => { item.visible = !item.visible }} checkedChildren={item.title} unCheckedChildren={item.title} /> */}
          {/* ) */}
          {/* }) : null } */}
          {/* </div> */}
          <div
            id={this.state.mapDivId}
            style={mapStyle}
            className={styles.map}
            onContextMenu={this.preventContext}
          >
            <Legend mapHeight={mapHeight} legendIndex={legendIndex} />
            <MapTools stopPropagation={stopPropagation} showLegend={this.showLegend} />
            {contextPosition.show ? <ContextMenu map={mapConstants.mainMap} dispatch={dispatch} position={contextPosition} screenPoint={screenPoint} mapPoint={mapPoint} /> : null}
            <BreathDemo />
            <DemoInfoTemplate />
            { infoPropComponents }
            { ConstantlyComponents }
            { paPopupComponents }
            { clusterPropComponents }
            <AlarmCount />
            <MeasurePop />
            <SpaceQuery />
          </div>
          <div className={styles.switch} onClick={this.switchMap}>
            <div className={styles['arc-map']} ><img src={trueMap} alt="切换至地图" /></div>
          </div>
        </div>
      ));
  }
}
