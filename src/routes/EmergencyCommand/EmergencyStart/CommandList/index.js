import React, { PureComponent } from 'react';
import { Form, Button, Card, Table, Select, Input, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import styles from './index.less';
import InsertCommand from './InsertCommand/index';
import { emgcIntervalInfo } from '../../../../services/constantlyData';

const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ emergency, user }) => ({
  commandList: emergency.commandList,
  eventID: emergency.eventId,
  commandModel: emergency.commandModel,
  isInsert: emergency.isInsert,
  viewNodeType: emergency.viewNodeType,
  viewNode: emergency.viewNode,
  current: emergency.current,
  currentUser: user.currentUser,
  commandStatus: emergency.commandStatus,
}))
@Form.create()
export default class CommandList extends PureComponent {
  state = {
    editingKey: '',
    executeContent: '',
    visible: '',
    commandModel: null,
  };
  componentDidMount() {
    const { dispatch, eventID, viewNode } = this.props;
    // 根据事件ID获取指令列表
    dispatch({
      type: 'emergency/selectNodeType',
      payload: { eventID, eventStatu: viewNode },
    }).then(() => {
      dispatch({
        type: 'emergency/getCommandList',
        payload: { eventID, nodeType: this.props.viewNodeType },
      });
      //  获取指令类型列表
      dispatch({
        type: 'emergency/getCommandModelList',
        payload: { eventID, nodeType: this.props.viewNodeType },
      });
    });
    //  获取指令操作状态列表
    dispatch({
      type: 'emergency/getCommandStatus',
    });
    // 刷新指令列表
    emgcIntervalInfo.commondList.forEach((item) => {
      clearInterval(item);
    });
    const id = setInterval(this.getCommandList,
      emgcIntervalInfo.timeSpace);
    emgcIntervalInfo.commondList.push(id);
  }
  // 根据指令类型获取指令列表
  getCommandListByModel = (commandModel) => {
    const { dispatch, eventID, viewNodeType } = this.props;
    // 根据事件ID获取指令列表
    dispatch({
      type: 'emergency/getCommandList',
      payload: { eventID, commandModel, nodeType: viewNodeType },
    });
  };
  getCommandList = () => {
    const { dispatch, eventID, viewNodeType } = this.props;
    const { commandModel } = this.state;
    dispatch({
      type: 'emergency/getCommandList',
      payload: { eventID, commandModel, nodeType: viewNodeType },
    });
  };
  // 指令类型下拉框改变 根据不同类型获取指令列表
  commandTypeChange = (value) => {
    this.setState({
      commandModel: value,
    });
    this.getCommandListByModel(value);
  };
  // 打开指令插入界面
  openInsert = () => {
    this.props.dispatch({
      type: 'emergency/saveIsInsert',
      payload: true,
    });
  };
  // 修改指令执行状态
  handleChange = (commandStat, cmdExecID) => {
    const { dispatch, eventID } = this.props;
    // 根据事件ID获取指令列表
    dispatch({
      type: 'emergency/updateCommandStatus',
      payload: { commandStat, cmdExecID },
    }).then(() => {
      //  获取指令类型列表
      dispatch({
        type: 'emergency/getCommandList',
        payload: { eventID, nodeType: this.props.viewNodeType },
      });
    });
  };
  // 点击行编辑
  editRow = (record) => {
    this.setState({
      editingKey: record.cmdExecID,
      executeContent: record.executeContent,
      visible: true,
    });
  };
  // 保存行编辑
  saveRow = () => {
    const { executeContent, editingKey } = this.state;
    const { dispatch, eventID, commandList } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    }).then(() => {
      const { userID } = this.props.currentUser.baseUserInfo;
      dispatch({
        type: 'emergency/updateExecuteContent',
        payload: { executeContent, cmdExecID: editingKey, userID },
      }).then(() => {
        const arr = commandList.map((item) => {
          if (item.cmdExecID === editingKey) { return { ...item, executeContent }; }
          return item;
        });
        dispatch({
          type: 'emergency/saveCommandList',
          payload: arr,
        });
        // dispatch({
        //   type: 'emergency/getCommandList',
        //   payload: { eventID, nodeType: this.props.viewNodeType },
        // });
        this.setState({
          editingKey: '',
          visible: false,
        });
      });
    });
  };
  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  // 指令执行情况描述
  onChange = (e) => {
    this.setState({
      executeContent: e.target.value,
    });
  };
  render() {
    const { commandList, commandModel, isInsert, commandStatus } = this.props;
    // 指令表头
    const commandCols = [
      {
        title: '状态',
        dataIndex: 'commandStat',
        width: 120,
        key: 'commandStat',
        filters: Object.keys(commandStatus).map((item) => {
          return { text: commandStatus[item], value: item };
        }),
        onFilter: (value, record) => record.commandStat === parseInt(value, 0),
        render: (value, record) => {
          return (
            <Select
              // defaultValue={value ? value.toString() : ''}
              value={value ? value.toString() : ''}
              style={{ width: 80 }}
              placeholder="请选择"
              onChange={select => this.handleChange(select, record.cmdExecID)}
            >
              {Object.keys(commandStatus).map(key =>
                <Option key={key} value={key}>{commandStatus[key]}</Option>
              )}
            </Select>
          );
        },
      }, {
        title: '指令类型',
        dataIndex: 'commandModelName',
        width: 100,
        key: 'commandModelName',
      }, {
        title: '指令内容',
        dataIndex: 'commandContent',
        width: 200,
        key: 'commandContent',
      }, {
        title: '执行情况',
        dataIndex: 'executeContent',
        width: 160,
        key: 'executeContent',
      }, {
        title: '执行岗位',
        dataIndex: 'executeUser',
        width: 120,
        key: 'executeUser',
        render: (text) => {
          let str = '';
          if (text && text.length > 0) {
            text.forEach((item, index) => {
              if (item) {
                if (index !== text.length - 1) {
                  str = `${str + item.postionName}, `;
                } else {
                  str += item.postionName;
                }
              }
            });
          }
          return str;
        },
      }, {
        title: '下发时间',
        dataIndex: 'sendTime',
        width: 160,
        key: 'sendTime',
        render: (text) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
        },
      }, {
        title: '执行时长/分钟',
        dataIndex: 'executeTime',
        width: 140,
        key: 'executeTime',
      }, {
        title: '下发时间',
        dataIndex: 'executeEndTime',
        width: 160,
        key: 'executeEndTime',
        render: (text) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
        },
      }, {
        title: '注意事项',
        dataIndex: 'attention',
        // width: 80,
        key: 'attention',
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        key: 'action',
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.editRow(record)}>编辑</a>
          );
        },
      }];
    const extra = (
      <div className={styles.extra}>
        <span style={{ marginRight: 16 }}>指令类型</span>
        <Select defaultValue="" style={{ width: 200 }} onChange={this.commandTypeChange}>
          <Option value="">全部</Option>
          {commandModel.map(type =>
            <Option key={type.commandModelID} value={type.modelCode}>{type.modelName}</Option>
          )}
        </Select>
      </div>
    );
    const { current, viewNode } = this.props;
    const title = (
      <div className={styles.insertBtn}>
        <Button disabled={viewNode < current} type="primary" onClick={this.openInsert}>插入新指令</Button>
      </div>
    );
    return (
      <div className={styles.commandList}>
        { !isInsert ? (
          <Card title={title} extra={extra}>
            <Table
              // rowKey={record => record.cmdExecID}
              rowKey="cmdExecID"
              columns={commandCols}
              dataSource={commandList}
              pagination={{ pageSize: 5 }}
              rowClassName={record => (record.executeEndTime && record.executeEndTime < moment().valueOf() ? `${styles.endColor}` : '')}
              scroll={{ x: 1420 }}
            />
          </Card>
    ) : (
      <InsertCommand />
    )}
        <Modal
          title="编辑指令执行情况"
          visible={this.state.visible}
          onOk={this.saveRow}
          onCancel={this.handleCancel}
        >
          <FormItem
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            label="指令执行情况"
          >
            <Input.TextArea rows={4} type="text" value={this.state.executeContent} onChange={this.onChange} />
          </FormItem>
        </Modal>
      </div>
    );
  }
}
