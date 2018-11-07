import React, { PureComponent } from 'react';
import { Steps, Icon, Button } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import arrow from '../../../assets/emergency/arrow.png';
import arrowActive from '../../../assets/emergency/arrow-active.png';
import { mapConstants } from '../../../services/mapConstant';
import { changeVideoPosition, changeVideoSize, resetAccessStyle } from '../../../utils/utils';
import { infoPopsModal } from '../../../services/constantlyModal';

const { Step } = Steps;
@connect(({ emergency, homepage, video, global, accessControl, map, resourceTree }) => ({
  flowNodeTemplateList: emergency.flowNodeTemplateList,
  eventID: emergency.eventId,
  flowExcuteInfo: emergency.flowExcuteInfo,
  eventInfoReport: emergency.eventInfoReport,
  videoFooterHeight: homepage.videoFooterHeight,
  rightCollapsed: global.rightCollapsed,
  videoPosition: video.position,
  videoShow: video.show,
  popupScale: map.popupScale,
  searchDeviceArray: map.searchDeviceArray,
  resourceInfo: resourceTree.resourceInfo,
  accessControlShow: accessControl.show,
  infoPops: map.infoPops,
}))
export default class EmergencyCommand extends PureComponent {
  componentDidMount() {
    const { dispatch, eventID } = this.props;
    dispatch({
      type: 'emergency/getFlowNodeTemplateList',
    });
    dispatch({
      type: 'emergency/getFlowExcuteInfo',
      payload: { id: eventID },
    }).then(() => {
      const { flowExcuteInfo } = this.props;
      dispatch({
        type: 'emergency/saveCurrent',
        payload: flowExcuteInfo.eventStatu,
      });
      dispatch({
        type: 'emergency/saveViewNode',
        payload: flowExcuteInfo.eventStatu,
      });
    });
  }
  returnMap = () => {
    const { eventInfoReport, dispatch, popupScale } = this.props;
    const { accessInfoExtent } = mapConstants;
    const { gISCode } = eventInfoReport;
    dispatch({
      type: 'tabs/active',
      payload: { key: '/homePage' },
    }).then(() => {
      const { videoFooterHeight, rightCollapsed, accessControlShow, videoPosition } = this.props;
      changeVideoPosition('homePage', rightCollapsed, videoPosition, dispatch);
      // 恢复看板
      if (rightCollapsed) {
        dispatch({
          type: 'global/changeRightCollapsed',
          payload: false,
        }).then(() => {
          changeVideoSize(videoFooterHeight, dispatch, 'show');
          resetAccessStyle(accessControlShow, dispatch, accessInfoExtent).then(() => {
            dispatch({
              type: 'map/searchDeviceByAttr',
              payload: { searchText: gISCode, searchFields: ['ObjCode'] },
            }).then(() => {
              dispatch({
                type: 'resourceTree/selectEventByGISCode',
                payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode, event: eventInfoReport },
              });
              const a = setInterval(() => {
                if (mapConstants.view.goTo) {
                  clearInterval(a);
                  mapConstants.view.goTo({
                    center: this.props.searchDeviceArray[0].feature.geometry,
                    scale: popupScale - 10,
                  }).then(() => {
                    const screenPoint = mapConstants.view.toScreen(this.props.searchDeviceArray[0].feature.geometry);
                    this.getPop(screenPoint, gISCode);
                  });
                }
              }, 100);
            });
          });
        });
      } else {
        resetAccessStyle(accessControlShow, dispatch, accessInfoExtent).then(() => {
          dispatch({
            type: 'map/searchDeviceByAttr',
            payload: { searchText: gISCode, searchFields: ['ObjCode'] },
          }).then(() => {
            dispatch({
              type: 'resourceTree/selectEventByGISCode',
              payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode, event: eventInfoReport },
            });
            const a = setInterval(() => {
              if (mapConstants.view.goTo) {
                clearInterval(a);
                mapConstants.view.goTo({
                  center: this.props.searchDeviceArray[0].feature.geometry,
                  scale: popupScale - 10,
                }).then(() => {
                  const screenPoint = mapConstants.view.toScreen(this.props.searchDeviceArray[0].feature.geometry);
                  this.getPop(screenPoint, gISCode);
                });
              }
            }, 100);
          });
        });
      }
    });
  };
  getPop = (screenPoint, gISCode) => {
    const { dispatch, infoPops } = this.props;
    // 添加地图气泡窗
    if (this.props.searchDeviceArray[0]) {
      const { feature } = this.props.searchDeviceArray[0];
      const name = feature.attributes['设备名称'] || feature.attributes['建筑名称'] || feature.attributes['罐区名称'] || feature.attributes['区域名称'] || feature.attributes['装置区名称'] || feature.attributes['名称'];
      const { attributes, geometry } = feature;
      const index = infoPops.findIndex(value => value.key === 'mapClick');
      const index1 = infoPops.findIndex(value => Number(value.gISCode) === Number(gISCode));
      const pop = {
        show: true,
        key: 'mapClick',
        gISCode,
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
        screenPoint,
        screenPointBefore: screenPoint,
        mapStyle: { width: mapConstants.view.width, height: mapConstants.view.height },
        attributes,
        geometry,
        name,
      };
      dispatch({
        type: 'map/queryInfoPops',
        payload: infoPops,
      });
    }
  }
  render() {
    const { onClick, eventInfoReport } = this.props;
    const { current, viewNode, flowNodeTemplateList } = this.props;
    return (
      <div className={styles.process}>
        <div className={styles.btn}>
          {flowNodeTemplateList.map((item, index) => {
            return (
              <span key={item.flowNodeTemplID}>
                <Button
                  className={viewNode === item.sortIndex ? styles.view : null}
                  onClick={() => onClick(item.sortIndex, item.nodeType)}
                  disabled={item.sortIndex > current}
                  type={item.sortIndex <= current ? 'primary' : ''}
                >
                  {item.nodeName}
                </Button>
                {index < flowNodeTemplateList.length - 1 ? <img alt="加载失败" src={current > item.sortIndex ? arrowActive : arrow} /> : '' }
              </span>
            );
          })}
        </div>
        <div className={styles.linkMap} onClick={this.returnMap}><Icon type="environment" theme="filled" /></div>
      </div>
    );
  }
}
