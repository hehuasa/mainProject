import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Scrollbars from 'react-custom-scrollbars';
import { Table, Select, Card, DatePicker } from 'antd';
import { fakeData } from './List/lib/data.js';
import styles from './index.less';

const { Option } = Select;
@connect(({ productionDaily }) => ({
  solidDefects: productionDaily.solidDefects,
}))
export default class DissociationInfo extends PureComponent {
  state = {
    dateTimes: null,
    showChart: false,
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'productionDaily/getSolidDefects',
    });
  }
  // 按时间获取列表信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.props.dispatch({
      type: 'productionDaily/getSolidDefects',
      payload: { startDate },
    });
  };
  // 点击行
  rawClick = (record) => {
    console.log(123, record);
  };
  render() {
    const { showChart } = this.state;
    const cols = [
      {
        title: '信息',
        dataIndex: 'info',
        width: '100%',
        render: (text) => {
          return text || '/';
        },
      },
    ];
    return (
      <div className={styles.warp}>
        <div className={styles.title}>
          <div className={styles.left} />
          <div className={styles.text}>{`${this.props.title}`}</div>
          <div className={styles.left} />
        </div>
        <div className={styles.content}>
          <div className={styles.timeArea}>
            <div className={styles.creatTime}>制表时间:
              <DatePicker
                defaultValue={this.state.dateTimes ? moment(this.state.dateTimes) : moment()}
                allowClear={false}
                onChange={this.onChange}
              />
            </div>
          </div>
          <Scrollbars>
            <Table
              onRow={(record) => {
              return {
                onClick: () => this.rawClick(record),
              };
            }}
              dataSource={this.props.solidDefects}
              columns={cols}
              rowKey={record => record.rawInfoID}
              pagination={false}
              rowClassName={(record, index) => {
              return index % 2 === 0 ? styles.blue : styles.blueRow;
            }}
              bordered
            />
          </Scrollbars>
        </div>
      </div>
    );
  }
}
