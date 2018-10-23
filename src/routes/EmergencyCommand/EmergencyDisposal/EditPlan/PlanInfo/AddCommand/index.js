import React, { PureComponent } from 'react';
import { Row, Col, Modal, Form, Input, Select, TreeSelect } from 'antd';
import { connect } from 'dva';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TreeNode } = TreeSelect;
const Option = Select.Option;
@Form.create()
@connect(({ emergency }) => ({
  flowNodeList: emergency.flowNodeList,
  eventID: emergency.eventId,
  commandReceiver: emergency.commandReceiver,
  checkedUser: emergency.checkedUser,
  eventExecPlanID: emergency.eventExecPlanID,
}))
export default class AddFeature extends PureComponent {
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
  }
  onChange = (value) => {
    this.props.dispatch({
      type: 'emergency/saveCheckedUser',
      payload: value,
    });
  }
  getUserName = (item) => {
    const orgName = item.organization ? item.organization.orgnizationName : '';
    const postionName = item.basePostionInfo ? item.basePostionInfo.postionName : '';
    const userName = item.userInfo ? item.userInfo.userName : '';
    return `${orgName} ${postionName} ${userName}`;
  };
  render() {
    const { add, handleCancel, visible, form, isAdd } = this.props;
    const { commandInfo, flowNodeList } = this.props;
    return (
      <Modal
        title={isAdd ? '新增预案指令' : '修改预案指令'}
        cancelText="取消"
        okText="保存"
        visible={visible}
        mask={false}
        destroyOnClose
        maskClosable={false}
        onOk={() => add(this.props.form, this.props.checkedUser)}
        onCancel={handleCancel}
      >
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
      </Modal>
    );
  }
}
