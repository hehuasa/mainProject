import React, { PureComponent } from 'react';
import { Form, Tabs, Row, Col, Input, TreeSelect, Button, InputNumber, Card, Table, Modal, Select } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import { commandType } from '../../../../../utils/utils';
import CommandList from '../index';

const { TabPane } = Tabs;
const { TreeNode } = TreeSelect;
const FormItem = Form.Item;
const Option = Select.Option;
const SearchArea = Form.create()((props) => {
  const { form, handleSearch, handleFormReset } = props;
  const { getFieldDecorator } = form;
  return (
    <Form onSubmit={() => handleSearch(event, form)}>
      <div className={styles.search}>
        <Row>
          <Col md={8} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="指令内容"
            >
              {getFieldDecorator('commandContent')(
                <Input placeholder="请输入指令内容" />
            )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="指令分类"
            >
              {getFieldDecorator('commandType')(
                <Select placeholder="请选择" style={{ minWidth: 100 }}>
                  <Option value="">请选择</Option>
                  <Option value={1}>指令</Option>
                  <Option value={2}>通知</Option>
                </Select>
            )}
            </FormItem>
          </Col>
          <Col md={8}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => handleFormReset(event, form)}>重置</Button>
            </span>
          </Col>
        </Row>
      </div>
    </Form>
  );
});
@connect(({ emergency }) => ({
  flowNodeList: emergency.flowNodeList,
  eventID: emergency.eventId,
  viewNodeType: emergency.viewNodeType,
  existCommandPage: emergency.existCommandPage,
  allCommandModelList: emergency.allCommandModelList,
  commandReceiver: emergency.commandReceiver,
}))
@Form.create()
export default class InsertCommand extends PureComponent {
  state = {
    pageNum: 1,
    pageSize: 5,
    total: 0,
    value: '',
    checkedUser: [],
  };
  componentDidMount() {
    const { dispatch, eventID } = this.props;
    // 获取指令所有类型
    dispatch({
      type: 'emergency/allCommandModelList',
    });
    // 根据eventID获取应急人员
    dispatch({
      type: 'emergency/getCommandReceiverList',
      payload: { eventID, name: null },
    });
    const { pageNum, pageSize } = this.state;
    // 获取已有指令列表
    this.page(pageNum, pageSize);
  }
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
  // 新增指令
  add = () => {
    const { dispatch, form, eventID } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'emergency/addCommandInfo',
        payload: { ...fieldsValue, eventID, userJson: JSON.stringify(this.state.checkedUser) },
      }).then(() => {
        dispatch({
          type: 'emergency/saveIsInsert',
          payload: false,
        });
        dispatch({
          type: 'emergency/getCommandList',
          payload: { eventID, nodeType: this.props.viewNodeType },
        });
        // 获取指令分类下拉列表
        dispatch({
          type: 'emergency/getCommandModelList',
          payload: { eventID, nodeType: this.props.viewNodeType },
        });
      });
    });
  };
  backToList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'emergency/saveIsInsert',
      payload: false,
    });
  };
  // 搜索
  handleSearch = (e, form) => {
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { dispatch } = this.props;
      const { pageNum, pageSize } = this.state;
      dispatch({
        type: 'emergency/selectExistCommand',
        payload: { pageNum, pageSize, ...fieldsValue, isQuery: true, fuzzy: true },
      }).then(() => {
        this.setState({
          pageNum: this.props.existCommandPage.pageNum,
          pageSize: this.props.existCommandPage.pageSize,
          total: this.props.existCommandPage.sumCount,
        });
      });
    });
  };
  handleFormReset = (e, form) => {
    e.preventDefault();
    form.resetFields();
    this.page(1, 10);
  };
  resetCommand = () => {
    this.props.form.resetFields();
  };
  onSelect = (value, node) => {
    const arr = this.state.checkedUser;
    if (node.props.children && node.props.children.length > 0) {
      node.props.children.forEach((child) => {
        const exist = this.state.checkedUser.find(tag => tag === child.key);
        if (!node.props.checked) {
          if (!exist) {
            arr.push(child.key);
            this.setState({
              checkedUser: arr,
            });
          }
        } else if (exist) {
          this.setState({
            checkedUser: arr.filter(tag => tag !== child.key),
          });
        }
      });
    } else {
      const exist = this.state.checkedUser.find(tag => tag === node.props.eventKey);
      if (!node.props.checked) {
        if (!exist) {
          arr.push(node.props.eventKey);
          this.setState({
            checkedUser: arr,
          });
        }
      } else if (exist) {
        this.setState({
          checkedUser: arr.filter(tag => tag !== node.props.eventKey),
        });
      }
    }
  };
  onChange = (value) => {
    this.setState({ value });
    this.props.form.setFieldsValue({
      executePostion: value,
    });
  };
  // 获取指令执行人名字
  getUserName = (item) => {
    const orgName = item.organization ? item.organization.orgnizationName : '';
    const postionName = item.basePostionInfo ? item.basePostionInfo.postionName : '';
    return `${orgName} ${postionName}`;
  };
  render() {
    const { form, allCommandModelList } = this.props;
    const { getFieldDecorator } = form;
    // 指令表头
    const commandCols = [
      {
        title: '流程节点',
        dataIndex: 'nodeName',
        width: 80,
        key: 'nodeName',
        render: (text, record) => {
          return record.planFlowNode ? (record.planFlowNode.nodeName || '') : '';
        },
      }, {
        title: '指令分类',
        dataIndex: 'commandType',
        width: 100,
        key: 'commandType',
        render: (text) => {
          return commandType(text);
        },
      }, {
        title: '指令内容',
        dataIndex: 'commandContent',
        width: 200,
        key: 'commandContent',
      }, {
        title: '执行岗位',
        dataIndex: 'executePostion',
        width: 120,
        key: 'executePostion',
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
        this.props.form.setFieldsValue({
          commandType: command.commandType,
          commandModel: command.commandModel,
          commandContent: command.commandContent,
          executeTime: command.executeTime,
          attention: command.attention,
        });
      },
      type: 'radio',
    };
    return (
      <div className={styles.insert}>
        <Card bordered={false}>
          <Row>
            <Col span={8}>
              <Card title="指令插入">
                <Form onSubmit={this.handleSearch}>
                  <Row type="flex" justify="center">
                    {getFieldDecorator('nodeType', { initialValue: this.props.viewNodeType })}
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="指令分类"
                      >
                        {getFieldDecorator('commandType', {
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          <Option value="">请选择</Option>
                          <Option value={1}>指令</Option>
                          <Option value={2}>通知</Option>
                        </Select>
                      )}
                      </FormItem>
                    </Col>
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="指令类型"
                      >
                        {getFieldDecorator('commandModel', {
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          <Option value="">请选择</Option>
                          {allCommandModelList.map(type =>
                            <Option key={type.commandModelID} value={type.modelCode}>{type.modelName}</Option>
                          )}
                        </Select>
                      )}
                      </FormItem>
                    </Col>
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="指令内容"
                      >
                        {getFieldDecorator('commandContent', {
                          rules: [
                            { required: true, message: '指令内容必填' },
                          ],
                      })(
                        <Input.TextArea row={4} placeholder="请输入指令内容" />
                      )}
                      </FormItem>
                    </Col>
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="执行岗位"
                      >
                        {getFieldDecorator('executePostion', {
                      })(
                        <TreeSelect
                          showSearch
                          style={{ width: '100%' }}
                          // value={this.state.value}
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          placeholder="请选择岗位"
                          allowClear
                          treeCheckable
                          onChange={this.onChange}
                          onSelect={this.onSelect}
                        >
                          { this.props.commandReceiver.map(item => (
                            <TreeNode
                              value={item.postionName}
                              title={item.postionName}
                              key={item.orgPostionID}
                            />
                            ))
                            }
                        </TreeSelect>
                      )}
                      </FormItem>
                    </Col>
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="执行时长"
                      >
                        {getFieldDecorator('executeTime', {
                          rules: [
                            { pattern: /^[0-9]*$/, message: '请输入有效数字' },
                          ],
                        })(
                          <Input placeholder="请输入执行时长(分钟)" />
                      )}
                      </FormItem>
                    </Col>
                    <Col sm={24}>
                      <FormItem
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label="注意事项"
                      >
                        {getFieldDecorator('attention')(
                          <Input.TextArea placeholder="请输入注意事项" rows={4} />
                      )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                <div className={styles.footer}>
                  <Button onClick={this.resetCommand}>清空</Button>
                  <Button onClick={this.backToList}>返回</Button>
                  <Button type="primary" onClick={this.add}>确定</Button>
                </div>
              </Card>
            </Col>
            <Col span={15} offset={1}>
              <Card title="已有指令选择">
                <SearchArea
                  handleSearch={this.handleSearch}
                  handleFormReset={this.handleFormReset}
                />
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
                  rowKey={record => record.commandID}
                  scroll={{ x: 1200 }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
