import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col,
  Card,
  Form,
  Input,
  Tabs,
  Icon,
  Button,
  Tag,
  Menu,
  Table,
  Modal,
  Divider,
  Popconfirm,
  Tree,
} from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './TableList.less';
import { commonData } from '../../../mock/commonData';
import { getUUID } from '../../utils/utils';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TreeNode } = Tree;
const TabPane = Tabs.TabPane;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

// 新增 修改页
const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible, orgTree,
    addCustomUser, closeCustom } = props;
  const { msgGroupInfo, isAdd, onLoadData, onCheck, checkedUsers, handleClose,
    customUsers } = props;
  // 自定义人员表头
  const columns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
  }, {
    title: '电话',
    dataIndex: 'mobile',
    key: 'mobile',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href="javascript:;" onClick={() => closeCustom(record)}>移除</a>
      </span>
    ),
  }];
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  };
  const renderDeptTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            title={item.orgnizationName}
            key={item.orgID}
            value={item.orgID}
            dataRef={item}
          >
            {renderDeptTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={item.orgnizationName}
          dataRef={item}
          isLeaf
          key={item.orgID}
          value={item.orgID}
        />
      );
    });
  };
  // 关闭后销毁子元素
  const destroyOnClose = true;
  return (
    <Modal
      destroyOnClose={destroyOnClose}
      title={isAdd ? '新增分组' : '修改分组'}
      visible={modalVisible}
      onOk={okHandle}
      width="80%"
      onCancel={() => handleModalVisible()}
    >
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={12} sm={24}>
          {form.getFieldDecorator('shortMsgUserGroupID', {
            initialValue: isAdd ? '' : msgGroupInfo.shortMsgUserGroupID,
          })(
            <Input type="hidden" />
          )}
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col sm={24}>
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label="分组名称"
              >
                {form.getFieldDecorator('groupName', {
              initialValue: isAdd ? '' : msgGroupInfo.groupName,
              rules: [{ required: true, message: '分组名称不能为空' }],
            })(
              <Input placeholder="请输入分组名称" />
            )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label="组成员"
              >
                <div className={styles.member}>
                  {checkedUsers.map((user) => {
                    return (
                      <Tag key={user.userID} style={{ marginBottom: 4 }} closable afterClose={() => handleClose(user)}>
                        {`${user.userName} ${user.mobile || ''}`}
                      </Tag>
                    );
                  })
                  }
                  {customUsers.map((user) => {
                    return (
                      <Tag key={user.id} style={{ marginBottom: 4 }} closable afterClose={() => closeCustom(user)}>
                        {`${user.userName} ${user.mobile || ''}`}
                      </Tag>
                    );
                  })
                  }
                </div>
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label="备注"
              >
                {form.getFieldDecorator('remark', {
              initialValue: isAdd ? '' : msgGroupInfo.remark,
              rules: [],
            })(
              <TextArea />
            )}
              </FormItem>
            </Col>
          </Row>
        </Col>
        <Col md={12} sm={24}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <div className={styles.container}>
              <Tabs type="card">
                <TabPane tab="组织机构人员" key="1">
                  <Tree
                    loadData={onLoadData}
                    onCheck={onCheck}
                    checkable
                  >
                    {renderDeptTreeNodes([orgTree])}
                  </Tree>
                </TabPane>
                <TabPane tab="自定义接收人" key="2">
                  <AddCustom
                    addCustomUser={addCustomUser}
                  />
                  <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Table columns={columns} dataSource={customUsers} />
                  </Row>
                </TabPane>
              </Tabs>
            </div>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
});
const AddCustom = Form.create()((props) => {
  const { addCustomUser, form } = props;
  return (
    <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
      <Col md={9} sm={24}>
        <FormItem
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          label="姓名"
        >
          {form.getFieldDecorator('userName', {
            rules: [],
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
      </Col>
      <Col md={9} sm={24}>
        <FormItem
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          label="电话"
        >
          {form.getFieldDecorator('mobile', {
            rules: [
              { pattern: /^1[3|4|5|7|8]\d{9}$/, message: '请输入正确的手机号' },
              { required: true, message: '手机号不为空' },
            ],
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
      </Col>
      <Col md={6} sm={24}>
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          label=""
        >
          <div className={styles.addBtn} onClick={() => addCustomUser(form)}>
            <Icon type="plus-circle" />
          </div>
        </FormItem>
      </Col>
    </Row>
  );
});
@connect(({ template, typeCode }) => ({
  template,
  orgTree: template.orgTree,
  orgUsers: template.orgUsers,
  checkedUsers: template.checkedUsers,
  customUsers: template.customUsers,
  msgGroup: template.msgGroup,
  msgGroupInfo: template.msgGroupInfo,
  typeCode,
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
    customUser: {}, // 自定义短信接收人员信息
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // 请求部门树
    dispatch({
      type: 'template/getOrgTree',
    });
    this.page(commonData.pageInitial);
  }

  // 获取分页数据
  page = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/msgGroupPage',
      payload: page,
    });
  };
  // 初始化表格数据
  initData = () => {
    const tableTitles = [];
    commonData.columns.msgGroup.attributes.forEach((item) => {
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
            <Popconfirm title="确定删除？" onConfirm={() => this.delete(record)}>
              <a href="#">删除</a>
            </Popconfirm>
            <Divider type="vertical" />
            <a href="javascript: void(0)" onClick={() => this.update(record)}>修改</a>
          </Fragment>
        );
      },
    });
    return tableTitles;
  };
  // 异步加载组织机构下的人员
  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props.children.length > 0) {
        resolve();
        return;
      }
      this.props.dispatch({
        type: 'template/getOrgUsers',
        payload: { orgID: treeNode.props.dataRef.orgID },
      }).then(() => {
        treeNode.props.dataRef.children = this.props.orgUsers;
        this.props.dispatch({
          type: 'template/saveOrgTree',
          payload: this.props.orgTree,
        });
        resolve();
      });
    });
  }
  // 点击复选框
  onCheck = (checkedKeys, { checked: bool, node: { props } }) => {
    const { dataRef } = props;
    if (props.isLeaf) {
      this.props.dispatch({
        type: 'template/saveCheckedUsers',
        payload: bool ? this.addReceptor(this.props.checkedUsers, dataRef) :
          this.deleteReceptor(this.props.checkedUsers, dataRef),
      });
    } else {
      this.props.dispatch({
        type: 'template/getOrgUsers',
        payload: { orgID: dataRef.orgID },
      }).then(() => {
        this.props.orgUsers.forEach((user) => {
          this.props.dispatch({
            type: 'template/saveCheckedUsers',
            payload: bool ? this.addReceptor(this.props.checkedUsers, user) :
              this.deleteReceptor(this.props.checkedUsers, user),
          });
        });
      });
    }
  };
  // 去掉接收人
  handleClose = (user) => {
    this.props.dispatch({
      type: 'template/saveCheckedUsers',
      payload: this.deleteReceptor(this.props.checkedUsers, user),
    });
  };
  // 去掉自定义接收人
  closeCustom = (custom) => {
    const arr = this.props.customUsers.filter(user => user.id !== custom.id);
    this.props.dispatch({
      type: 'template/saveCustomUsers',
      payload: arr,
    });
  };
  // 自定义人员姓名变化  手动双向绑定
  userNameChange = (e) => {
    const { customUser } = this.state;
    this.setState({
      customUser: { ...customUser, userName: e.target.value },
    });
  };
  // 自定义人员电话变化  手动双向绑定
  mobileChange = (e) => {
    const { customUser } = this.state;
    this.setState({
      customUser: { ...customUser, mobile: e.target.value },
    });
  };
  // 添加自定义人员
  addCustomUser = (form) => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { customUsers } = this.props;
      const arr = [...customUsers, { ...fieldsValue, id: getUUID() }];
      this.props.dispatch({
        type: 'template/saveCustomUsers',
        payload: arr,
      });
      form.resetFields();
    });
  };
  // 数组去重
  noRepeat = (arr) => {
    const hash = {};
    arr = arr.reduce((item, next) => {
      hash[next.userID] ? '' : hash[next.userID] = true && item.push(next);
      return item;
    }, []);
    return arr;
  };
  // 新增接收人
  addReceptor = (arr, obj) => {
    const array = arr.filter(item => item.userID === obj.userID);
    if (!array.length > 0) {
      return [...arr, obj];
    }
    return arr;
  };
  // 删除接收人
  deleteReceptor = (arr, obj) => {
    return arr.filter(temp => temp.userID !== obj.userID);
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
      isQuery: true,
      fuzzy: true,
      ...formValues,
    };
    if (sorter.field) {
      // params.sorter = `${sorter.field}_${sorter.order}`;
      const { field, order } = sorter;
      params.sorter = { field, order };
    }
    this.page(params);
  };
  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'template/page',
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
      const values = {
        ...fieldsValue,
        isQuery: true,
        fuzzy: true,
      };
      const search = {};
      Object.assign(search, commonData.pageInitial, values);
      this.page(search);
    });
  };
  handleModalVisible = (flag) => {
    this.props.dispatch({
      type: 'template/saveCheckedUsers',
      payload: [],
    });
    this.props.dispatch({
      type: 'template/saveCustomUsers',
      payload: [],
    });
    this.setState({
      modalVisible: !!flag,
      isAdd: true,
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
    const { checkedUsers, customUsers, dispatch } = this.props;
    const userIDList = checkedUsers.map((obj) => {
      return obj.userID;
    });
    const data = {
      ...fields,
      userIDList,
      userList: customUsers,
    };
    dispatch({
      type: 'template/addMsgGroup',
      payload: { groupJson: JSON.stringify(data) },
    }).then(() => {
      this.page(commonData.pageInitial);
      this.setState({
        modalVisible: false,
      });
    });
  };
  // 修改函数
  doUpdate = (fields) => {
    const { checkedUsers, customUsers, dispatch } = this.props;
    const userIDList = checkedUsers.map((obj) => {
      return obj.userID;
    });
    const data = {
      ...fields,
      userIDList,
      userList: customUsers,
    };
    dispatch({
      type: 'template/updateMsgGroup',
      payload: { groupJson: JSON.stringify(data) },
    }).then(() => {
      this.page(commonData.pageInitial);
      this.setState({
        modalVisible: false,
      });
    });
  };
  // 执行删除函数
  delete = (record) => {
    this.props.dispatch({
      type: 'template/deleteMsgGroup',
      payload: { id: [record.shortMsgUserGroupID] },
    }).then(() => {
      this.page(commonData.pageInitial);
    });
  };
  deleteAll = () => {
    const userIds = [];
    this.state.selectedRows.forEach((tem) => {
      userIds.push(tem.shortMsgUserGroupID);
    });
    this.props.dispatch({
      type: 'template/deleteMsgGroup',
      payload: { id: userIds },
    }).then(() => {
      this.page(commonData.pageInitial);
    });
  };
  update = (record) => {
    this.setState({
      modalVisible: !this.state.modalVisible,
      isAdd: false,
    });
    this.props.dispatch({
      type: 'template/saveCheckedUsers',
      payload: [],
    });
    this.props.dispatch({
      type: 'template/getMsgGroup',
      payload: { id: record.shortMsgUserGroupID },
    });
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="组名">
              {getFieldDecorator('groupName')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
              </Button>
              <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="模板名称">
              {getFieldDecorator('templateTitle')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
            </Button>
            <Button style={{ marginLeft: 8 }} type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { loading, template: { data }, template: { tem } } = this.props;
    const { msgGroup } = this.props;
    const { selectedRows, modalVisible } = this.state;
    const columns = this.initData();
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="短信分组列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={msgGroup}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="shortMsgUserGroupID"
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
          isAdd={this.state.isAdd}
          customUser={this.state.customUser}
          customUsers={this.props.customUsers}
          msgGroupInfo={this.props.msgGroupInfo}
          orgTree={this.props.orgTree}
          checkedUsers={this.props.checkedUsers}
          onLoadData={this.onLoadData}
          onCheck={this.onCheck}
          handleClose={this.handleClose}
          closeCustom={this.closeCustom}
          userNameChange={this.userNameChange}
          mobileChange={this.mobileChange}
          addCustomUser={this.addCustomUser}
        />
      </PageHeaderLayout>
    );
  }
}
