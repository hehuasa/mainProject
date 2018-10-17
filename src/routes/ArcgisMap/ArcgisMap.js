import React, { PureComponent } from 'react';
import { message, Button } from 'antd';
import esriLoader from 'esri-loader';
import EsriLoaderReact from 'esri-loader-react';
import { connect } from 'dva';
import { constantlyModal, infoPopsModal } from '../../services/constantlyModal';
import { getBrowserStyle } from '../../utils/utils';
import { mapLayers, mapConstants } from '../../services/mapConstant';
import styles from './index.less';
import { hoveringAlarm, switchAlarmIcon } from '../../utils/MapService';

const current = {};
let symboltt = {};
const mapStateToProps = ({ map, homepage, resourceTree, constantlyData, loading, tabs, global }) => {
  const { popupScale, baseLayer, trueMapShow, paPopup, stopPropagation, clusterPopup, infoPops, spaceQueryPop } = map;
  const data = [];
  for (const item of constantlyData.constantlyComponents) {
    data.push(item);
  }
  return {
    serviceUrl: global.serviceUrl,
    mapHeight: homepage.mapHeight,
    stopPropagation,
    popupScale,
    baseLayer,
    trueMapShow,
    constantlyComponents: data,
    infoPops,
    clusterPopup,
    spaceQueryPop,
    paPopup,
    activeKey: tabs.activeKey,
    resourceInfo: resourceTree.resourceInfo,
    fetchingMapApi: loading.effects['global/fetchUrl'],
  };
};

