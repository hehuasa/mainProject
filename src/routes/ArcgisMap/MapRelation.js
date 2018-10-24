import React, { PureComponent } from 'react';
// import { Button } from 'antd';
import { connect } from 'dva';
import MapTools from './MapTools/index';
import ContextMenu from './ContextMenu/ContextMenu';
import MeasurePop from './infoWindow/MeasurePop/MeasurePop';
import SpaceQuery from './infoWindow/spaceQuery/SpaceQuery';
import AlarmCount from './infoWindow/AlarmCount';
import ConstantlyTemplate from './infoWindow/ConstantlyTem/ConstantlyTemplate';
import InfoPops from './infoWindow/Template/InfoPops';
import ClusterPopup from './infoWindow/ClusterPopup/ClusterPopup';
import AccessPopup from './infoWindow/AccessPopup/AccessPopup';
import PAPopup from './infoWindow/PApopup/PApopup';
import { constantlyModal, infoPopsModal } from '../../services/constantlyModal';
import { mapLayers, mapConstants } from '../../services/mapConstant';
import styles from './index.less';
import Search from './Sraech';
import LeftBoard from './LeftBoard';
import {
  trueMapLocate,
} from '../../utils/MapService';
import trueMap from '../../assets/map/truemap.jpg';
import map from '../../assets/map/map.jpg';
import weix from '../../assets/map/weix.png';
import Legend from './Legend/Legend';

const current = {};

const mapStateToProps = ({ map, homepage, websocket, alarm, resourceTree, constantlyData, loading, global }) => {
  const { infoWindow, scale, popupScale, baseLayer, trueMapShow, locateTrueMap, mapPoint, screenBeforePoint, searchDeviceArray, screenPoint, popupShow,
    constantlyValue, doorConstantlyValue, doorAreaConstantlyValue, gasConstantlyValue, envConstantlyValue, paPopup, stopPropagation, accessPops,
    vocConstantlyValue, waterConstantlyValue, steamConstantlyValue, contextPosition, clusterPopup, isDraw,
    crackingConstantlyValue, generatorConstantlyValue, largeUnitConstantlyValue, boilerConstantlyValue, infoPops, spaceQueryPop,
  } = map;
  const data = [];
  for (const item of constantlyData.constantlyComponents) {
    data.push(item);
  }
  const { show, load } = accessPops;
  const accessData = [];
  for (const item of accessPops.data) {
    accessData.push(item);
  }
  const newAccessPops = { show, load, data: accessData };
  return {
    serviceUrl: global.serviceUrl,
    infoWindow,
    mapHeight: homepage.mapHeight,
    scale,
    stopPropagation,
    isDraw,
    popupScale,
    baseLayer,
    popupShow,
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
    accessPops: newAccessPops,
    paPopup,
    resourceTree,
    fetchingAlarm: loading.effects['alarm/fetch'],
    fetchingMapApi: loading.effects['global/fetchUrl'],
    fetchLayers: loading.effects['map/fetchLayers'],
  };
};

@connect(mapStateToProps)
export default class MapRelation extends PureComponent {
  constructor(props) {
    super(props);
    const timeStample = new Date().getTime();
    this.state = {
      mapDivId: `mapdiv${timeStample}`,
      legendIndex: -1,
    };
  }

  preventContext= (e) => {
    e.preventDefault();
  };
  switchMap = (type) => {
    const { dispatch } = this.props;
    const switching = (showType) => {
      const tileLayer = mapConstants.mainMap.findLayerById('底图');
      const id = mapLayers.RasterLayers[0].id;
      const newLayer = mapConstants.baseLayer.findSublayerById(id); // 卫星图
      if (showType === 1) {
        tileLayer.visible = true;
        newLayer.visible = false;
      } else {
        tileLayer.visible = false;
        newLayer.visible = true;
      }
    };
    switch (Number(type)) {
      case 1:
        switching(1);
        break;
      case 2:
        switching(2);
        break;
      case 3:
        {
          let roadLine;
          for (const layer of mapLayers.FeatureLayers) {
            if (Number(layer.layerType) === 4) {
              // 取出道路图
              roadLine = layer.mapLayerName;
              break;
            }
          }
          trueMapLocate(mapConstants.mainMap, mapConstants.view, roadLine, dispatch);
        }
        break;
      default: break;
    }
  };

  showLegend = () => {
    const { legendIndex } = this.state;
    this.setState({
      legendIndex: legendIndex === -1 ? 12 : -1,
    });
  };

  render() {
    const { stopPropagation, popupShow, trueMapShow, dispatch, serviceUrl, contextPosition, screenPoint, mapPoint, constantlyComponents, infoPops, clusterPopup, accessPops, baseLayer, paPopup, mapHeight } = this.props;
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
    const clusterPropComponents = () => {
      return clusterPopup.show && clusterPopup.load ? clusterPopup.data.map(item => <ClusterPopup key={item.key} uniqueKey={item.uniqueKey} popValue={item} popKey={item.key} />) : null
    };
    // 扩音对讲气泡窗
    const paPopupComponents = () => {
      return paPopup.show && paPopup.load ? paPopup.data.map(item => <PAPopup dispatch={dispatch} key={item.uniqueKey} uniqueKey={item.uniqueKey} data={item.data} />) : null
    };
    // 门禁气泡窗
    const accessPopupComponents = () => {
      return accessPops.show && accessPops.load ? accessPops.data.map(item => <AccessPopup dispatch={dispatch} key={item.uniqueKey} uniqueKey={item.uniqueKey} data={item.data} />) : null;
    };
    const mapStyle = { height: mapHeight };
    return (
      serviceUrl.mapApiUrl === '' ? null : (
        <div className={styles.warpR} style={{ display: trueMapShow ? 'none' : '' }} >
          <Search stopPropagation={stopPropagation} />
          <LeftBoard />
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
            {popupShow && contextPosition.show ? <ContextMenu map={mapConstants.mainMap} dispatch={dispatch} position={contextPosition} screenPoint={screenPoint} mapPoint={mapPoint} /> : null}
            { popupShow ? infoPropComponents : null }
            { popupShow ? ConstantlyComponents : null }
            { popupShow ? paPopupComponents() : null }
            { popupShow ? clusterPropComponents() : null }
            { popupShow ? accessPopupComponents() : null }
            <AlarmCount />
            <MeasurePop />
            <SpaceQuery />
          </div>
          <div className={styles.switch}>
            <div className={styles.arcMap} onClick={() => { this.switchMap(1); }} ><img src={map} alt="切换至地图" /></div>
            <div className={styles.arcMapHide} onClick={() => { this.switchMap(2); }}><img src={weix} alt="切换至卫星图" /></div>
            <div className={styles.arcMapHide} onClick={() => { this.switchMap(3); }} ><img src={trueMap} alt="切换至实景" /></div>
          </div>
        </div>
      ));
  }
}
