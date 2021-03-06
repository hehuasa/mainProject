import React, { PureComponent } from 'react';
import { Form, Tabs, Row, Col, Input, Icon, Button, Popconfirm } from 'antd';
import { connect } from 'dva';
import InfoRecord from '../InfoContentRecord/InfoRecord/InfoRecord';
import SelectPlan from './SelectPlan/index';
import EditPlan from './EditPlan/index';
import styles from './index.less';

const { TabPane } = Tabs;
@connect(({ emergency, user }) => ({
  planList: emergency.planList,
  eventID: emergency.eventId,
  current: emergency.current,
  viewNode: emergency.viewNode,
  currentUser: user.currentUser,
  annexPage: emergency.annexPage,
  executeList: emergency.executeList,
  eventPlanList: emergency.eventPlanList,
}))
export default class InfoJudgment extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // 获取预案列表
    dispatch({
      type: 'emergency/getPlanList',
    });
    // 获取应急等级列表
    dispatch({
      type: 'emergency/getPlanLevelList',
    });
  }
  onChange = (activeKey) => {
    const { eventID, currentUser, viewNode, current } = this.props;
    const { userID } = currentUser.baseUserInfo;
    const emgcEventExecutePlanVO = { eventID, userID };
    const jsonData = JSON.stringify(emgcEventExecutePlanVO);
    if (activeKey === '3') {
      // 不选择预案拷贝模板
      this.props.dispatch({
        type: 'emergency/copyEmptyPlan',
        payload: { jsonData },
      });
      //  请求实施方案列表
      this.props.dispatch({
        type: 'emergency/getExecuteList',
        payload: { eventID },
      }).then(() => {
        const { executeList } = this.props;
        if (executeList.length && executeList.length > 0) {
          const value = executeList[0].eventExecPlanID;
          // 默认选中后第一个方案
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
        }
      });
    }
  };
  confirm = (eventStatu) => {
    const { eventID, dispatch, currentUser } = this.props;
    const { userID } = currentUser.baseUserInfo;
    dispatch({
      type: 'emergency/updateProcessNode',
      payload: { eventID, eventStatu, userID },
    }).then(() => {
      dispatch({
        type: 'emergency/saveCurrent',
        payload: eventStatu,
      });
      dispatch({
        type: 'emergency/saveViewNode',
        payload: eventStatu,
      });
      dispatch({
        type: 'emergency/selectNodeType',
        payload: { eventID, eventStatu },
      });
    });
  };
  render() {
    const { planList } = this.props;
    const text = '确认进入预警 ? ';
    const text1 = '确认进入应急响应 ? ';
    const { current, viewNode } = this.props;
    const tabBarExtraContent = (
      <div className={styles.extraBtn}>
        <Popconfirm placement="bottomRight" title={text} onConfirm={() => this.confirm(3)} okText="确认" cancelText="取消">
          <Button disabled={viewNode < current}>进入预警</Button>
        </Popconfirm>
        <Popconfirm placement="bottomRight" title={text1} onConfirm={() => this.confirm(4)} okText="确认" cancelText="取消">
          <Button disabled={viewNode < current}>进入应急响应</Button>
        </Popconfirm>
      </div>
    );
    return (
      <Tabs
        tabBarExtraContent={tabBarExtraContent}
        onTabClick={this.onChange}
        className={styles.infoJudgment}
        defaultActiveKey="2"
      >
        <TabPane tab="事件信息记录" key="1">
          <InfoRecord />
        </TabPane>
        <TabPane tab="预案选择" key="2" disabled={this.props.viewNode !== this.props.current}>
          <SelectPlan planList={planList} />
        </TabPane>
        <TabPane tab="编辑实施方案" key="3" disabled={this.props.viewNode !== this.props.current || !this.props.eventPlanList.length > 0}>
          <EditPlan />
        </TabPane>
      </Tabs>
    );
  }
}