@connect(mapStateToProps)
export default class ArcgisMap extends PureComponent {
  constructor(props) {
    super(props);
    const timeStample = new Date().getTime();
    this.state = {
      mapDivId: `mapdiv${timeStample}`,
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
          ['esri/layers/MapImageLayer',
            'esri/layers/TileLayer',
            'esri/Map',
            'esri/views/MapView',
            'esri/geometry/Extent',
            'esri/geometry/SpatialReference',
            'esri/widgets/ScaleBar',
            'esri/layers/GraphicsLayer',
          ]
        ).then(
          ([MapImageLayer, TileLayer, Map, MapView, Extent, SpatialReference, ScaleBar, GraphicsLayer]) => {
            // esriLoader.loadCss('/mapApi/esri/css/main.css');
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
                  visible: false,
                  // visible: layer.isBaseLayer,
                  maxScale: layer.isArea ? popupScale : 0, // 区域图层显示
                });
              }
                for (const layer of mapLayers.RasterLayers) {
                    sublayers.push({
                        title: layer.mapLayerName,
                        id: layer.id,
                        visible: false,
                        // visible: layer.isBaseLayer,
                        // maxScale: layer.isArea ? popupScale : 0, // 区域图层显示
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
              // 切片图层
              const baseTie = mapLayers.FeatureLayers.find(value => value.isBaseLayer);
              const tileLayer = new MapImageLayer({ url: baseTie.layerAddress, id: '底图' });
              sublayers.reverse();
              const baseLayer = new MapImageLayer({ url: mapLayers.baseLayer.layerAddress, id: mapLayers.baseLayer.mapLayerName, sublayers });
              // const legendLayer = new ImageryLayer({ url: mapLayers.baseLayer.layerAddress, id: mapLayers.baseLayer.mapLayerName }); // 用于加载图例
              mapConstants.mainMap = new Map({
                layers: [baseLayer, tileLayer],
              });
              mapConstants.baseLayer = baseLayer;
              const extent = new Extent({
                xmin: 12748163.571481707,
                xmax: 12751351.807024846,
                ymin: 3585571.3320610607,
                ymax: 3587299.0646831924,
                spatialReference: new SpatialReference(102100),
              });
              const accessInfoExtent = new Extent({
                xmin: 12748004.159704551,
                xmax: 12751511.218802001,
                ymin: 3585484.945429954,
                ymax: 3587385.451314299,
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
              mapConstants.extent = extent;
              mapConstants.accessInfoExtent = accessInfoExtent;
              // mapConstants.domWarp = this.warp;
              mapConstants.view = new MapView({
                container: this.state.mapDivId,
                ui: { components: [] },
                rotation: 292.7,
                padding: 320,
                // center: [114.53302201076804, 30.642714242082587],
                // scale,
                extent,
                map: mapConstants.mainMap,
              });
              const scaleBar = new ScaleBar({
                container: this.scaleBarWap,
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
                mapConstants.view.goTo({
                  extent,
                });
                const setContentInfo = (feature) => {
                  mapConstants.view.popup.visible = false; // 关闭弹出窗口
                  // clearTwinkle(dispatch, feature.graphic.attributes);
                };
                // 显示对应图层

                const popupTemplate = {
                  title: '',
                  content: setContentInfo,
                };
                const alarmLayer = new GraphicsLayer({ id: '报警动画', minScale: popupScale, popupTemplate });
                const alarmSelectLayer = new GraphicsLayer({ id: '报警选中', minScale: popupScale, popupTemplate });
                mapConstants.mainMap.add(alarmLayer);
                mapConstants.mainMap.add(alarmSelectLayer);
                switchAlarmIcon({ layer: alarmLayer });
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
                  // 首先清空报警选中
                  hoveringAlarm({ layer: mapConstants.mainMap.findLayerById('报警选中') });
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
                    const { infoPops } = this.props;
                    current.graphic = results[0].graphic;

                    if (results.length > 0) {
                      const { graphic } = results[0];
                      if (graphic.layer === mapConstants.mainMap.findLayerById('报警动画')) {
                        hoveringAlarm({ layer: mapConstants.mainMap.findLayerById('报警选中'), geometry: graphic.geometry, alarm: graphic.attributes, infoPops, screenPoint, dispatch });
                      }
                      // 环保地图单独处理
                      if (graphic.layer === mapConstants.mainMap.findLayerById('环保专题图')) {
                        dispatch({
                          type: 'resourceTree/selectByGISCode',
                          payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode: graphic.attributes.ObjCode || graphic.attributes['唯一编码'] || graphic.attributes.resourceGisCode },
                        });
                        e.stopPropagation();
                        return false;
                      }

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
                          const index = infoPops.findIndex(value => value.key === 'mapClick');
                          const index1 = infoPops.findIndex(value => Number(value.gISCode) === Number(graphic.attributes.ObjCode));
                          const pop = {
                            show: true,
                            key: 'mapClick',
                            gISCode: graphic.attributes.ObjCode,
                            uniqueKey: Math.random() * new Date().getTime(),
                          };
                          if (index1 !== -1) {
                            return false;
                          }
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
                            if (this.props.resourceInfo === undefined) {
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
                  // const { spaceQueryPop } = this.props;
                  // dispatch({
                  //   type: 'map/contextMenu',
                  //   payload: { show: false },
                  // });
                  //   console.log('evt.action', evt.action);
                  switch (evt.action) {
                    case 'start': {
                      dispatch({
                        type: 'map/showPopup',
                        payload: false,
                      });
                      // dispatch({
                      //   type: 'map/contextMenu',
                      //   payload: { show: false },
                      // });
                      // // 设备信息气泡窗
                      // for (const item of this.props.infoPops) {
                      //   item.show = false;
                      //   item.uniqueKey = Math.random() * new Date().getTime();
                      // }
                      // // 实时数据气泡窗
                      // for (const item of this.props.constantlyComponents) {
                      //   item.show = false;
                      // }
                      // dispatch({
                      //   type: 'constantlyData/queryConstantlyComponents',
                      //   payload: this.props.constantlyComponents,
                      // });
                      // // 聚合弹窗处理
                      // const obj1 = JSON.parse(JSON.stringify(this.props.clusterPopup));
                      // dispatch({
                      //   type: 'map/queryClusterPopup',
                      //   payload: { show: false, load: obj1.load, data: obj1.data },
                      // });
                      // // 扩音弹窗处理
                      // const paObj = this.props.paPopup;
                      // dispatch({
                      //   type: 'map/queryPAPopup',
                      //   payload: { show: false, load: false, data: paObj.data },
                      // });
                      // // 空间查询菜单
                      // if (spaceQueryPop.load) {
                      //   dispatch({
                      //     type: 'map/setSpaceQuery',
                      //     payload: {
                      //       load: true,
                      //       show: false,
                      //       style: { left: 0, top: 0 },
                      //       point: spaceQueryPop.point,
                      //       screenPoint: spaceQueryPop.screenPoint,
                      //     },
                      //   });
                      // }
                    }
                      break;
                    default: break;
                  }
                });
                // mapConstants.view.on('pointer-move', (evt) => {
                //   console.log('evt', evt);
                // });
                mapConstants.view.on('mouse-wheel', (e) => {
                  if (thisMap.props.stopPropagation) {
                    e.stopPropagation();
                    return false;
                  }
                  dispatch({
                    type: 'map/showPopup',
                    payload: false,
                  });
                  // const { spaceQueryPop } = this.props;
                  // // 暂时关闭右键
                  // dispatch({
                  //   type: 'map/contextMenu',
                  //   payload: { show: false },
                  // });
                  // // 弹窗
                  // for (const item of this.props.infoPops) {
                  //   item.show = false;
                  //   item.uniqueKey = Math.random() * new Date().getTime();
                  // }
                  // dispatch({
                  //   type: 'map/queryInfoPops',
                  //   payload: this.props.infoPops,
                  // });
                  // // 实时专题图弹窗
                  // for (const item of this.props.constantlyComponents) {
                  //   item.show = false;
                  // }
                  // dispatch({
                  //   type: 'constantlyData/queryConstantlyComponents',
                  //   payload: this.props.constantlyComponents,
                  // });
                  // // 聚合弹窗处理
                  // const obj = JSON.parse(JSON.stringify(this.props.clusterPopup));
                  // dispatch({
                  //   type: 'map/queryClusterPopup',
                  //   payload: { show: false, load: obj.load, data: obj.data },
                  // });
                  // // 扩音弹窗处理
                  // const paObj = this.props.paPopup;
                  // dispatch({
                  //   type: 'map/queryPAPopup',
                  //   payload: { show: false, load: false, data: paObj.data },
                  // });
                  // // 空间查询菜单
                  // if (spaceQueryPop.load) {
                  //   dispatch({
                  //     type: 'map/setSpaceQuery',
                  //     payload: { load: true, show: false, style: { left: 0, top: 0 }, point: spaceQueryPop.point, screenPoint: spaceQueryPop.screenPoint },
                  //   });
                  // }
                  if (e.deltaY > 0) {
                    mapConstants.view.scale += 1000;
                  } else {
                    mapConstants.view.scale -= 1000;
                  }
                  e.stopPropagation();
                });
                // mapConstants.view.watch('animation', (response) => {
                //   if (response === null || response.state === 'finished') {
                //       console.log('response', response);
                //     // 弹窗处理
                //     const { spaceQueryPop } = this.props;
                //     dispatch({
                //       type: 'map/showPopup',
                //       payload: true,
                //     });
                //     // 弹窗
                //     for (const item of this.props.infoPops) {
                //       const screenPoint1 = mapConstants.view.toScreen(infoPopsModal[item.key].geometry);
                //       infoPopsModal[item.key].screenPointBefore = screenPoint1;
                //       infoPopsModal[item.key].screenPoint = screenPoint1;
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //       item.show = true;
                //     }
                //     dispatch({
                //       type: 'map/queryInfoPops',
                //       payload: this.props.infoPops,
                //     });
                //     // 实时弹窗处理
                //     for (const item of this.props.constantlyComponents) {
                //       for (const device of constantlyModal[item.type].mapData) {
                //         const screenPoint1 = mapConstants.view.toScreen(device.geometry);
                //         device.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                //         device.style = { left: screenPoint1.x, top: screenPoint1.y };
                //       }
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //       item.show = true;
                //     }
                //     dispatch({
                //       type: 'constantlyData/queryConstantlyComponents',
                //       payload: this.props.constantlyComponents,
                //     });
                //     // 空间查询菜单
                //     if (spaceQueryPop.load) {
                //       const style = mapConstants.view.toScreen(spaceQueryPop.point);
                //       dispatch({
                //         type: 'map/setSpaceQuery',
                //         payload: { load: true, show: true, style: { left: style.x, top: style.y }, point: spaceQueryPop.point, screenPoint: style },
                //       });
                //     }
                //   } else {
                //     // 动画开始时，不渲染弹窗
                //     dispatch({
                //       type: 'map/showPopup',
                //       payload: false,
                //     });
                //   }
                // });
                mapConstants.view.watch('scale', () => {
                  // if (newVal > oldVal) {
                  //   mapView.scale += 1000;
                  if (mapConstants.view.scale > 25000) {
                    mapConstants.view.scale = 25000;
                  } else if (mapConstants.view.scale < 500) {
                    mapConstants.view.scale = 500;
                  }
                  // } else {
                  //   mapView.scale -= 1000;
                  //   if (mapView.scale < 1000) {
                  //       mapView.scale = 1000;
                  //     }
                  // }
                });
                // mapConstants.view.watch('updating', (loading) => {
                //   if (!loading) {
                //       console.log('loading', loading);
                //     if (mapConstants.mainMap.findLayerById('报警动画')) {
                //       mapConstants.mainMap.reorder(mapConstants.mainMap.findLayerById('报警动画'), mapConstants.mainMap.allLayers.length - 1);
                //     }
                //     dispatch({
                //       type: 'map/showPopup',
                //       payload: true,
                //     });
                //     // 弹窗处理
                //     const { spaceQueryPop } = this.props;
                //     // 弹窗
                //     for (const item of this.props.infoPops) {
                //       const screenPoint1 = mapConstants.view.toScreen(infoPopsModal[item.key].geometry);
                //       infoPopsModal[item.key].screenPointBefore = screenPoint1;
                //       infoPopsModal[item.key].screenPoint = screenPoint1;
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //       item.show = true;
                //     }
                //     dispatch({
                //       type: 'map/queryInfoPops',
                //       payload: this.props.infoPops,
                //     });
                //     // 实时弹窗处理
                //     for (const item of this.props.constantlyComponents) {
                //       for (const device of constantlyModal[item.type].mapData) {
                //         const screenPoint1 = mapConstants.view.toScreen(device.geometry);
                //         device.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                //         device.style = { left: screenPoint1.x, top: screenPoint1.y };
                //       }
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //       item.show = true;
                //     }
                //     dispatch({
                //       type: 'constantlyData/queryConstantlyComponents',
                //       payload: this.props.constantlyComponents,
                //     });
                //     // 聚合弹窗处理
                //     const obj = JSON.parse(JSON.stringify(this.props.clusterPopup));
                //     for (const item of obj.data) {
                //       const screenPoint1 = mapConstants.view.toScreen(item.geometry);
                //       screenPoint1.x -= 20; screenPoint1.y -= 20;
                //       // style 的偏移量在css计算会二次渲染，所以在这里一起计算
                //       item.currentStyle = { left: screenPoint1.x, top: screenPoint1.y };
                //       item.style = { left: screenPoint1.x, top: screenPoint1.y };
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //     }
                //     const show = (mapConstants.view.scale > this.props.popupScale);
                //     dispatch({
                //       type: 'map/queryClusterPopup',
                //       payload: { show, load: obj.load, data: obj.data },
                //     });
                //     // 扩音弹窗处理
                //     const paObj = this.props.paPopup;
                //     for (const item of paObj.data) {
                //       const screenPoint1 = mapConstants.view.toScreen(item.data.geometry);
                //       item.data.style = { left: screenPoint1.x, top: screenPoint1.y, width: item.data.extent.width / 2, height: item.data.extent.width / 2, lineHeight: `${item.data.extent.width / 2}px` };
                //       item.uniqueKey = Math.random() * new Date().getTime();
                //     }
                //     dispatch({
                //       type: 'map/queryPAPopup',
                //       payload: { show: true, load: true, data: paObj.data },
                //     });
                //     // 空间查询菜单
                //     if (spaceQueryPop.load) {
                //       const style = mapConstants.view.toScreen(spaceQueryPop.point);
                //       dispatch({
                //         type: 'map/setSpaceQuery',
                //         payload: { load: true, show: true, style: { left: style.x, top: style.y }, point: spaceQueryPop.point, screenPoint: style },
                //       });
                //     }
                //   } else {
                //     dispatch({
                //       type: 'map/showPopup',
                //       payload: false,
                //     });
                //   }
                // });
                mapConstants.view.watch('stationary', (loading, stationary1, target, view) => {
                  // const loading = newExtent.equals(oldExtent);
                  // console.log('resizing', stationary)
                  //   console.log('resizing1', stationary1)
                  if (loading) {
                    if (mapConstants.mainMap.findLayerById('报警动画')) {
                      mapConstants.mainMap.reorder(mapConstants.mainMap.findLayerById('报警选中'), mapConstants.mainMap.allLayers.length - 1);
                      mapConstants.mainMap.reorder(mapConstants.mainMap.findLayerById('报警动画'), mapConstants.mainMap.allLayers.length - 2);
                    }
                    // 存储当前extent
                    if (this.props.activeKey.indexOf('homePage') !== -1) {
                      mapConstants.currentExtent = view.extent;
                    }

                    dispatch({
                      type: 'map/showPopup',
                      payload: true,
                    });
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
                  // else {
                  //     dispatch({
                  //         type: 'map/showPopup',
                  //         payload: false,
                  //     });
                  // }
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
    test = (type) => {
      const layer = mapConstants.mainMap.findLayerById('环保专题图');
      // const graphic1 = layer.graphics.items.find(value => value.attributes.gISCode === current.graphic.attributes.gISCode && value.attributes.isCirle === undefined);
      // const graphic2 = layer.graphics.items.find(value => value.attributes.gISCode === current.graphic.attributes.gISCode && value.attributes.isBox === true);
      const graphic2 = layer.graphics.items.find(value => value.attributes.index === current.graphic.attributes.index);
      if (!graphic2) {
        return false;
      }
      // const { symbol } = graphic1;
      const { symbol } = graphic2;
      // const newGraphic1 = graphic1.clone();
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
      symboltt = symbol;
      layer.graphics.remove(graphic2);
      // layer.graphics.remove(graphic1);
      layer.graphics.add(newGraphic);
      // layer.graphics.add(newGraphic1);
    };
    render() {
      const { trueMapShow, serviceUrl, mapHeight } = this.props;
      const mapOptions = {
        url: '/mapApi/init.js',
      };
      const mapStyle = { height: mapHeight };
      return (
        serviceUrl.mapApiUrl === '' ? null : (
          <div ref={(ref) => { this.warp = ref; }} className={styles.warp} style={{ display: trueMapShow ? 'none' : '' }} >
            <EsriLoaderReact options={mapOptions} />
            <div
              id={this.state.mapDivId}
              style={mapStyle}
              className={styles.map}
            />
            {/* <div style={{ position: 'fixed', top: 400, right: 500, zIndex: 3000, width: 200, height: 200, background: '#fff' }}> */}
            {/* <div>x:   <Button onClick={() => this.test('x1')}>+</Button> <Button onClick={() => this.test('x2')}>-</Button></div> */}
            {/* <div>y:   <Button onClick={() => this.test('y1')}>+</Button> <Button onClick={() => this.test('y2')}>-</Button></div> */}
            {/* offsetx:{symboltt.xoffset} */}
            {/* offsety:{symboltt.yoffset} */}
            {/* </div> */}
            <div className={styles.scalebar} ref={(ref) => { this.scaleBarWap = ref; }} />
          </div>
        ));
    }
}
