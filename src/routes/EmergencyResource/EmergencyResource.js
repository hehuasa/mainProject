import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Form, Input, Button, Card, Row, Col, Modal, Popconfirm, message } from 'antd';
import AddRes from './AddRes';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ emgcResource }) => {
  const { data, repeated, userData } = emgcResource;
  return {
    data,
    repeated,
    userData,
  };
})
class FromComponent extends PureComponent {
  state = {
    pagination: {
      pageSize: 5,
      pageNum: 1,
      isQuery: true,
      fuzzy: true,
    },
    showModal: false,
    cacheUser: null,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    const { pagination } = this.state;
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: pagination,
    });
  }
  resourceCols = [
    {
      title: '资源名称',
      dataIndex: 'materialName',
      width: 100,
      key: 'materialName',
    }, {
      title: '规格型号',
      dataIndex: 'model',
      width: 120,
      key: 'model',
    }, {
      title: '存放地点',
      dataIndex: 'savePlace',
      width: 120,
      key: 'savePlace',
    }, {
      title: '保管人',
      dataIndex: 'userID',
      width: 100,
      key: 'userID',
      render: (text, record) => {
        return record.baseUserInfo ? record.baseUserInfo.userName : '';
      },
    }, {
      title: '单位',
      dataIndex: 'materialUnit',
      width: 100,
      key: 'materialUnit',
    }, {
      title: '数量',
      dataIndex: 'lastCount',
      width: 100,
      key: 'lastCount',
    }, {
      title: '备注',
      dataIndex: 'remark',
      width: 400,
      key: 'remark',
    }, {
      title: '操作',
      width: 100,
      key: 'action',
      render: (text, record) => (
        <span>
          <Popconfirm title="确定要删除 ?" onConfirm={() => this.delRes(record.toolMaterialInfoID)} okText="确定" cancelText="取消">
            <a>删除</a>
          </Popconfirm>
        </span>
      ),
    }];
  handleSubmit= () => {
    const { form, dispatch } = this.props;
    const { pagination } = this.state;
    const value = form.getFieldsValue();
    // 去掉前后空格
    for (const [index, item] of Object.entries(value)) {
      if (item) {
        value[index] = item.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      }
    }
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: { ...pagination, ...value },
    });
  };
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    const { pagination } = this.state;
    form.resetFields();
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: pagination,
    });
  };
  handlePageChange = (page, size) => {
    const { form, dispatch } = this.props;
    const { pagination } = this.state;
    pagination.pageNum = page;
    pagination.pageSize = size;
    this.setState({ pagination });
    const value = form.getFieldsValue();
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: { ...pagination, ...value },
    });
  };
  handleModalVisible = (param) => {
    this.setState({
      showModal: param,
    });
  };
  // 缓存选择的用户 cacheUser
  saveCacheUserData = (cacheUser) => {
    this.setState({
      cacheUser,
    });
  };
  delRes = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: { toolMaterialInfoID: id },
    }).then(() => {
      message.success('操作成功');
      const { pagination } = this.state;
      dispatch({
        type: 'emgcResource/fetchEmgcResourcePage',
        payload: pagination,
      });
    });
  };
  addRes = () => {
    const { dispatch } = this.props;
    const { form } = this.formRef.props;
    const value = form.getFieldsValue();
    const { cacheUser } = this.state;
    value.userID = cacheUser.userID;
    dispatch({
      type: 'emgcResource/addEmgcResource',
      payload: value,
    }).then(() => {
      message.success('操作成功');
    });
    const { pagination } = this.state;
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: pagination,
    });
    this.handleModalVisible(false);
  };
  render() {
    const { data, form, userData, dispatch, repeated } = this.props;
    const { getFieldDecorator } = form;
    const { showModal, cacheUser } = this.state;
    return (
      <div className={styles.warp}>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <FormItem label="资源名称">
                  {getFieldDecorator('materialName')(
                    <Input placeholder="请输入" />
                )}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem label="存放地点">
                  {getFieldDecorator('savePlace')(
                    <Input placeholder="请输入" />
                )}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem>
                  <Button htmlType="button" icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>新增</Button>
                  <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">查询</Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset} htmlType="button">重置</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Table
            dataSource={data.result}
            columns={this.resourceCols}
            pagination={{ total: data.sumCount, pageSize: data.pageSize, pageSizeOptions: ['5', '10', '20', '30'], onShowSizeChange: this.handlePageChange, onChange: this.handlePageChange, showSizeChanger: true, showQuickJumper: true }}
          />
        </Card>
        <Modal
          destroyOnClose
          title="新增"
          visible={showModal}
          onOk={this.addRes}
          // confirmLoading={this.loading.global}
          width="80%"
          onCancel={() => this.handleModalVisible()}
        >
          <AddRes cacheUser={cacheUser} repeated={repeated} getUser={this.getUser} dispatch={dispatch} userData={userData} wrappedComponentRef={(formRef) => { this.formRef = formRef; }} saveCacheUserData={this.saveCacheUserData}/>
        </Modal>
      </div>
    );
  }
}
const EmergencyResource = Form.create()(FromComponent);
export default EmergencyResource;

