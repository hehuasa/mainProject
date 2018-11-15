import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Input, DatePicker, Select, Modal, Table, message } from 'antd';
import moment from 'moment';
import InfoRecord from './InfoRecord';
import { commonData } from '../../../../../mock/commonData';
import styles from './InfoRecord.less';
import { EDEADLK } from 'constants';

const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;
// const { TextArea } = Input;

const pageInitial = {
  // 当前页
  pageNum: 1,
  // 每页显示条数
  pageSize: 5,
  isQuery: true,
  fuzzy: true,
};
const columns = [{
  title: '特征分类',
  dataIndex: 'featureTypeName',
  width: '20%',
}, {
  title: '特征名称',
  dataIndex: 'featureName',
  width: '80%',
}];

@connect(({ emergency, user }) => ({
  emergency,
  eventID: emergency.eventId,
  userId: user.currentUser.baseUserInfo.userID,
}))
@Form.create()
export default class  EventContent extends PureComponent {
  state = {
    visible: false,
    rowSelection: {
      type: 'radio',
      // 选择的数据
      selectedRows: [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows,
        });
      },
    },
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'emergency/queryClassification',
      payload: 557,
    });
    this.props.dispatch({
      type: 'emergency/searchEventFeatures',
      payload: {
        pageNum: 1,
        pageSize: 5,
        eventID: this.props.eventID,
      },
    });
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = (e) => {
    const selectedRow = this.state.selectedRows;
    if (!selectedRow || selectedRow.length === 0) {
      return message.warning('请选择数据');
    }
    const { form } = this.props;
    form.setFieldsValue({
      featureType: selectedRow[0].featureType,
      // panRedirectFeatureID: selectedRow[0].featureID,
      featureID: selectedRow[0].featureID,
      eventFeature: selectedRow[0].featureName,
      eventFeatureDes: selectedRow[0].featureDes,
    });
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }
  // 下一页
  onhandleTableChange = (pagination, filtersArg, sorter) => {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      eventID: this.props.eventID,
      isQuery: true,
      fuzzy: true,
      featureValue: this.state.featureValue,
    };
    this.props.dispatch({
      type: 'emergency/searchEventFeatures',
      payload: params,
    });
  }
  // 搜索
  onSearchFeature = (val) => {
    this.props.dispatch({
      type: 'emergency/searchEventFeatures',
      payload: {
        ...pageInitial,
        eventID: this.props.eventID,
        featureName: val,
      },
    });
  }
  // 重置搜索条件
  handleFormReset = () => {
    this.props.dispatch({
      type: 'emergency/searchEventFeatures',
      payload: {
        pageNum: 1,
        pageSize: 10,
        eventID: this.props.eventID,
      },
    });
  };
  onSend = () => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const time = new Date(fieldsValue.occurTimes.format('YYYY-MM-DD HH:mm:ss'));
      fieldsValue.occurTimes = time.getTime();
      fieldsValue.eventID = this.props.emergency.eventId;
      fieldsValue.userID = this.props.userId;
      if (fieldsValue.featureID === undefined) {
        delete fieldsValue.featureID;
      }
      this.props.dispatch({
        // type: 'emergency/seveEventContent',
        type: 'emergency/addFeature',
        payload: fieldsValue,
      }).then(() => {
        // 请求事件信息记录
        this.props.dispatch({
          type: 'emergency/queryEventInfo',
          payload: { eventID: fieldsValue.eventID },
        });
        if (this.props.emergency.current === 5) {
          this.props.dispatch({
            type: 'emergency/getExpandFeature',
            payload: { eventID: fieldsValue.eventID },
          });
        }
        form.resetFields();
      });
    });
  }
  render() {
    const { form, emergency } = this.props;
    return (
      <div className={styles.eventContent}>
        <Row type="flex" >
          <Col md={5} sm={24}>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('featureID')(
                <Input placeholder="事件id" />
              )}
            </FormItem>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="特征分类"
            >
              {form.getFieldDecorator('featureType', {
                rules: [
                  { required: true, message: '特征分类不能为空' },
                ],
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                >
                  {this.props.emergency.classificationList.map(item => (
                    <Option
                      key={item.codeID}
                      value={item.code}
                    >{item.codeName}
                    </Option>
                  ))}
                </Select>

              )}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="发生时间"
            >
              {form.getFieldDecorator('occurTimes', {
                rules: [
                  { required: true, message: '时间不能为空' },
                ],
                initialValue: moment(),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择时间"
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                />
              )}
            </FormItem>
          </Col>
          <Col md={5} sm={24} >
            <FormItem
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label="特征名称"
            >
              {form.getFieldDecorator('eventFeature', {
                rules: [
                  { required: true, message: '事件特征名称不能为空' },
                ],
              })(
                <Input placeholder="请输入事件特征名称" />
              )}
            </FormItem>
          </Col>
          <Col md={5} sm={24} >
            <FormItem
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label="特征值"
            >
              {form.getFieldDecorator('featureValue', {
                rules: [
                  { required: true, message: '事件特征值不能为空' },
                ],
              })(
                <Input placeholder="请输入事件特征值" />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24} >
            <FormItem
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label="描述"
            >
              {form.getFieldDecorator('eventFeatureDes', {
                initialValue: '',
                rules: [
                ],
              })(
                <Input placeholder="请输入事件描述" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={8} offset={8} sm={24} >
            <Button className={styles.eventButton} onClick={this.showModal}>查看特征库</Button>
            <Modal
              title="事件特征"
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              style={{ position: 'absolute', left: 260 }}
              width="60%"
              // bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
            >
              <Row gutter={24} >
                <Col className={styles.search}>
                  <Search
                    style={{ width: 350 }}
                    placeholder="特征名称"
                    enterButton="搜索"
                    onSearch={this.onSearchFeature}
                  />
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                </Col>
              </Row >
              <Table
                pagination={emergency.pagination}
                rowSelection={this.state.rowSelection}
                columns={columns}
                dataSource={emergency.existEventFeaturesList}
                onChange={this.onhandleTableChange}
                rowKey={record => record.featureID}
              />
            </Modal>
            <Button type="primary" className={styles.eventButton} onClick={this.onSend} >提交</Button>
          </Col>
        </Row >
      </div>
    );
  }
}
