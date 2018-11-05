import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Form, Input, Button, Card, Row, Col } from 'antd';
import styles from './index.less';

const FormItem = Form.Item;

const resourceCols = [
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
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    key: 'remark',
  }];
@connect(({ emgcResource }) => {
  return {
    data: emgcResource.data,
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
  };
  componentDidMount() {
    const { dispatch } = this.props;
    const { pagination } = this.state;
    dispatch({
      type: 'emgcResource/fetchEmgcResourcePage',
      payload: pagination,
    });
  }
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
  render() {
    const { data, form, name } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.warp}>
        <h2>{name}</h2>
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
                  <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">查询</Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset} htmlType="button">重置</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Table
            className={styles.table}
            dataSource={data.result}
            columns={resourceCols}
            pagination={{ total: data.pageCount, pageSize: data.pageSize, pageSizeOptions: ['5', '10', '20', '30'], onShowSizeChange: this.handlePageChange, onChange: this.handlePageChange, showSizeChanger: true, showQuickJumper: true }}
          />
        </Card>
      </div>
    );
  }
}
const EmergencyResource = Form.create()(FromComponent);
export default EmergencyResource;

