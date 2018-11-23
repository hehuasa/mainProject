import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Icon, Row, Col, Table } from 'antd';
import { getUUID } from '../../utils/utils';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const columns = [
  {
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
  }, {
    title: '手机号码',
    dataIndex: 'mobile',
    key: 'mobile',
  }, {
    title: '所属部门',
    dataIndex: 'orgnizationName',
    key: 'orgnizationName',
  }, {
    title: '专业系统',
    dataIndex: 'specialityName',
    key: 'specialityName',
  },
];
@connect(({ template, userList, sendMsg, loading }) => ({
  template,
  userPage: userList.data,
  sendMsg,
  loading: loading.effects['sendMsg/add'],
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    userList: [], // 选择的系统短信接收人员
    mobileList: [], // 手动添加的短信接收人员
    selectedRowKeys: [], // 选中的系统用户的ID
  };
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求短信模板
    dispatch({
      type: 'template/fetch',
      payload: '',
    });
    // 请求用户分页
    this.userPage(1, 10);
  }
  // 获取系统用户
  userPage = (pageNum, pageSize) => {
    this.props.dispatch({
      type: 'userList/page',
      payload: { pageNum, pageSize, isQuery: true, fuzzy: false },
    });
  };
  // 手动添加报警接收人员
  addReceptor = () => {
    const { form } = this.props;
    const { mobileList } = this.state;
    form.validateFields(['userName', 'mobile'], (err, fieldsValue) => {
      if (err) return;
      mobileList.unshift({ ...fieldsValue, uuid: getUUID() });
      this.setState({
        mobileList,
      });
      form.setFieldsValue({
        userName: null,
        mobile: null,
      });
    });
  };
  // 移除接收人员
  remove = (record) => {
    const { userList, mobileList, selectedRowKeys } = this.state;
    // 手动添加的人员
    if (record.uuid) {
      this.setState({
        mobileList: mobileList.filter(item => item.uuid !== record.uuid),
      });
    } else {
      this.setState({
        userList: userList.filter(item => item.userID !== record.userID),
        selectedRowKeys: selectedRowKeys.filter(item => item !== record.userID),
      });
    }
  };
  doAdd = () => {
    const { form, dispatch } = this.props;
    const { userList, mobileList } = this.state;
    form.validateFields(['msgContent'], (err, fieldsValue) => {
      if (err) return;
      if (!userList.concat(mobileList).length > 0) {
        form.setFields({
          list: {
            errors: [new Error('接收人员列表不能为空')],
          },
        });
        return;
      }
      const obj = {
        userList: userList.concat(mobileList),
        msgContent: fieldsValue.msgContent,
      };
      dispatch({
        type: 'sendMsg/add',
        payload: { infoJson: JSON.stringify(obj) },
      }).then(() => {
        this.setState({
          userList: [],
          mobileList: [],
          selectedRowKeys: [],
        });
        form.setFieldsValue({
          msgContent: null,
        });
      });
    });
  };
  rowCheckedChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      userList: selectedRows,
      selectedRowKeys,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const receptorCols = [
      {
        title: '姓名',
        dataIndex: 'userName',
        key: 'userName',
      }, {
        title: '手机号码',
        dataIndex: 'mobile',
        key: 'mobile',
      }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          return <a href="javascript: void(0)" onClick={() => this.remove(record)}>移除</a>;
        },
      },
    ];
    return (
      <div className={styles.sedMsg}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col span={11} offset={1}>
              <Table
                size="small"
                dataSource={this.props.userPage.data}
                columns={columns}
                rowSelection={{
                  onChange: this.rowCheckedChange,
                  selectedRowKeys: this.state.selectedRowKeys,
                }}
                pagination={{
                  ...this.props.userPage.pagination,
                  onChange: this.userPage,
                }}
                rowKey={record => record.userID}
              />
            </Col>
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <FormItem
                    label="外部人员"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 12 }}
                  >
                    {getFieldDecorator('userName', {
                        rules: [],
                      })(
                        <Input placeholder="姓名" />
                      )
                      }
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 24 }}
                  >
                    {getFieldDecorator('mobile', {
                        rules: [
                          { pattern: /^(17[0-9]|13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/, message: '请输入正确的手机号码' },
                        ],
                      })(
                        <Input placeholder="手机号码" />
                      )
                      }
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 23 }}
                  >
                    <Button
                      style={{ marginLeft: 4 }}
                      size="small"
                      type="primary"
                      icon="plus-circle"
                      onClick={this.addReceptor}
                    >添加
                    </Button>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <FormItem
                  label="接收列表"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 12 }}
                >
                  {getFieldDecorator('list')(
                    <Table
                      size="small"
                      dataSource={this.state.mobileList.concat(this.state.userList)}
                      columns={receptorCols}
                      style={{ marginBottom: 8 }}
                      pagination={{
                        pageSize: 5,
                      }}
                    />
                  )
                  }
                </FormItem>
              </Row>
              <FormItem
                label="短信内容"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                {getFieldDecorator('msgContent', {
                  rules: [{ required: true, message: '短信内容不能为空' }],
                })(
                  <TextArea />
                )}
              </FormItem>
              <FormItem
                wrapperCol={{ span: 12, offset: 5 }}
              >
                <Button type="primary" loading={this.props.loading} onClick={() => this.doAdd()}>
                  发送
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
