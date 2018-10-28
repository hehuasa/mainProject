import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { connect } from 'dva';
import { alarmStatus } from '../../../../utils/utils';
import styles from './InfoContent.less';

const { TextArea } = Input;
const { Option } = Select;
const FormItem = Form.Item;

@connect(({ alarmDeal, emergency, alarm }) => ({
  alarmDeal,
  eventID: emergency.eventId,
  emergency,
  alarm,
}))
export default class HandAlarmDeal extends PureComponent {
  // componentDidMount() {
  //   const {  eventID } = this.props;
  //   this.props.dispatch({
  //     type: 'emergency/queryEventInfoReport',
  //     payload: {
  //       id: eventID,
  //     },
  //   })
  // }

  render() {
    const { form } = this.props;
    const { eventInfoReport } = this.props.emergency;

    return (
      <div className={styles.alarmDeal}>
        <Row type="flex" >
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('probeResource', {
                initialValue: eventInfoReport.probeResource ? eventInfoReport.probeResource.resourceID : null,
              })(
                <Input placeholder="监测器具" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('resResourceInfo', {
                initialValue: eventInfoReport.resResourceInfo ? eventInfoReport.resResourceInfo.resourceID : null,
              })(
                <Input placeholder="事发设备" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('rawMaterialIds', {
                initialValue: eventInfoReport.resRawMaterialInfos && eventInfoReport.resRawMaterialInfos[0] ? eventInfoReport.resRawMaterialInfos[0].rawMaterialID : null,
              })(
                <Input placeholder="事件物质" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('organization', {
                initialValue: eventInfoReport.organization ? eventInfoReport.organization.orgID : null,
              })(
                <Input placeholder="事发部门" />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事件名称"
            >
              {form.getFieldDecorator('eventName', {
                initialValue: eventInfoReport.eventName,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
            />
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发位置"
            >
              {form.getFieldDecorator('place', {
                initialValue: eventInfoReport.eventPlace,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="报警类型"
            >
              {form.getFieldDecorator('alarmTypeId', {
                initialValue: eventInfoReport.alarmTypeId,
              })(
                <Select disabled style={{ width: '100%' }} >
                  {
                    this.props.alarm.alarmTypeList.map(item => (
                      <Option value={item.alarmTypeID}>{item.alarmTypeName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发部门"
            >
              {form.getFieldDecorator('organization1', {
                initialValue: eventInfoReport.organization ? eventInfoReport.organization.orgnizationName : null,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="监测器具"
            >
              {form.getFieldDecorator('probeResourceID1', {
                initialValue: eventInfoReport.probeResource ? eventInfoReport.probeResource.resourceName : null,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发设备"
            >
              {form.getFieldDecorator('resResourceInfo1', {
                initialValue: eventInfoReport.resResourceInfo ? eventInfoReport.resResourceInfo.resourceName : null,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="设备位置"
            >
              {form.getFieldDecorator('installPosition', {
                initialValue: eventInfoReport.installPosition,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事件物质"
            >
              {form.getFieldDecorator('rawMaterialIds1', {
                initialValue: eventInfoReport.resRawMaterialInfos && eventInfoReport.resRawMaterialInfos[0] ? eventInfoReport.resRawMaterialInfos[0].rawMaterialName : null,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发原因"
            >
              {form.getFieldDecorator('incidentReason', {
                initialValue: eventInfoReport.incidentReason,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="报警现状"
            >
              {form.getFieldDecorator('alarmStatuInfo', {
                initialValue: alarmStatus(eventInfoReport.alarmStatuInfo),
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="报警人"
            >
              {form.getFieldDecorator('acceptAlarmUserID ', {
                initialValue: eventInfoReport.alarmPerson,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="联系电话"
            >
              {form.getFieldDecorator('telPhone', {
                initialValue: eventInfoReport.telPhone,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发部位"
            >
              {form.getFieldDecorator('accidentPostion', {
                initialValue: eventInfoReport.accidentPostion,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="警情摘要"
            >
              {form.getFieldDecorator('alarmDes', {
                initialValue: eventInfoReport.alarmDes,
              })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="已采取措施"
            >
              {form.getFieldDecorator('adoptMeasure', {
                initialValue: eventInfoReport.adoptMeasure,
              })(
                <TextArea rows={3} disabled />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="处警说明"
            >
              {form.getFieldDecorator('extendAlarmDes', {
                initialValue: eventInfoReport.extendAlarmDes,
              })(
                <TextArea rows={3} disabled />
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
