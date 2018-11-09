import React, { PureComponent } from 'react';
import { Select, Table, Modal, Button, Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import PlanInfo from './PlanInfo/index';
import styles from './index.less';
import { commonData } from '../../../../../mock/commonData';

const Option = Select.Option;
const FormItem = Form.Item;
const SearchForm = Form.create()((props) => {
  const { form, planLevelList, planTypeList, handleSearch, handleFormReset } = props;
  const { getFieldDecorator } = form;
  return (
    <div style={{ marginTop: 8 }}>
      <Form onSubmit={() => handleSearch(form)} layout="inline">
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
            <FormItem label="预案类别">
              {getFieldDecorator('planType')(
                <Select placeholder="请选择" style={{ width: 120 }}>
                  <Option value="">请选择</Option>
                  {planTypeList.map(type =>
                    <Option key={type.codeID} value={type.code}>{type.codeName}</Option>
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
  planInfoPage: emergency.planInfoPage,
  planTypeList: emergency.planTypeList,
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
    //  获取事件信息
    dispatch({
      type: 'emergency/getEventInfo',
      payload: { eventID: this.props.eventID },
    }).then(() => {
      // 获取预案列表
      this.page(pageNum, pageSize);
    });
    //  获取预案类别
    dispatch({
      type: 'emergency/getPlanTypeList',
      payload: 558,
    });
  }
  page = (pageNum, pageSize) => {
    const { dispatch, eventInfo } = this.props;
    const { eventLevel } = eventInfo;
    const { isQuery, fuzzy } = this.state;
    // 获取预案列表
    dispatch({
      type: 'emergency/getPlanInfoPage',
      payload: { pageNum, pageSize, isQuery, planLevelID: eventLevel, fuzzy, statu: 0 },
    }).then(() => {
      const { planInfoPage } = this.props;
      this.setState({
        pageNum: planInfoPage.pageNum,
        pageSize: planInfoPage.pageSize,
        total: planInfoPage.sumCount,
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
    });
  };
  setTemplete = () => {
    const { eventID, currentUser } = this.props;
    const { userID } = currentUser.baseUserInfo;
    const { planTemple } = this.state;
    const emgcEventExecutePlanVO = { eventID, planPlanInfo: planTemple, userID };
    const jsonData = JSON.stringify(emgcEventExecutePlanVO);
    this.props.dispatch({
      type: 'emergency/clearPlan',
      payload: { eventID },
    }).then(() => this.props.dispatch({
      type: 'emergency/copyPlan',
      payload: { jsonData },
    })
    );
  };
  handleFormReset = (form) => {
    form.resetFields();
    this.page(1, 5);
  };
  handleSearch = (form) => {
    const { dispatch, eventInfo } = this.props;
    const { eventLevel } = eventInfo;
    const { isQuery, fuzzy } = this.state;
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
          planLevelID: eventLevel,
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
  render() {
    const { current, viewNode, planInfoPage, planTypeList, planLevelList } = this.props;
    const columns = [
      {
        title: '预案名称',
        dataIndex: 'planName',
        width: '30%',
        key: 'planName',
        render: (text, record) => <a onClick={() => this.openModel(record)} href="javascript:;">{text}</a>,
      }, {
        title: '预案类别',
        dataIndex: 'planTypeName',
        key: 'planTypeName',
        width: '20%',
      }, {
        title: '预案级别',
        width: '15%',
        render: (text, record) => {
          return record.planPlanLevel.levelName;
        },
      }, {
        title: '直接匹配特征',
        width: '25%',
        dataIndex: 'drectFeatures',
        render: (text) => {
          const { length } = text;
          if (text && length > 0) {
            let str = '';
            text.forEach((item, index) => {
              str += index === length - 1 ? `${index + 1}.${item}` : `${index + 1}.${item}, `;
            });
            return str;
          }
          return '';
        },
      }, {
        title: '匹配度',
        width: '10%',
        dataIndex: 'suitability',
      }];
    // rowSelection object indicates the need for row selection
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const { eventID, currentUser } = this.props;
        const { userID } = currentUser.baseUserInfo;
        const emgcEventExecutePlanVO = { eventID, planPlanInfo: selectedRows[0], userID };
        const jsonData = JSON.stringify(emgcEventExecutePlanVO);
        this.props.dispatch({
          type: 'emergency/expandSelectPlan',
          payload: { jsonData },
        });
      },
      type: 'radio',
    };
    return (
      <div className={styles.selectPlan}>
        <SearchForm
          planTypeList={planTypeList}
          planLevelList={planLevelList}
          handleFormReset={this.handleFormReset}
          handleSearch={this.handleSearch}
        />
        <div className={styles.planList}>
          <Table
            dataSource={planInfoPage.result}
            columns={columns}
            rowSelection={rowSelection}
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
          onCancel={this.handleCancel}
        >
          <PlanInfo planInfo={this.state.planTemple} />
        </Modal>
      </div>
    );
  }
}
