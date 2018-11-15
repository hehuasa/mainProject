import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button, Card, Table, Divider, Select } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import { emgcIntervalInfo } from '../../../../services/constantlyData';

const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ emergency }) => ({
  eventID: emergency.eventId,
  eventInfo: emergency.eventInfo,
  orgUserList: emergency.orgUserList,
}))
@Form.create()
export default class SearchOrgUser extends PureComponent {
  state = {
    pageNum: 1,
    pageSize: 5,
    total: 0,
  };
  componentDidMount() {
    const { dispatch, eventID } = this.props;
    const { pageNum, pageSize } = this.state;
    dispatch({
      type: 'emergency/getEventInfo',
      payload: { eventID },
    }).then(() => {
      this.page(pageNum, pageSize);
      //  刷新签到情况
      emgcIntervalInfo.userPage.forEach((item) => {
        clearInterval(item);
      });
      const id = setInterval(() => this.page(pageNum, pageSize),
        emgcIntervalInfo.timeSpace);
      emgcIntervalInfo.userPage.push(id);
    });
  }
  // 重置搜索条件
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.page(1, 5);
  };
  // 搜索函数
  handleSearch = (e) => {
    e.preventDefault();
    const { form, eventID } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { dispatch } = this.props;
      const { pageNum, pageSize } = this.state;
      dispatch({
        type: 'emergency/getOrgList',
        payload: { pageNum, pageSize, ...fieldsValue, eventID },
      }).then(() => {
        this.setState({
          pageNum: this.props.orgUserList.pageNum,
          pageSize: this.props.orgUserList.pageSize,
          total: this.props.orgUserList.sumCount,
        });
      });
    });
  };
  // 分页函数
  page = (pageNum, pageSize) => {
    const { dispatch, eventID } = this.props;
    dispatch({
      type: 'emergency/getOrgList',
      payload: { pageNum, pageSize, eventID },
    }).then(() => {
      this.setState({
        pageNum: this.props.orgUserList.pageNum,
        pageSize: this.props.orgUserList.pageSize,
        total: this.props.orgUserList.sumCount,
      });
    });
  };
  // 设为总指挥
  setCommander = (userID) => {
    const { dispatch, eventID } = this.props;
    dispatch({
      type: 'emergency/emgcCommanderChange',
      payload: { eventID, userID, isCommander: 1 },
    }).then(() => {
      const { pageNum, pageSize } = this.state;
      this.page(pageNum, pageSize);
    });
  };
  // 签到
  signIn = (userID) => {
    const { dispatch, eventID } = this.props;
    dispatch({
      type: 'emergency/emgcUserSignIn',
      payload: { eventID, userID },
    }).then(() => {
      const { pageNum, pageSize } = this.state;
      this.page(pageNum, pageSize);
    });
  };
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    // 组织机构表头
    const orgCols = [
      {
        title: '应急组织',
        dataIndex: 'emgcOrgName',
        width: 120,
        key: 'emgcOrgName',
      }, {
        title: '应急岗位',
        dataIndex: 'emgcPostion',
        width: 120,
        key: 'emgcPostion',
      }, {
        title: '姓名',
        dataIndex: 'userName',
        width: 100,
        key: 'name',
      }, {
        title: '所属职能部门',
        dataIndex: 'orgnizationName',
        width: 160,
        key: 'positionOrg',
      }, {
        title: '业务专长',
        dataIndex: 'specialityName',
        width: 100,
        key: 'feature',
      }, {
        title: '联系电话',
        dataIndex: 'mobile',
        // width: 100,
        key: 'weight',
      }, {
        title: '操作',
        dataIndex: 'function',
        width: 200,
        key: 'function',
        render: (value, record) => {
          return (
            !record.isCommander ? (
              <span>
                <a href="javascript:;" onClick={() => this.setCommander(record.userID)}>设为总指挥</a>
                <Divider type="vertical" />
                {!record.signInTime ? <a href="javascript:;" onClick={() => this.signIn(record.userID)}>签到</a> : '已签到'}
              </span>
            ) : '总指挥'
          );
        },
      }];
    return (
      <Card bordered={false}>
        <div className={styles.search}>
          <Form onSubmit={this.handleSearch} layout="inline">
            <Row type="flex">
              <Col md={6} sm={24}>
                <FormItem
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  label="应急组织"
                >
                  {getFieldDecorator('orgnizationName')(
                    <Input placeholder="请输入应急组织" />
                  )}
                </FormItem>
              </Col>
              <Col md={6} sm={24}>
                <FormItem
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  label="应急岗位"
                >
                  {getFieldDecorator('postion')(
                    <Input placeholder="请输入应急岗位" />
                  )}
                </FormItem>
              </Col>
              <Col md={6} sm={24}>
                <FormItem
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  label="姓名"
                >
                  {getFieldDecorator('userName')(
                    <Input placeholder="请输入姓名" />
                  )}
                </FormItem>
              </Col>
              <Col md={6} sm={24}>
                <span className={styles.submitButtons}>
                  <Button type="primary" htmlType="submit">查询</Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                </span>
              </Col>
            </Row>
          </Form>
        </div>
        <Table
          columns={orgCols}
          pagination={{
            onChange: this.page,
            current: this.state.pageNum,
            pageSize: this.state.pageSize,
            total: this.state.total,
          }}
          dataSource={this.props.orgUserList.result}
          scroll={{ x: 900 }}
        />
      </Card>
    );
  }
}
