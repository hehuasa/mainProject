import React, { PureComponent } from 'react';
import { Select, Table, Card, Row, Col } from 'antd';
import { connect } from 'dva';
import PlanInfo from './PlanInfo/index';
import styles from './index.less';

const Option = Select.Option;
@connect(({ emergency }) => ({
  planLevelList: emergency.planLevelList,
  emgcOrgList: emergency.emgcOrgList,
  eventID: emergency.eventId,
  eventInfo: emergency.eventInfo,
  eventLevel: emergency.eventLevel,
  emgcOrgID: emergency.emgcOrgID,
  current: emergency.current,
  viewNode: emergency.viewNode,
  isFromPlan: emergency.isFromPlan,
  executeList: emergency.executeList,
  annexPage: emergency.annexPage,
  eventExecPlanID: emergency.eventExecPlanID,
}))
export default class EditPlan extends PureComponent {
  componentDidMount() {
    const { eventID, dispatch } = this.props;
    // dispatch({
    //   type: 'emergency/getEventInfo',
    //   payload: { eventID },
    // }).then(() => {
    //   dispatch({
    //     type: 'emergency/saveEventLevel',
    //     payload: this.props.eventInfo.eventLevel,
    //   });
    // });
    dispatch({
      type: 'emergency/getIfFromPlan',
      payload: { eventID },
    });
  }
  onLevelChange = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'emergency/getOrgListByLevel',
      payload: { emgcLevel: value },
    }).then(() => {
      dispatch({
        type: 'emergency/saveEventLevel',
        payload: value,
      });
    });
  };
  // 选择方案
  onExecuteChange = (value) => {
    const { eventID } = this.props;
    // 保存选择的执行方案
    this.props.dispatch({
      type: 'emergency/saveEventExecPlanID',
      payload: value,
    });
    // 根据eventID获取预案基本信息
    this.props.dispatch({
      type: 'emergency/getPlanBaseInfo',
      payload: { eventID, eventExecPlanID: value },
    });
    // 通过eventID获取预案指令
    this.props.dispatch({
      type: 'emergency/getEmgcCommandByEventID',
      payload: { eventID, eventExecPlanID: value },
    });
    // 通过eventID获取应急资源
    this.props.dispatch({
      type: 'emergency/getEmgcResourceByEventID',
      payload: { eventID, eventExecPlanID: value },
    });
    // 通过eventID获取事件特征
    this.props.dispatch({
      type: 'emergency/getEmgcFeatureByEventID',
      payload: { eventID },
    });
    //  获取处置卡 eventID uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
    this.props.dispatch({
      type: 'emergency/getImplDealCard',
      payload: { eventID, uploadType: 3, eventExecPlanID: value },
    });
    this.props.dispatch({
      type: 'emergency/getImplOrgAnnex',
      payload: { eventID, uploadType: 1, eventExecPlanID: value },
    });
    this.props.dispatch({
      type: 'emergency/getImplEmgcProcess',
      payload: { eventID, uploadType: 4, eventExecPlanID: value },
    });
    // 通过eventID 获取附件列表 // uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
    const { pageNum, pageSize } = this.props.annexPage;
    this.props.dispatch({
      type: 'emergency/getAnnexPage',
      payload: { eventID, pageNum, pageSize, uploadType: 2, isQuery: true, fuzzy: false, eventExecPlanID: value },
    });
  };

  render() {
    const { planLevelList, viewNode, current, hideFooter, isFromPlan } = this.props;
    const extra = (
      <Row>
        {viewNode < current ? (
          <Col span={12}>
            <span style={{ marginRight: 16 }}>方案选择</span>
            <Select
              style={{ width: 180 }}
              value={this.props.eventExecPlanID}
              onChange={this.onExecuteChange}
            >
              {this.props.executeList.map(item => (
                <Option
                  key={item.eventExecPlanID}
                  value={item.eventExecPlanID}
                >{item.planName}
                </Option>
              ))}
            </Select>
          </Col>
        ) : null
        }
        <Col span={12} offset={viewNode === current ? 12 : 0}>
          <span style={{ marginRight: 16 }}>应急响应等级</span>
          <Select
            disabled={!!(viewNode < current || isFromPlan)}
            value={this.props.eventLevel}
            style={{ width: 180 }}
            onChange={this.onLevelChange}
          >
            <Option value="">请选择</Option>
            {planLevelList.map(item => (
              <Option
                key={item.emgcLevelID}
                value={item.emgcLevelID}
              >{item.levelName}
              </Option>
))}
          </Select>
        </Col>
      </Row>
    );
    return (
      <div className={styles.extra}>
        <Card extra={extra} bordered={false}>
          <PlanInfo isEdit={this.props.viewNode === this.props.current} hideFooter={hideFooter} />
        </Card>
      </div>
    );
  }
}
