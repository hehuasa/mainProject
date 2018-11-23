import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Row, Col, Card, Input, Select, Icon, Button, Dropdown, Menu, TreeSelect, DatePicker, Modal, message, Divider, Popconfirm } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import StandardTable from '../../../components/StandardTable';
import { commonData } from '../../../../mock/commonData';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ planManagement }) => ({
  planManagement,
  emgcReport: planManagement.emgcReport,
}))

@Form.create()
export default class Analysis extends PureComponent {
  state = {
    // 弹框的显示控制
    modalVisible: false,
    // 搜索栏是否展开
    expandForm: false,
    selectedRows: [],
    formValues: {},
    //  修改 还是 新增为null
    clickRow: null,

  };
  componentDidMount() {
    this.page(commonData.pageInitial);
  }
  // 获取分页数据
  page = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'planManagement/emgcReportPage',
      payload: page,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      // params.sorter = `${sorter.field}_${sorter.order}`;
      const { field, order } = sorter;
      params.sorter = { field, order };
    }

    dispatch({
      type: 'planManagement/emgcReportPage',
      payload: params,
    });
  };
  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'planManagement/emgcReportPage',
      payload: commonData.pageInitial,
    });
  };
  // 搜索接口
  handleSearch = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      // 防止将空作为查询条件
      for (const obj in values) {
        if (values[obj] === '' || values[obj] === undefined) {
          delete values[obj];
        }
      }
      const search = { isQuery: true, fuzzy: true };
      Object.assign(search, commonData.pageInitial, values);
      this.page(search);
    });
  };
  // 下载doc
  exportReport = (emgcReportID) => {
    this.props.dispatch({
      type: 'planManagement/exportReport',
      payload: { emgcReportID },
    });
  };
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const { loading = false } = this.props.planManagement;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="报告名称">
              {getFieldDecorator('eventName')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  render() {
    const { emgcReport, loading } = this.props.planManagement;
    const { selectedRows } = this.state;

    const columns = [
      {
        title: '报告名称',
        dataIndex: 'eventName',
        width: '40%',
      },
      {
        title: '发布时间',
        dataIndex: 'releaseTime',
        width: '20%',
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
      },
      {
        title: '操作',
        width: '40%',
        render: (text, record) => {
          return (
            <Fragment>
              <Popconfirm title="确定下载？" onConfirm={() => this.exportReport(record.emgcReportID)}>
                <a href="#">下载应急报告</a>
              </Popconfirm>
            </Fragment>
          );
        },
      },
    ];
    return (
      <PageHeaderLayout title="应急报告">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              {/* <Button icon="export" type="primary" onClick={() => console.log('导出')}>
                导出
              </Button> */}
              {
                selectedRows.length > 0 && (
                  <Popconfirm title="确定删除？" onConfirm={this.deleteAll}>
                    <Button>批量删除</Button>
                  </Popconfirm>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={emgcReport}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="planInfoID"
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
