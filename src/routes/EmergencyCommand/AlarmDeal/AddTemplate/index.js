import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Icon, Button, DatePicker, Modal, Table, message } from 'antd';
import moment from 'moment';
import styles from './index.less';

const FormItem = Form.Item;
const Search = Input.Search;
const columns = [{
  title: '用户名字',
  dataIndex: 'userName',
  width: 200,
}, {
  title: '拼音',
  dataIndex: 'queryKey',
  width: 120,
}, {
  title: '性别',
  dataIndex: 'sex',
  width: 100,
}, {
  title: '手机号码',
  dataIndex: 'mobile',
  width: 200,
}, {
  title: '短号',
  dataIndex: 'shortNumber',
  width: 120,
}, {
  title: '电话号码',
  dataIndex: 'phoneNumber',
  width: 120,
}, {
  title: '邮箱',
  dataIndex: 'eMail',
  width: 200,
}, {
  title: '办公地址',
  dataIndex: 'officeAddr',
  width: 200,
}];

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 10 },
};
// const withOutLabel = {
//   wrapperCol: { span: 8, offset: 10 },
// };
const formItemLayout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 8 },
};
// const withOutLabel1 = {
//   wrapperCol: { span: 6, offset: 6 },
// };
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

// let uuid = 0;
@connect(({ emergency }) => ({
  emergency,
  current: emergency.current,
  viewNode: emergency.viewNode,
}))
export default class AddTemplate extends PureComponent {
  state = {
    visible: false,
    sumSnjured: null, // 受伤人数
    sumDeaths: null, // 死亡人数
    selectedRows: [], // 选择的数据
    key: null, // 选择的那个放大镜的input的id
    searchPerson: null, // 查询输入值
    rowSelection: {
      type: 'radio',
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows,
        });
      },
    },
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'emergency/saveSearchPerson',
      payload: {
        result: [],
        pageNum: 1,
        pageSize: 10,
      },
    });
  }
  // componentWillUpdate() {
  // const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
  // const { emergency, isHidden } = this.props;
  // const casualtiesData = this.props.casualtiesData || [];
  // const valueKeys = [0];
  // casualtiesData.map((item, index) => {
  //   if (index !== 0) {
  //     valueKeys.push(index);
  //   }
  // });
  // const keys = getFieldValue('keys');
  // console.log(111, keys, valueKeys)
  // if (keys.length < valueKeys.length) {
  //   setFieldsValue({
  //     keys: valueKeys,
  //   });
  // }
  // }

  // 选择查询
  onSearchUser = (value, key) => {
    this.props.dispatch({
      type: 'emergency/searchPersonInfo',
      payload: { pageNum: 1, pageSize: 10 },
    });
    this.setState({
      visible: true,
      key,
    });
  };
  // 搜索人员
  onSearchPerson = (value) => {
    const params = {
      pageNum: 1,
      pageSize: 10,
      isQuery: true,
      fuzzy: true,
      userName: value,
    };
    this.props.dispatch({
      type: 'emergency/searchPersonInfo',
      payload: params,
    });
    this.setState({
      searchPerson: value,
    });
  };
  // 确认
  onHandleOk = () => {
    const row = this.state.selectedRows;
    if (row.length > 0) {
      const { form } = this.props;
      const name = {};
      name[`reportUserName[${this.state.key}]`] = row[0].userName;
      name[`reportUserPhone[${this.state.key}]`] = row[0].mobile;
      name[`reportUserId[${this.state.key}]`] = row[0].userID;
      form.setFieldsValue(name);
      this.setState({
        visible: false,
      });
    } else {
      message.info('请选择一条数据');
    }
  };
  // 关闭
  onHandleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };
  // 下一页
  onhandleTableChange = (pagination, filtersArg, sorter) => {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      isQuery: true,
      fuzzy: false,
      userName: this.state.searchPerson,
    };
    this.props.dispatch({
      type: 'emergency/searchPersonInfo',
      payload: params,
    });
  };

  remove = (k) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(keys[keys.length - 1] + 1);
    // uuid += 1;
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  // 计算受伤人数
  onChangeInjured = (e) => {
    if (Number(e.target.value) || Number(e.target.value) === 0) {
      const { form } = this.props;
      const injured = form.getFieldsValue().injured;
      const str = e.target.id;
      const index = Number(str.slice(str.indexOf('[') + 1, str.indexOf(']')));
      let sumSnjured = 0;
      injured.map((item, i) => {
        if (index === i) {
          sumSnjured += Number(e.target.value);
        } else if (Number(item)) {
          sumSnjured += Number(item);
        }
      });
      this.setState({
        sumSnjured,
      });
    }
  }
  // 计算死亡人数
  onChangeDeath = (e) => {
    if (Number(e.target.value) || Number(e.target.value) === 0) {
      const { form } = this.props;
      const deaths = form.getFieldsValue().deaths;
      const str = e.target.id;
      const index = Number(str.slice(str.indexOf('[') + 1, str.indexOf(']')));
      let sumDeaths = 0;
      deaths.map((item, i) => {
        if (index === i) {
          sumDeaths += Number(e.target.value);
        } else if (Number(item)) {
          sumDeaths += Number(item);
        }
      });
      this.setState({
        sumDeaths,
      });
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    const { emergency, isHidden, isDisabled } = this.props;
    const casualtiesData = this.props.casualtiesData || [];
    const valueKeys = [0];
    let injuredSum = 0;
    let deathSum = 0;
    casualtiesData.map((item, index) => {
      if (index !== 0) {
        valueKeys.push(index);
      }
      if (!isNaN(Number(item.injured))) {
        injuredSum += Number(item.injured);
      }
      if (!isNaN(Number(item.death))) {
        deathSum += Number(item.death);
      }
    });

    getFieldDecorator('keys', { initialValue: valueKeys });
    const keys = getFieldValue('keys');

    const formItems = keys.map((k, index) => {
      return (
        <Row type="flex" key={k}>
          {getFieldDecorator(`ID[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            initialValue: casualtiesData[index] ? casualtiesData[index].casualtyID : null,
          })(
            <Input
              disabled={isDisabled ? (!!casualtiesData[index]) : false}
              type="hidden"
              placeholder="已有数据id"
            />
          )}
          <Col span={5}>
            <FormItem
              formItemLayout
              label="伤亡位置"
              required={false}
            >
              {getFieldDecorator(`location[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? casualtiesData[index].postion : null,
              })(
                <Input disabled={isDisabled ? (!!casualtiesData[index]) : false} placeholder="请输入位置" />
              )}
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem
              formItemLayout1
              label="受伤人数"
              required={false}
            >
              {getFieldDecorator(`injured[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? casualtiesData[index].injured : null,
                rules: [
                  { pattern: /^[0-9]*$/, message: '只能为数字' },
                ],
              })(
                <Input
                  disabled={isDisabled ? (!!casualtiesData[index]) : false}
                  placeholder="数量"
                  onChange={this.onChangeInjured}
                />
              )}
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem
              formItemLayout1
              label="死亡人数"
              required={false}
            >
              {getFieldDecorator(`deaths[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? casualtiesData[index].death : null,
                rules: [{ pattern: /^[0-9]*$/, message: '只能为数字' }],
              })(
                <Input
                  disabled={isDisabled ? (!!casualtiesData[index]) : false}
                  placeholder="数量"
                  onChange={this.onChangeDeath}
                />
              )}
            </FormItem>
          </Col>
          {getFieldDecorator(`reportUserId[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            initialValue: casualtiesData[index] ? casualtiesData[index].reportUserId : null,
          })(
            <Input
              disabled={isDisabled ? (!!casualtiesData[index]) : false}
              type="hidden"
              placeholder="选择报告人"
            />
          )}
          {getFieldDecorator(`reportUserName[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            initialValue: casualtiesData[index] ? casualtiesData[index].reportUserName : null,
          })(
            <Input
              disabled={isDisabled ? (!!casualtiesData[index]) : false}
              type="hidden"
              placeholder="选择报告人"
            />
          )}
          <Col span={3}>
            <FormItem
              formItemLayout1
              label="报告人"
              required={false}
            >
              {getFieldDecorator(`reportUserName[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? casualtiesData[index].reportUserName : null,
              })(
                <Search
                  disabled={isDisabled ? (!!casualtiesData[index]) : false}
                  placeholder="选择报告人"
                  onSearch={value => this.onSearchUser(value, k)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem
              formItemLayout1
              label="电话"
              required={false}
            >
              {getFieldDecorator(`reportUserPhone[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? casualtiesData[index].reportUserPhone : null,
              })(
                <Input placeholder="报告人电话" disabled />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              formItemLayout1
              label="时间"
              required={false}
              style={{ width: '100%' }}
            >
              {getFieldDecorator(`recordTime[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: casualtiesData[index] ? moment(moment(casualtiesData[index].recordTime), 'YYYY-MM-DD HH:mm:ss') : '',
              })(
                <DatePicker
                  disabled={isDisabled ? (!!casualtiesData[index]) : false}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择记录时间"
                />
              )}
            </FormItem>
          </Col>
          <Col md={1}>
            {
              !isDisabled ?
                (
                  keys.length > 1 && index !== 0 ? (
                    <Icon
                      title="删除"
                      type="minus-circle-o"
                      onClick={() => this.remove(k)}
                      disabled={keys.length === 1}
                      style={{ fontSize: 18, marginTop: 10, cursor: 'pointer' }}
                    />
                  ) : null
                ) :
                (casualtiesData[index] ? null :
                  (
                    keys.length > 1 && index !== 0 ? (
                      <Icon
                        title="删除"
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                        disabled={keys.length === 1}
                        style={{ fontSize: 18, marginTop: 10, cursor: 'pointer' }}
                      />
                    ) : null
                  )
                )
            }
          </Col>
        </Row>
      );
    });

    return (
      <div className={styles.alarmDeal}>
        <Form onSubmit={this.handleSubmit}>
          {
            isHidden ? (
              <Row>
                <Col span={5}>
                  总共受伤：{this.state.sumSnjured || injuredSum} {' '}总共死亡：{this.state.sumDeaths || deathSum}
                </Col>
              </Row>
            ) : null
          }
          <div className={styles.tableListForm}>
            {formItems}
          </div>
          <FormItem {...formItemLayoutWithOutLabel}>
            { this.props.hiddenAddButton ? null : (
              <Button
                type="dashed"
                onClick={this.add}
                disabled={this.props.current !== this.props.viewNode}
                style={{ width: '60%' }}
              >
                <Icon type="plus" /> 新增伤亡人员
              </Button>
            )
            }
          </FormItem>
        </Form>
        <Modal
          title="选择人员"
          visible={this.state.visible}
          onOk={this.onHandleOk}
          onCancel={this.onHandleCancel}
          style={{ position: 'absolute', left: 260 }}
          width="60%"
          bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
          zIndex="1003"
        >
          <Row gutter={24}>
            <Col className={styles.search}>
              <Search
                style={{ width: 350, marginBottom: 16 }}
                placeholder="请输入名字"
                enterButton="搜索"
                onSearch={this.onSearchPerson}
              />
            </Col>
          </Row>
          <Table
            pagination={emergency.personPagination}
            rowSelection={this.state.rowSelection}
            columns={columns}
            dataSource={emergency.personList}
            onChange={this.onhandleTableChange}
            scroll={{ x: 800, y: 600 }}
          />
        </Modal>
      </div>
    );
  }
}
