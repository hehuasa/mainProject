import React, { PureComponent } from 'react';
import { Steps, Icon, Button } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import arrow from '../../../assets/emergency/arrow.png';
import arrowActive from '../../../assets/emergency/arrow-active.png';
import { mapConstants } from '../../../services/mapConstant';
import { changeVideoPosition, changeVideoSize, resetAccessStyle } from '../../../utils/utils';
import { alarmAnimation } from '../../../utils/MapService';

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
    const { view, mainMap, accessInfoExtent } = mapConstants;
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
          resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent).then(() => {
            dispatch({
              type: 'map/searchDeviceByAttr',
              payload: { searchText: gISCode, searchFields: ['ObjCode'] },
            }).then(() => {
              dispatch({
                type: 'resourceTree/selectByGISCode',
                payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode },
              });
              if (view.goTo) {
                view.goTo({
                  center: this.props.searchDeviceArray[0].feature.geometry,
                  scale: popupScale - 10,
                }).then(() => {
                });
              }
            });
          });
        });
      } else {
        resetAccessStyle(accessControlShow, view, dispatch, accessInfoExtent).then(() => {
          dispatch({
            type: 'map/searchDeviceByAttr',
            payload: { searchText: gISCode, searchFields: ['ObjCode'] },
          }).then(() => {
            dispatch({
              type: 'resourceTree/selectByGISCode',
              payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode },
            });
            if (view.goTo) {
              view.goTo({
                center: this.props.searchDeviceArray[0].feature.geometry,
                scale: popupScale - 10,
              }).then(() => {
              });
            }
          });
        });
      }
    });
  };
  render() {
    const { onClick, eventInfoReport } = this.props;
    const { current, viewNode, flowNodeTemplateList } = this.props;
    console.log('flowNodeTemplateList', flowNodeTemplateList);
    console.log('eventInfoReport', eventInfoReport);
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
