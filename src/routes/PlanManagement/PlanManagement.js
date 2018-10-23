import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Row, Col, Card, Input, Select, Icon, Button, TreeSelect, Menu, DatePicker,
  Modal, Divider, Popconfirm } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import StandardTable from '../../components/StandardTable';
import PlanInfo from './EditPlan/index';
import { commonData } from '../../../mock/commonData';
import styles from './planManagement.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TreeNode } = TreeSelect;
const statuData = [{
  id: 0,
  value: 0,
  text: '启用',
}, {
  id: 1,
  value: 1,
  text: '停用',
}, {
  id: 3,
  value: 3,
  text: '草稿',
}];

@connect(({ planManagement, organization, user, loading }) => ({
  planManagement,
  annexPage: planManagement.annexPage,
  planLevelList: planManagement.planLevelData,
  preplanType: planManagement.preplanType,
  planBasicInfo: planManagement.planBasicInfo,
  orgTreeData: organization.orgTree,
  currentUser: user.currentUser,
  loading,
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
    // 请求预案级别
    this.props.dispatch({
      type: 'planManagement/planLevelData',
    });
    // 请求实体组织机构树
    this.props.dispatch({
      type: 'organization/getEmgcOrgTree',
    });
    // 请求应急组织机构树
    this.props.dispatch({
      type: 'organization/getOrgTree',
    });
    // 请求预案类型
    this.props.dispatch({
      type: 'planManagement/preplanType',
    });
  }
  // 获取分页数据
  page = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'planManagement/page',
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
      type: 'planManagement/page',
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
      type: 'planManagement/page',
      payload: commonData.pageInitial,
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
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
        planName: fieldsValue.planName,
        statu: fieldsValue.statu,
        //   createTimes: fieldsValue.createTime ? fieldsValue.createTime.format('YYYY-MM-DD') : undefined,
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
  // 打开和关闭modal
  handleModalVisible = (flag) => {
    if (!flag) {
      this.props.dispatch({
        type: 'planManagement/addIsDeleteData',
      });
    }
    this.setState({
      modalVisible: !!flag,
      clickRow: null,
    });
  };

  // 新增
  handleAdd = (fields) => {
    if (this.state.clickRow) {
      this.doAdd(fields);
    } else {
      this.doUpdate(fields);
    }
  };
  doAdd = (fields) => {
    this.props.dispatch({
      type: 'planManagement/add',
      payload: fields,
    }).then(() => {
      if (this.props.planManagement.toggle) {
        this.setState({
          modalVisible: false,
        });
        this.props.dispatch({
          type: 'planManagement/queryMajorContent',
        });
      }
    });
  };
  // 修改函数
  doUpdate = (fields) => {
    // this.props.dispatch({
    //   type: 'planManagement/update',
    //   payload: fields,
    // }).then(() => {
    //   if (this.props.planManagement.toggle) {
    //     this.setState({
    //       modalVisible: false,
    //     });
    //     this.props.dispatch({
    //       type: 'planManagement/queryMajorContent',
    //     });
    //   }
    // });
  };
  // 执行删除函数
  delete = (record) => {
    this.props.dispatch({
      type: 'planManagement/delete',
      payload: { id: [record.planInfoID] },
    }).then(() => {
      this.page(commonData.pageInitial);
    });
  };
  deleteAll = () => {
    const arr = [];
    this.state.selectedRows.forEach((user) => {
      arr.push(user.planInfoID);
    });
    this.props.dispatch({
      type: 'planManagement/delete',
      payload: { id: arr },
    }).then(() => {
      this.page(commonData.pageInitial);
    });
  };
  //  修改
  update = (record) => {
    // 请求预案信息
    this.props.dispatch({
      type: 'planManagement/getPlanInfo',
      payload: {
        id: record.planInfoID,
      },
    });
    // 请求事件特征
    this.props.dispatch({
      type: 'planManagement/getEventFeatures',
      payload: {
        planInfoID: record.planInfoID,
      },
    });
    // 请求资源信息
    this.props.dispatch({
      type: 'planManagement/getResourceContent',
      payload: {
        planInfoID: record.planInfoID,
      },
    });
    /**
     * @author HuangJie
     * @date 2018/7/12
     * @Description: 获取预案指令
    */
    this.props.dispatch({
      type: 'planManagement/getPlanCommand',
      payload: {
        planInfoID: record.planInfoID,
      },
    });
    /**
     * @author HuangJie
     * @date 2018/7/12
     * @Description: 获取预案应急资源
    */
    this.props.dispatch({
      type: 'planManagement/getPlanResource',
      payload: {
        planInfoID: record.planInfoID,
      },
    });
    // 通过预案ID 获取附件列表
    const { pageNum, pageSize } = this.props.annexPage;
    this.props.dispatch({
      type: 'planManagement/getAnnexPage',
      payload: { planInfoID: record.planInfoID, uploadType: 2, pageNum, pageSize, isQuery: true, fuzzy: false },
    });
    // 通过预案ID 获取处置卡列表 uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
    this.props.dispatch({
      type: 'planManagement/getDealCard',
      payload: { planInfoID: record.planInfoID, uploadType: 3 },
    });
    // 获取组织结构
    this.props.dispatch({
      type: 'planManagement/getOrgAnnex',
      payload: { planInfoID: record.planInfoID, uploadType: 1 },
    });
    // 获取应急流程
    this.props.dispatch({
      type: 'planManagement/getEmgcProcess',
      payload: { planInfoID: record.planInfoID, uploadType: 4 },
    });
    this.setState({
      clickRow: record,
      modalVisible: true,
    });
  };
  //  复制预案
  copyPlan = (record) => {
    // 请求预案信息
    this.props.dispatch({
      type: 'planManagement/getPlanInfo',
      payload: {
        id: record.planInfoID,
      },
    }).then(() => {
      const { planBasicInfo } = this.props;
      const { baseUserInfo } = this.props.currentUser;
      const { userID } = baseUserInfo;
      this.props.dispatch({
        type: 'planManagement/updatePlanInfo',
        payload: {
          flowID: planBasicInfo.flowID,
          version: planBasicInfo.version,
          statu: planBasicInfo.statu,
          planInfoID: planBasicInfo.planInfoID,
          planName: planBasicInfo.planName,
          userPlanCode: planBasicInfo.userPlanCode,
          planType: planBasicInfo.planType,
          planLevelID: planBasicInfo.planLevelID,
          emgcOrgID: planBasicInfo.emgcOrgID,
          applyObjectName: planBasicInfo.applyObjectName,
          orgID: planBasicInfo.orgID,
          attention: planBasicInfo.attention,
          userID },
      }).then(() => {
        this.props.dispatch({
          type: 'planManagement/page',
          payload: { pageNum: 1, pageSize: 5 },
        });
      });
    });
  };
  okHandle = (flag) => {
    this.setState({
      modalVisible: false,
      clickRow: null,
    });
  };
  // 改变预案状态
  changeStatu = (planInfoID, statu) => {
    const { data } = this.props.planManagement;
    this.props.dispatch({
      type: 'planManagement/changePlanStatu',
      payload: { planInfoID, statu },
    }).then(() => {
      const pageNum = data.pagination.current;
      const { pageSize } = data.pagination;
      this.page({ pageNum, pageSize });
    });
  };
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    const { planLevelList, orgTreeData } = this.props;
    const renderDeptTreeNodes = (data) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode
              title={item.orgnizationName}
              key={item.orgID}
              value={`${item.orgID}`}
            >
              {renderDeptTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            title={item.orgnizationName}
            key={item.orgID}
            value={`${item.orgID}`}
          />
        );
      });
    };
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="预案名称">
              {getFieldDecorator('planName')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="预案级别">
              {getFieldDecorator('planLevelID')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="">请选择</Select.Option>
                  { planLevelList.map(item => (
                    <Select.Option key={`${item.emgcLevelID}`} value={`${item.emgcLevelID}`} >{item.levelName}</Select.Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
              </Button>
              <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const { planLevelList, orgTreeData, preplanType } = this.props;
    const renderDeptTreeNodes = (data) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode
              title={item.orgnizationName}
              key={item.orgID}
              value={`${item.orgID}`}
            >
              {renderDeptTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            title={item.orgnizationName}
            key={item.orgID}
            value={`${item.orgID}`}
          />
        );
      });
    };
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="预案名称">
              {getFieldDecorator('planName')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="预案级别">
              {getFieldDecorator('planLevelID')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="">请选择</Select.Option>
                  { planLevelList.map(item => (
                    <Select.Option key={`${item.emgcLevelID}`} value={`${item.emgcLevelID}`} >{item.levelName}</Select.Option>
                  ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="编制部门">
              {getFieldDecorator('orgID')(
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择所属部门"
                  treeNodeFilterProp="title"
                  allowClear
                  onChange={this.onChange}
                >
                  {renderDeptTreeNodes(orgTreeData)}
                </TreeSelect>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="预案分类">
              {getFieldDecorator('planType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="">请选择</Select.Option>
                  { preplanType.map(item => (
                    <Select.Option key={item.code} value={item.code} >{item.codeName}</Select.Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="预案编码">
              {getFieldDecorator('userPlanCode')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col lg={8} md={12} sm={24} >
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
                </Button>
                <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">查询</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
                </a>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }
  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  render() {
    const { data } = this.props.planManagement;
    const { loading } = this.props;
    const { selectedRows, modalVisible, clickRow } = this.state;
    const columns = [
      {
        title: '预案名称',
        dataIndex: 'planName',
        width: 220,
      },
      {
        title: '预案级别',
        dataIndex: 'planPlanLevel',
        width: 120,
        render: (text) => {
          return text ? text.levelName : '';
        },
      },
      {
        title: '编制部门',
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: '预案分类',
        dataIndex: 'planTypeName',
        width: 100,
      },
      {
        title: '预案编号',
        dataIndex: 'userPlanCode',
        width: 120,
      },
      {
        title: '版本',
        dataIndex: 'version',
        width: 60,
      },
      {
        title: '状态',
        dataIndex: 'statu',
        width: 60,
        render: (text) => {
          switch (text) {
            case 0: return '启用';
            case 1: return '停用';
            case 3: return '草稿';
            default: return '未知';
          }
        },
      },
      {
        title: '记录维护人员',
        dataIndex: 'baseUserInfo',
        width: 150,
        render: (text) => {
          return text ? text.userName : '';
        },
      },
      {
        title: '发布时间',
        dataIndex: 'releaseTime',
        // width: 180,
        render: (val) => {
          if (!val) {
            return '';
          }
          return <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      {
        title: '操作',
        width: 200,
        fixed: 'right',
        render: (text, record) => {
          // 获取该行的id，可以获取的到，传到函数里的时候打印直接把整个表格所有行id全部打印了
          return (
            <Fragment>
              {
                record.statu === 0 ? <a href="#" onClick={() => this.copyPlan(record)}>复制</a> :
                <a href="#" onClick={() => this.update(record)}>修改</a>
              }
              <Divider type="vertical" />
              <Popconfirm title="确定将预案状态改为启用？" onConfirm={() => this.changeStatu(record.planInfoID, 0)}>
                <a href="#">启用</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm title="确定将预案状态改为停用？" onConfirm={() => this.changeStatu(record.planInfoID, 1)}>
                <a href="#">停用</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm title="确定将预案状态改为草稿？" onConfirm={() => this.changeStatu(record.planInfoID, 3)}>
                <a href="#">草稿</a>
              </Popconfirm>
            </Fragment>
          );
        },
      },
    ];
    // const parentMethods = {
    //   handleAdd: this.handleAdd,
    //   handleModalVisible: this.handleModalVisible,
    // };
    return (
      <PageHeaderLayout title="预案列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading.global}
              discheckeble
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="planInfoID"
              scroll={{ x: 1330 }}
            />
          </div>
        </Card>
        <Modal
          bodyStyle={{ height: 600 }}
          destroyOnClose
          confirmLoading={loading.global}
          title={clickRow ? '修改' : '新增'}
          visible={modalVisible}
          onOk={this.okHandle}
          width="80%"
          onCancel={() => this.handleModalVisible()}
        >
          <PlanInfo
            planInfoId={clickRow ? clickRow.planInfoID : null}
            handleModalVisible={this.handleModalVisible}
            hideFooter
          />
        </Modal>
      </PageHeaderLayout>
    );
  }
}
