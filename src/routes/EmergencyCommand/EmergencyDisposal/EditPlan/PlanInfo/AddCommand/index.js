import React, { PureComponent } from 'react';
import { Row, Col, Modal, Form, Input, Select, TreeSelect, Card, Table, Button } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import { commandType } from '../../../../../../utils/utils';
import {commonData} from "../../../../../../../mock/commonData";

const FormItem = Form.Item;
const { TextArea } = Input;
const { TreeNode } = TreeSelect;
const Option = Select.Option;

const SearchArea = Form.create()((props) => {
  const { form, handleSearch, handleFormReset } = props;
  const { getFieldDecorator } = form;
  return (
    <Form onSubmit={() => handleSearch(form)}>
      <div className={styles.search}>
        <Row>
          <Col md={8} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 15 }}
              label="指令内容"
            >
              {getFieldDecorator('commandContent')(
                <Input placeholder="请输入指令内容" style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 15 }}
              label="指令分类"
            >
              {getFieldDecorator('commandType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  <Option value={1}>指令</Option>
                  <Option value={2}>通知</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8}>
            <span className={styles.submitButtons}>
              <Button style={{ marginLeft: 16 }} type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => handleFormReset(event, form)}>重置</Button>
            </span>
          </Col>
        </Row>
      </div>
    </Form>
  );
});
@Form.create()
@connect(({ emergency }) => ({
  flowNodeList: emergency.flowNodeList,
  eventID: emergency.eventId,
  commandReceiver: emergency.commandReceiver,
  checkedUser: emergency.checkedUser,
  eventExecPlanID: emergency.eventExecPlanID,
  existCommandPage: emergency.existCommandPage,
}))
export default class AddFeature extends PureComponent {
  state = {
    pageNum: 1,
    pageSize: 5,
    total: 0,
  };
  componentDidMount() {
    const { dispatch, eventID, eventExecPlanID } = this.props;
    // 根据eventID获取流程节点
    dispatch({
      type: 'emergency/getFlowNodeList',
      payload: { eventID, eventExecPlanID },
    });
    // 根据eventID获取应急人员
    dispatch({
      type: 'emergency/getCommandReceiverList',
      payload: { eventID, name: null },
    });
    // 获取已有指令列表
    const { pageNum, pageSize } = this.state;
    this.page(pageNum, pageSize);
  }
  onChange = (value) => {
    this.props.dispatch({
      type: 'emergency/saveCheckedUser',
      payload: value,
    });
  };
  // 重置查询
  handleFormReset = () => {
    this.page(1, 5);
  };
  // 已有指令列表
  page = (pageNum, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'emergency/selectExistCommand',
      payload: { pageNum, pageSize },
    }).then(() => {
      this.setState({
        pageNum: this.props.existCommandPage.pageNum,
        pageSize: this.props.existCommandPage.pageSize,
        total: this.props.existCommandPage.sumCount,
      });
    });
  };
  getUserName = (item) => {
    const orgName = item.organization ? item.organization.orgnizationName : '';
    const postionName = item.basePostionInfo ? item.basePostionInfo.postionName : '';
    const userName = item.userInfo ? item.userInfo.userName : '';
    return `${orgName} ${postionName} ${userName}`;
  };
  // 搜索
  handleSearch = (form) => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
        isQuery: true,
        fuzzy: true,
      };
      // 防止将空作为查询条件
      for (const obj in values) {
        if (values[obj] === '' || values[obj] === undefined) {
          delete values[obj];
        }
      }
      const search = {};
      Object.assign(search, commonData.pageInitial, values);
      this.props.dispatch({
        type: 'emergency/selectExistCommand',
        payload: search,
      }).then(() => {
        this.setState({
          pageNum: this.props.existCommandPage.pageNum,
          pageSize: this.props.existCommandPage.pageSize,
          total: this.props.existCommandPage.sumCount,
        });
      });
    });
  };
  // 清空
  resetCommand = (e) => {
    e.preventDefault();
    this.props.form.resetFields();
  };
  render() {
    const { add, handleCancel, visible, form, isAdd } = this.props;
    const { commandInfo, flowNodeList } = this.props;
    // 指令表头
    const commandCols = [
      {
        title: '指令分类',
        dataIndex: 'commandType',
        width: 120,
        key: 'commandType',
        render: (text) => {
          return commandType(text);
        },
      }, {
        title: '指令类型',
        dataIndex: 'commandModelName',
        width: 120,
      }, {
        title: '指令内容',
        dataIndex: 'commandContent',
        width: 200,
        key: 'commandContent',
      }, {
        title: '执行岗位',
        dataIndex: 'excutePostionList',
        width: 120,
        key: 'excutePostionList',
        render: (text) => {
          let str = '';
          if (text && text.length > 0) {
            text.forEach((item, index) => {
              if (index !== text.length - 1) {
                str = `${str + item.postionName}, `;
              } else {
                str += item.postionName;
              }
            });
          }
          return str;
        },
      }, {
        title: '执行时长',
        dataIndex: 'executeTime',
        width: 100,
        key: 'executeTime',
      }, {
        title: '注意事项',
        dataIndex: 'attention',
        width: 200,
        key: 'attention',
      }];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const command = selectedRows[0];
        const arr = command.excutePostionList.map(item => item.orgPostionID);
        this.props.form.setFieldsValue({
          // flowNodeID: command.flowNodeID,
          commandType: command.commandType,
          commandContent: command.commandContent,
          executePostion: arr,
          executeTime: command.executeTime,
          attention: command.attention,
        });
      },
      type: 'radio',
    };
    return (
      <Modal
        title={isAdd ? '新增预案指令' : '修改预案指令'}
        cancelText="取消"
        okText="保存"
        visible={visible}
        width="90%"
        mask={false}
        destroyOnClose
        maskClosable={false}
        footer={false}
        onCancel={handleCancel}
      >
        <div className={styles.insert}>
          <Card bordered={false}>
            <Row>
              <Col span={8}>
                <Card title="指令插入">
                  <Form onSubmit={this.handleSearch}>
                    <Row type="flex" className={styles.add}>
                      {form.getFieldDecorator('cmdExecID', {
            initialValue: isAdd ? '' : (commandInfo.cmdExecID),
          })}
                      {form.getFieldDecorator('eventExecPlanID', {
            initialValue: this.props.eventExecPlanID,
          })}
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="流程节点"
                        >
                          {form.getFieldDecorator('flowNodeID', {
                initialValue: isAdd ? '' : (commandInfo.flowNodeID),
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  {flowNodeList.map(type => (
                    <Option
                      key={type.flowNodeID}
                      value={type.flowNodeID}
                    >
                      {type.nodeName}
                    </Option>
))}
                </Select>
              )}
                        </FormItem>
                      </Col>
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="指令分类"
                        >
                          {form.getFieldDecorator('commandType', {
                initialValue: isAdd ? '' : commandInfo.commandType,
                rules: [
                  { required: true, message: '指令分类不能为空' },
                ],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">请选择</Option>
                  <Option value={1}>指令</Option>
                  <Option value={2}>通知</Option>
                </Select>
              )}
                        </FormItem>
                      </Col>
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="指令内容"
                        >
                          {form.getFieldDecorator('commandContent', {
                initialValue: isAdd ? '' : commandInfo.commandContent,
                rules: [
                  { required: true, message: '指令内容不能为空' },
                ],
              })(
                <TextArea row={4} placeholder="请输入指令内容" />
              )}
                        </FormItem>
                      </Col>
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="执行岗位"
                        >
                          {form.getFieldDecorator('executePostion', {
                initialValue: isAdd ? '' : commandInfo.executePostion,
                rules: [],
              })(
                <TreeSelect
                  showSearch
                  style={{ width: 300 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择岗位"
                  allowClear
                  treeCheckable
                  treeNodeFilterProp="title"
                  onChange={this.onChange}
                >
                  { this.props.commandReceiver.map(item => (
                    <TreeNode
                      value={item.postionID}
                      title={item.postionName}
                      key={item.postionID}
                    />
                  ))
                  }
                </TreeSelect>
              )}
                        </FormItem>
                      </Col>
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="执行时长"
                        >
                          {form.getFieldDecorator('executeTime', {
                initialValue: isAdd ? '' : commandInfo.executeTime,
                rules: [],
              })(
                <Input placeholder="请输入执行时长" />
              )}
                        </FormItem>
                      </Col>
                      <Col md={24}>
                        <FormItem
                          labelCol={{ span: 5 }}
                          wrapperCol={{ span: 15 }}
                          label="注意事项"
                        >
                          {form.getFieldDecorator('attention', {
                initialValue: isAdd ? '' : commandInfo.attention,
                rules: [],
              })(
                <TextArea placeholder="请输入注意事项" rows={4} />
              )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Form>
                  <div className={styles.footer}>
                    <Button onClick={this.resetCommand}>清空</Button>
                    <Button type="primary " onClick={() => add(this.props.form, this.props.checkedUser)}>保存</Button>
                  </div>
                </Card>
              </Col>
              <Col span={15} offset={1}>
                <Card title="已有指令选择">
                  <SearchArea
                    handleSearch={this.handleSearch}
                    handleFormReset={this.handleFormReset}
                  />
                  <div className={styles.table}>
                    <Table
                      columns={commandCols}
                      rowSelection={rowSelection}
                      pagination={{
                        onChange: this.page,
                        current: this.state.pageNum,
                        pageSize: this.state.pageSize,
                        total: this.state.total,
                      }}
                      dataSource={this.props.existCommandPage.result}
                      scroll={{ x: 960 }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </Modal>
    );
  }
}
