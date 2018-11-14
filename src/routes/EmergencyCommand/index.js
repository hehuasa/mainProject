import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Steps, Icon, Button } from 'antd';
import EmergencyProcess from './EmergencyProcess/index';
import InfoJudgment from './InfoJudgment/index';
import EmergencyStart from './EmergencyStart/index';
import EarlyWarning from './EarlyWarning/index';
import EmergencyDisposal from './EmergencyDisposal/index';
import EmergencyStop from './EmergencyStop/index';
import InfoContentRecord from './InfoContentRecord/InfoContentRecord';
import { emgcIntervalInfo } from '../../services/constantlyData';

@connect(({ emergency, user }) => ({
  current: emergency.current,
  viewNode: emergency.viewNode,
  eventID: emergency.eventId,
  currentUser: user.currentUser,
}))
export default class EmergencyCommand extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
    // 请求事件信息
    this.getEventInfo();
    const id = setInterval(this.getEventInfo, emgcIntervalInfo.timeSpace);
    emgcIntervalInfo.intervalIDs.push(id);
  }
  // 请求事件信息
  getEventInfo = () => {
    this.props.dispatch({
      type: 'emergency/queryEventFeatures',
      payload: {
        eventID: this.props.eventID,
      },
    });
  };
  nodeClick = (viewNode, viewNodeType) => {
    this.props.dispatch({
      type: 'emergency/saveViewNode',
      payload: viewNode,
    });
    this.props.dispatch({
      type: 'emergency/saveViewNodeType',
      payload: viewNodeType,
    });
  };
  render() {
    const { current, viewNode } = this.props;
    return (
      <div>
        <EmergencyProcess onClick={this.nodeClick} current={current} viewNode={viewNode} />
        {viewNode === 1 ? <InfoContentRecord /> : null}
        {viewNode === 2 ? <InfoJudgment /> : null}
        {viewNode === 3 ? <EarlyWarning /> : null}
        {viewNode === 4 ? <EmergencyStart /> : null}
        {viewNode === 5 ? <EmergencyDisposal /> : null}
        {viewNode === 6 ? <EmergencyStop /> : null}
      </div>
    );
  }
}
