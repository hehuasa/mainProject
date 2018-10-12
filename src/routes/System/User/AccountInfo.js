import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Divider,
  Popconfirm,
} from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './TableList.less';
import { commonData } from '../../../../mock/commonData';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

// 新增 修改页
const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const { list, account, accountTypeList, isAdd } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  };
  // 关闭后销毁子元素
  const destroyOnClose = true;
  return (
    <Modal
      destroyOnClose={destroyOnClose}
      title={isAdd ? '新增账户' : '修改账户'}
      visible={modalVisible}
      onOk={okHandle}
      width="80%"
      onCancel={() => handleModalVisible()}
    >
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <FormItem>
          {form.getFieldDecorator('accountID', {
                initialValue: isAdd ? '' : account.accountID,
                rules: [],
              })(
                <Input type="hidden" />
              )}
        </FormItem>
        <Col md={12} sm={24}>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label="用户"
          >
            {form.getFieldDecorator('userID', {
                initialValue: isAdd ? '' : account.baseUserInfo.userID,
                rules: [{ required: true, message: '用户不能为空' }],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  {list.map(item => (
                    <Option
                      key={item.userID}
                      value={item.userID}
                    >{item.userName}
                    </Option>
                  ))}
                </Select>
              )}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label="登录账号"
          >
            {form.getFieldDecorator('loginAccount', {
              initialValue: isAdd ? '' : account.loginAccount,
              rules: [
                { required: true, message: '登录账号不能为空' },
                { pattern: /^[A-Za-z_]+$/, message: '只能由英文与下划线组成' },
                ],
            })(
              <Input placeholder="请输入登录账号" />
            )}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label="账户类型"
          >
            {form.getFieldDecorator('accountType', {
                initialValue: isAdd ? '' : account.accountType,
                rules: [{ required: true, message: '账户类型不能为空' }],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  {accountTypeList.map(item => (
                    <Option key={item.codeID} value={item.code}>{item.codeName}</Option>
                    )
                  )}
                </Select>
              )}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label="备注"
          >
            {form.getFieldDecorator('remark', {
                initialValue: isAdd ? '' : account.remark,
                rules: [],
              })(
                <TextArea />
              )}
          </FormItem>
        </Col>
      </Row>

    </Modal>
  );
});

@connect(({ rule, loading, accountInfo, typeCode, userList }) => ({
  rule,
  loading: loading.models.rule,
  accountInfo,
  typeCode,
  userList,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    // 弹框的显示控制
    modalVisible: false,
    // 搜索栏是否展开
    expandForm: false,
    selectedRows: [],
    formValues: {},
    //  修改还是新增
    isAdd: true,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求搜索的账户类型
    dispatch({
      type: 'typeCode/accountType',
      payload: '100',
    });
    this.page(commonData.pageInitial);
  }
  // 获取分页数据
  page=(page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountInfo/page',
      payload: page,
    });
  };
  // 初始化表格数据
  initData=() => {
    const tableTitles = [];
    commonData.columns.account.attributes.forEach((item) => {
      if (item.isTableItem) {
        tableTitles.push(item);
      }
    });
    // 操作列
    tableTitles.push({
      title: '操作',
      render: (text, record) => {
        // 获取该行的id，可以获取的到，传到函数里的时候打印直接把整个表格所有行id全部打印了
        return (
          <Fragment>
            <span>
              <Popconfirm title="确定删除？" onConfirm={() => this.delete(record)}>
                <a href="#">删除</a>
              </Popconfirm>
              <Divider type="vertical" />
            </span>
            <a href="javascript: void(0)" onClick={() => this.update(record)}>修改</a>
            <Divider type="vertical" />
            <a href="javascript: void(0)" onClick={() => this.reset(record)}>重置密码</a>
          </Fragment>
        );
      },
    });
    return tableTitles;
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
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'accountInfo/page',
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
      type: 'accountInfo/page',
      payload: commonData.pageInitial,
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'rule/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = (rows) => {
    console.log(rows);
    this.setState({
      selectedRows: rows,
    });
  };
  // 搜索函数
  handleSearch = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const search = {};
      Object.assign(search, commonData.pageInitial, fieldsValue);
      this.page(search);
    });
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
      isAdd: true,
    });
    this.props.dispatch({
      type: 'userList/fetch',
    });
    // 账户类型
    this.props.dispatch({
      type: 'typeCode/accountType',
      payload: '100',
    });
  };

  handleAdd = (fields) => {
    if (this.state.isAdd) {
      this.doAdd(fields);
    } else {
      this.doUpdate(fields);
    }
  };
  doAdd = (fields) => {
    this.props.dispatch({
      type: 'accountInfo/add',
      payload: fields,
    }).then(() => {
      this.setState({
        modalVisible: false,
      });
    });
  };
  // 修改函数
  doUpdate = (fields) => {
    this.props.dispatch({
      type: 'accountInfo/update',
      payload: fields,
    }).then(() => {
      this.setState({
        modalVisible: false,
      });
    });
  };
  // 执行删除函数
  delete = (record) => {
    this.props.dispatch({
      type: 'accountInfo/delete',
      payload: [record.accountID],
    });
  };
  // 重置密码
  reset = (record) => {
    this.props.dispatch({
      type: 'accountInfo/reset',
      payload: [record.accountID],
    });
  }
  // 导出函数
  export = () => {
    const para = commonData.pageInitial;
    delete para.pageNum;
    delete para.pageSize;
    para.showJson = [];
    commonData.columns.account.attributes.forEach((item) => {
      if (item.isExport) {
        para.showJson.push({ en: item.dataIndex, cn: item.title });
      }
    }
    );
    para.showJson = JSON.stringify(para.showJson);
    this.props.dispatch({
      type: 'accountInfo/export',
      payload: para,
    });
  };
  deleteAll=() => {
    const userIds = [];
    this.state.selectedRows.forEach((user) => {
      userIds.push(user.accountID);
    });
    this.props.dispatch({
      type: 'accountInfo/delete',
      payload: userIds,
    });
  };
  update = (record) => {
    this.setState({
      modalVisible: !this.state.modalVisible,
      isAdd: false,
    });
    this.props.dispatch({
      type: 'accountInfo/get',
      payload: record.accountID,
    });
    this.props.dispatch({
      type: 'typeCode/accountType',
      payload: '100',
    });
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="登录账号">
              {getFieldDecorator('loginAccount')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="账户类型">
              {getFieldDecorator('userType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  {this.props.typeCode.accountTypeList.map(type =>
                    <Option key={type.codeID} value={type.code}>{type.codeName}</Option>
                  )}
                </Select>
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
  renderForm() {
    // return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
    return this.renderSimpleForm();
  }
  render() {
    const { loading, accountInfo: { data }, accountInfo: { account } } = this.props;
    const { list } = this.props.userList;
    const { accountTypeList } = this.props.typeCode;
    const { selectedRows, modalVisible } = this.state;
    const columns = this.initData();
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="账户列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
              </Button>
              <Button icon="export" type="primary" onClick={() => this.export()}>
                导出
              </Button>
              {
                selectedRows.length > 0 && (
                  <Popconfirm title="确定删除？" onConfirm={() => this.deleteAll()}>
                    <Button>批量删除</Button>
                  </Popconfirm>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="accountID"
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
          list={list}
          accountTypeList={accountTypeList}
          account={account}
          isAdd={this.state.isAdd}
        />
      </PageHeaderLayout>
    );
  }
}
