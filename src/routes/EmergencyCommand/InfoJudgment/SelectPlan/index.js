import React, { PureComponent } from 'react';
import { Select, Table, Modal, Button, Row, Col, Form, Input } from 'antd';
import { connect } from 'dva';
import PlanInfo from './PlanInfo/index';
import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;

const SearchForm = Form.create()((props) => {
  const { form, planLevelList, planTypeList, handleSearch, handleFormReset } = props;
  const { getFieldDecorator } = form;
  return (
    <div style={{ marginBottom: -8 }}>
      <Form onSubmit={() => handleSearch(form)}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="预案名称"
            >
              {getFieldDecorator('planName')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="预案类别"
            >
              {getFieldDecorator('planType')(
                <Select placeholder="请选择">
                  <Option value="">请选择</Option>
                  {planTypeList.map(type =>
                    <Option key={type.codeID} value={type.code}>{type.codeName}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="预案级别"
            >
              {getFieldDecorator('planLevelID')(
                <Select placeholder="请选择">
                  <Option value="">请选择</Option>
                  {planLevelList.map(type =>
                    <Option key={type.emgcLevelID} value={type.emgcLevelID}>{type.levelName}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => handleFormReset(form)}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    </div>
  );
});

@connect(({ emergency, user }) => ({
  emergency,
  eventID: emergency.eventId,
  currentUser: user.currentUser,
  current: emergency.current,
  viewNode: emergency.viewNode,
  planLevelList: emergency.planLevelList,
  planTypeList: emergency.planTypeList,
  planInfoPage: emergency.planInfoPage,
  annexPage: emergency.annexPage,
  eventInfo: emergency.eventInfo,
}))
export default class SelectPlan extends PureComponent {
  state = {
    visible: false,
    planInfo: {}, // 预案详情
    planTemple: {}, // 计划作为模板
    // 当前页
    pageNum: 1,
    // 每页显示条数
    pageSize: 5,
    total: '',
    isQuery: true,
    fuzzy: false,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    const { pageNum, pageSize } = this.state;
    // 获取预案列表
    this.page(pageNum, pageSize);
    // 获取应急等级列表
    dispatch({
      type: 'emergency/getPlanLevelList',
    });
    //  获取预案类别
    dispatch({
      type: 'emergency/getPlanTypeList',
      payload: 558,
    });
  }
  page = (pageNum, pageSize) => {
    const { dispatch } = this.props;
    const { isQuery, fuzzy } = this.state;
    // 获取预案列表
    dispatch({
      type: 'emergency/getPlanInfoPage',
      payload: { pageNum, pageSize, isQuery, fuzzy, statu: 0 },
    }).then(() => {
      const { planInfoPage } = this.props;
      this.setState({
        pageNum: planInfoPage.pageNum,
        pageSize: planInfoPage.pageSize,
        total: planInfoPage.sumCount,
      });
    });
  };
  handleFormReset = (form) => {
    form.resetFields();
    this.page(1, 5);
  };
  handleSearch = (form) => {
    const { dispatch } = this.props;
    const { isQuery } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'emergency/getPlanInfoPage',
        payload: {
          pageNum: 1,
          pageSize: 5,
          isQuery,
          fuzzy: true,
          statu: 0,
          ...fieldsValue },
      }).then(() => {
        const { planInfoPage } = this.props;
        this.setState({
          pageNum: planInfoPage.pageNum,
          pageSize: planInfoPage.pageSize,
          total: planInfoPage.sumCount,
        });
      });
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  openModel = (record) => {
    const { planInfoID } = record;
    this.props.dispatch({
      type: 'emergency/savePlanID',
      payload: planInfoID,
    });
    this.setState({
      visible: true,
      planTemple: record,
      planInfo: record,
    });
  };
  setTemplete = (record) => {
    const { eventID, currentUser } = this.props;
    const { userID } = currentUser.baseUserInfo;
    const emgcEventExecutePlanVO = { eventID, planPlanInfo: record, userID };
    const jsonData = JSON.stringify(emgcEventExecutePlanVO);
    this.props.dispatch({
      type: 'emergency/clearPlan',
      payload: { eventID },
    }).then(() => this.props.dispatch({
      type: 'emergency/copyPlan',
      payload: { jsonData },
    }).then(() => {
      // 根据eventID获取预案基本信息
      this.props.dispatch({
        type: 'emergency/getPlanBaseInfo',
        payload: { eventID },
      });
      // 通过eventID获取预案指令
      this.props.dispatch({
        type: 'emergency/getEmgcCommandByEventID',
        payload: { eventID },
      });
      // 通过eventID获取应急资源
      this.props.dispatch({
        type: 'emergency/getEmgcResourceByEventID',
        payload: { eventID },
      });
      // 通过eventID获取事件特征
      this.props.dispatch({
        type: 'emergency/getEmgcFeatureByEventID',
        payload: { eventID },
      });
      //  获取处置卡 eventID uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
      this.props.dispatch({
        type: 'emergency/getImplDealCard',
        payload: { eventID, uploadType: 3 },
      });
      this.props.dispatch({
        type: 'emergency/getImplOrgAnnex',
        payload: { eventID, uploadType: 1 },
      });
      this.props.dispatch({
        type: 'emergency/getImplEmgcProcess',
        payload: { eventID, uploadType: 4 },
      });
      // 通过eventID 获取附件列表 // uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
      const { pageNum, pageSize } = this.props.annexPage;
      this.props.dispatch({
        type: 'emergency/getAnnexPage',
        payload: { eventID, pageNum, pageSize, uploadType: 2, isQuery: true, fuzzy: false },
      });
      this.props.dispatch({
        type: 'emergency/getEventInfo',
        payload: { eventID },
      }).then(() => {
        this.props.dispatch({
          type: 'emergency/saveEventLevel',
          payload: this.props.eventInfo.eventLevel,
        });
      });
    })
    );
  };
  render() {
    const { current, viewNode, planLevelList, planTypeList, planInfoPage } = this.props;
    const columns = [
      {
        title: '预案名称',
        dataIndex: 'planName',
        width: '40%',
        key: 'planName',
        render: (text, record) => <a onClick={() => this.openModel(record)} href="javascript:;">{text}</a>,
      }, {
        title: '预案类别',
        dataIndex: 'planTypeName',
        width: '10%',
        key: 'planTypeName',
      }, {
        title: '预案级别',
        width: '10%',
        render: (text, record) => {
          return record.planPlanLevel.levelName;
        },
      }, {
        title: '直接匹配特征',
        width: '15%',
        dataIndex: 'planFuture',
      }, {
        title: '匹配度',
        width: '10%',
        dataIndex: 'suitability',
      }, {
        title: '操作',
        width: '15%',
        dataIndex: 'action',
        render: (text, record) => {
          return current === viewNode ? (
            <a onClick={() => this.setTemplete(record)} href="javascript:;">设为模板</a>
          ) : null;
        },
      }];

    // rowSelection object indicates the need for row selection
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          planTemple: selectedRows[0],
        });
      },
      type: 'radio',
    };
    return (
      <div className={styles.selectPlan}>
        <div className={styles.planTitle}>
          <div className={styles.titleName} />
          <div className={styles.planLevel}>
            <span className={styles.levelName}>应急响应等级</span>
            <Select
              value={this.state.planTemple.planLevelID}
              placeholder="请选择"
              style={{ width: '50%' }}
              disabled
            >
              <Option value="">请选择</Option>
              {planLevelList.map(item => (
                <Option
                  key={item.emgcLevelID}
                  value={item.emgcLevelID}
                >{item.levelName}
                </Option>))
              }
            </Select>
          </div>
        </div>
        <div className={styles.planList}>
          <SearchForm
            planTypeList={planTypeList}
            planLevelList={planLevelList}
            handleFormReset={this.handleFormReset}
            handleSearch={this.handleSearch}
          />
          <Table
            dataSource={planInfoPage.result}
            columns={columns}
            rowKey={record => record.planInfoID}
            pagination={{
              current: this.state.pageNum,
              pageSize: this.state.pageSize,
              total: this.state.total,
              onChange: this.page,
            }}
          />
        </div>
        <Modal
          title="预案详情"
          cancelText="关闭"
          footer={false}
          width="80%"
          visible={this.state.visible}
          mask={false}
          maskClosable={false}
          destroyOnClose
          onCancel={this.handleCancel}
        >
          <PlanInfo planInfo={this.state.planInfo} />
        </Modal>
      </div>
    );
  }
}
