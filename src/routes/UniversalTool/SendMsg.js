import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Icon, Row, Col, Table } from 'antd';
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
const receptorCols = [
  {
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
  }, {
    title: '手机号码',
    dataIndex: 'mobile',
    key: 'mobile',
  },
];
@connect(({ template, userList, sendMsg, tabs, sysFunction }) => ({
  template,
  userPage: userList.data,
  sendMsg,
  tabs,
  sysFunction,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    userList: [], // 选择的系统短信接收人员
    mobileList: [], // 手动添加的短信接收人员
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
    const { form, dispatch } = this.props;
    const error = form.getFieldsError(['userName', 'mobile']);
    const obj = form.getFieldsValue(['userName', 'mobile']);
    form.validateFields([['userName', 'mobile']], (err, fieldsValue) => {
      if (err) return;
      console.log(777, fieldsValue);
    });
  };
  doAdd = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'sendMsg/add',
        payload: fieldsValue,
      }).then(() => {
        const { tabs, sysFunction } = this.props;
        const { currentFunctions } = sysFunction;
        const key = 'tools/history';
        const list = currentFunctions;
        if (tabs.tabs.find(value => value.key === `/${key}`)) {
          this.props.dispatch({
            type: 'tabs/active',
            payload: { key: `/${key}` },
          });
        } else {
          this.props.dispatch({
            type: 'tabs/add',
            payload: { key: `/${key}`, list },
          });
        }
      });
    });
  };
  rowCheckedChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      userList: selectedRows,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { templateList } = this.props.template;
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
                }}
                pagination={{
                  ...this.props.userPage.pagination,
                  onChange: this.userPage,
                }}
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
                          { pattern: /^[1][3,4,5,7,8][0-9]{9}$/, message: '请输入正确的手机号码' },
                        ],
                      })(
                        <Input placeholder="电话" />
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
                  <Table
                    size="small"
                    dataSource={this.state.userList}
                    columns={receptorCols}
                    style={{ marginBottom: 8 }}
                    pagination={{
                      pageSize: 5,
                    }}
                  />
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
                <Button type="primary" onClick={() => this.doAdd()}>
                  确定
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
