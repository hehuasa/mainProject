import React, { PureComponent } from 'react';
import { Form, TreeSelect, Row, Col, Input, message, Icon } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { alarmStatus } from '../../../../utils/utils';
import CommonQuery from '../../../../components/GlobalHeader/CommonQuery';

import styles from './index.less';

// const { TabPane } = Tabs;
const FormItem = Form.Item;
const { TextArea, Search } = Input;
const TreeNode = TreeSelect.TreeNode;

let selectedData = null; // 选择事发设备的一行的值
let selectedVal = null; // 选择事件物质的一行的值
let title = null; // 标题
let searchValue = null; // 子页面的默认文本
let whether = true; // 是否运行查询


@connect(({ alarmDeal }) => ({
  alarmDeal,
}))
export default class AlarmEventInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      clickWhether: null, // 点击的放大镜的id
      rowSelection: {
        type: 'radio',
        onChange: (selectedKeys, row) => {
          if (this.state.clickWhether === 2) {
            selectedData = row[0];
          } else if (this.state.clickWhether === 3) {
            selectedVal = row[0];
          } else if (this.state.clickWhether === 1) {
            selectedVal = row[0];
          }
        },
      },
    };
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'alarmDeal/getApparatus',
    });
    // 每次打开清空上次选择
    selectedData = null;
  }
  onShowModal = (value, id) => {
    const { alarmInfo } = this.props.alarmDeal;
    switch (id) {
      case 1:
        // if (err) return;
        const fieldsValue = this.props.form.getFieldsValue(['probeResourceID1']).probeResourceID1;
        title = '监测器具';
        whether = true;
        searchValue = fieldsValue;
        if (alarmInfo) {
          this.props.dispatch({
            type: 'alarmDeal/getResourceQueryPage',
            payload: {
              pageNum: 1,
              pageSize: 10,
              resourceName: fieldsValue,
            },
          }).then(() => {
            this.setState({
              visible: true,
              clickWhether: id,
            });
          });
        } else {
          this.setState({
            visible: true,
            clickWhether: id,
          });
        }
        break;
      case 2:
        title = '事发设备';
        whether = true;
        searchValue = null;
        if (alarmInfo && alarmInfo.resourceId !== 0) {
          this.props.dispatch({
            type: 'alarmDeal/getMonitorResourceObj',
            payload: {
              resourceID: alarmInfo.resourceId,
            },
          }).then(() => {
            this.setState({
              visible: true,
              clickWhether: id,
            });
          });
        } else {
          this.setState({
            visible: true,
            clickWhether: id,
          });
        }
        break;
      case 3:
        title = '事件物质';
        whether = false;
        const resourceIDs = [];
        if (alarmInfo) {
          resourceIDs.push(alarmInfo.resourceId);
        }
        if (selectedData) {
          resourceIDs.push(selectedData.resourceID);
        }
        if (resourceIDs.length > 0) {
          this.props.dispatch({
            type: 'alarmDeal/getByResourceIDs',
            payload: {
              resourceIDs,
            },
          }).then(() => {
            this.setState({
              visible: true,
              clickWhether: id,
            });
          });
        } else {
          this.setState({
            visible: true,
            clickWhether: id,
          });
        }
        break;
      default:
        break;
    }
    // this.setState({
    //   visible: true,
    //   clickWhether: id,
    // });
  }

  onHandleOk = (e) => {
    const { form, dispatch } = this.props;

    if (this.state.clickWhether === 2) {
      if (!selectedData) {
        return message.info('请选择一条数据');
      }
      form.setFieldsValue({
        resourceID: selectedData.resourceID,
        resourceID1: selectedData.resourceName,
      });
    } else if (this.state.clickWhether === 3) {
      if (!selectedVal) {
        return message.info('请选择一条数据');
      }
      form.setFieldsValue({
        rawMaterialIds: selectedVal.rawMaterialID,
        rawMaterialIds1: selectedVal.rawMaterialName,
      });
    } else if (this.state.clickWhether === 1) {
      if (!selectedVal) {
        return message.info('请选择一条数据');
      }
      selectedData = selectedVal;
      form.setFieldsValue({
        probeResourceID: selectedVal.resourceID,
        probeResourceID1: selectedVal.resourceName,
      });
    }

    this.setState({
      visible: false,
    });
    dispatch({
      type: 'alarmDeal/resetSearchList',
    });
  }

  onHandleCancel = (e) => {
    this.setState({
      visible: false,
    });
    this.props.dispatch({
      type: 'alarmDeal/resetSearchList',
    });
  }
  // 循环获取数据
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.orgnizationName} key={item.orgID} value={`${item.orgID}`} >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.orgnizationName} key={item.orgID} value={`${item.orgID}`} />;
    });
  }

  render() {
    const { form, alarmInfoConten, isEvent } = this.props;
    const { alarmInfo, apparatusList } = this.props.alarmDeal;
    // const { alarmInfoConten.alarmExtendAlarmInfoVO, alarmInfoConten.monitorResourceInfoVO } = alarmInfoConten;
    form.getFieldDecorator('eventName', {
      initialValue: alarmInfo.eventName,
    });
    const alarmEventInfoData = {};
    return (
      <div className={styles.alarmDeal}>
        <Row type="flex" >
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('probeResourceID', {
                initialValue: alarmInfoConten.monitorResourceInfoVO ? alarmInfoConten.monitorResourceInfoVO.resourceID : null,
              })(
                <Input placeholder="请输入监测器具" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('resourceID', {
                initialValue: alarmInfoConten.resourceInfoVO ? alarmInfoConten.resourceInfoVO.resourceID : null,
              })(
                <Input placeholder="请输入事发设备" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 0 }}
            >
              {form.getFieldDecorator('rawMaterialIds', {
                initialValue: alarmInfoConten.rawMaterialInfoVO ? alarmInfoConten.rawMaterialInfoVO.rawMaterialID : null,
              })(
                <Input placeholder="请输入事件物质" />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发位置"
            >
              {form.getFieldDecorator('eventPlace', {
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.place : null,
                rules: [
                  { required: !!isEvent, message: '事发位置必填' },
                ],
              })(
                <Input disabled={!isEvent} placeholder="请输入事发位置" />
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
                initialValue: ((alarmInfoConten.alarmWay === 1) ? '自动报警' : '人工报警') +
                  (alarmInfoConten.org ? `${alarmInfoConten.org.orgnizationName}` : '') +
                  moment().format('YYYY-MM-DD HH:mm'),
                rules: [
                  { required: isEvent, message: '事件名称不能为空' },
                ],
              })(
                <Input disabled={!isEvent} placeholder="请输入事件名称" />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发部门"
            >
              {form.getFieldDecorator('orgID', {
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? `${alarmInfoConten.alarmExtendAlarmInfoVO.alarmOrgID || ''}` : '', // alarmInfo.orgName
                rules: [
                  { required: isEvent, message: '事发部门不能为空' },
                ],
              })(
                <TreeSelect
                  // value={1145}
                  disabled={!isEvent}
                  showSearch
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择事发部门"
                  allowClear
                  treeDefaultExpandAll
                >
                  {this.renderTreeNodes(apparatusList)}
                </TreeSelect>
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
                initialValue: alarmInfoConten.monitorResourceInfoVO ? alarmInfoConten.monitorResourceInfoVO.resourceName : null,
                rules: [
                  { required: isEvent, message: '监测器具不能为空' },
                ],
              })(
                <Input
                  disabled
                  addonAfter={<Icon type="search" onClick={() => this.onShowModal('', 1)} />}
                  placeholder="请输入监测器具"
                />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事发设备"
            >
              {form.getFieldDecorator('resourceID1', {
                initialValue: alarmInfoConten.resourceInfoVO ? alarmInfoConten.resourceInfoVO.resourceName : null,
                rules: [
                  { required: isEvent, message: '事发设备不能为空' },
                ],
              })(
                <Input
                  disabled
                  addonAfter={<Icon type="search" onClick={() => this.onShowModal('', 2)} />}
                  placeholder="请输入事发设备"
                />
              )}
            </FormItem>
          </Col>
          {
            selectedData && selectedData.installPosition ? (
              <Col md={12} sm={24}>
                <FormItem
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 15 }}
                  label="设备位置"
                >
                  <Input
                    disabled
                    value={selectedData ? selectedData.installPosition : ''}
                  />
                </FormItem>
              </Col>
            ) : null
          }
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="事件物质"
            >
              {form.getFieldDecorator('rawMaterialIds1', {
                initialValue: alarmInfoConten.rawMaterialInfoVO ? alarmInfoConten.rawMaterialInfoVO.rawMaterialName : null,
                rules: [
                ],
              })(
                <Input
                  disabled
                  addonAfter={<Icon type="search" onClick={() => this.onShowModal('', 3)} />}
                  placeholder="请输入事件物质"
                />
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
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.incidentReason : null,
                rules: [
                ],
              })(
                <Input disabled={!isEvent} placeholder="请输入事发原因" />
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
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.alarmStatuInfo : null,
                rules: [
                ],
              })(
                <Input disabled={!isEvent} placeholder="请输入报警现状" />
              )}
            </FormItem>
          </Col>
          {
            alarmInfoConten.alarmExtendAlarmInfoVO ?
              (alarmInfoConten.alarmExtendAlarmInfoVO.alarmUserName) ? (
                <Col md={12} sm={24}>
                  <FormItem
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                    label="报警人"
                  >
                    {form.getFieldDecorator('alarmPerson', {
                      initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.alarmUserName : null,
                      rules: [
                      ],
                    })(
                      <Input disabled={!isEvent} placeholder="请输入报警人" />
                    )}
                  </FormItem>
                </Col>
) : null
              : null
          }
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 15 }}
              label="联系电话"
            >
              {form.getFieldDecorator('telPhone', {
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.alarmUserPhone : null,
                rules: [
                  { pattern: /^[0-9]*$/, message: '只能为数字' },
                ],
              })(
                <Input disabled={!isEvent} placeholder="请输入联系电话" />
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
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.accidentPostion : null,
              })(
                <Input disabled={!isEvent} placeholder="请输入事发部位" />
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
                initialValue: alarmInfoConten.alarmDes,
                rules: [
                ],
              })(
                <TextArea disabled={!isEvent} rows={3} placeholder="请输入警情摘要" />
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
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.adoptMeasure : null,
                rules: [
                ],
              })(
                <TextArea disabled={!isEvent} rows={3} placeholder="请输入已采取措施" />
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
                initialValue: alarmInfoConten.alarmExtendAlarmInfoVO ? alarmInfoConten.alarmExtendAlarmInfoVO.extendAlarmDes : null,
                rules: [
                ],
              })(
                <TextArea rows={3} placeholder="请输入处警说明" />
              )}
            </FormItem>
          </Col>
        </Row>
        <CommonQuery
          {...this.state}
          dispatch={this.props.dispatch}
          alarmDeal={this.props.alarmDeal}
          onHandleOk={this.onHandleOk}
          onHandleCancel={this.onHandleCancel}
          title={title}
          searchValue={searchValue}
          whether={whether}
        />
      </div>
    );
  }
}
