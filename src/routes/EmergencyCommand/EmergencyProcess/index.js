import React, { PureComponent } from 'react';
import { Steps, Icon, Button } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import arrow from '../../../assets/emergency/arrow.png';
import arrowActive from '../../../assets/emergency/arrow-active.png';

const { Step } = Steps;
@connect(({ emergency }) => ({
  flowNodeTemplateList: emergency.flowNodeTemplateList,
  eventID: emergency.eventId,
  flowExcuteInfo: emergency.flowExcuteInfo,
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
  render() {
    const { onClick } = this.props;
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
      </div>
    );
  }
}
