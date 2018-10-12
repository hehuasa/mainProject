import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { Table, Select, DatePicker } from 'antd';
import Waterfall from './chart/Waterfall';
import styles from './index.less';

const cols = [
  { title: '蒸汽等级', dataIndex: 'itemName', width: 110 },
  { title: '热电联产外送量', dataIndex: 'hotElectricity', width: 150 },
  { title: '减温减压器(转换输入)', dataIndex: 'desuperheatInput', width: 180 },
  { title: '减温减压器(转换输出)', dataIndex: 'desuperheatOut', width: 180 },
  { title: '乙烯及裂解汽油加氢', dataIndex: 'ethylene', width: 180 },
  { title: 'C5', dataIndex: 'carbon', width: 80 },
  { title: 'EO/EG', dataIndex: 'eoeg', width: 100 },
  { title: '丁二烯', dataIndex: 'butadiene', width: 100 },
  { title: '芳烃抽提', dataIndex: 'aromatics', width: 120 },
  { title: 'MTBE/丁烯-1', dataIndex: 'mtbe', width: 160 },
  { title: 'HDPE', dataIndex: 'hdpe', width: 100 },
  { title: 'LLDPE', dataIndex: 'lldpe', width: 100 },
  { title: 'STPP/JPP', dataIndex: 'stpp', width: 120 },
  { title: '一循/三循', dataIndex: 'recycle', width: 120 },
  { title: '空分', dataIndex: 'air', width: 80 },
  { title: '鲁华', dataIndex: 'luhua', width: 80 },
  { title: '其他', dataIndex: 'other', width: 80 },
  { title: '平衡差量', dataIndex: 'balance', width: 100 },
];
@connect(({ productionDaily, loading }) => ({
  steamBalance: productionDaily.steamBalance,
  loading,
}))
export default class SteamBalance extends PureComponent {
  state = {
    dataSource: [],
    scrollX: 2080,
    showChart: false,
    record: {},
    dateTimes: null,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求动力消耗
    dispatch({
      type: 'productionDaily/getSteamBalance',
    }).then(() => {
      this.dealData(this.props.steamBalance);
      this.getStartTime(this.props.steamBalance.superPressure || []);
    });
  }
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr && dataArr.length > 0) {
      this.setState({ dateTimes: dataArr[0].startDate });
    }
  };
  // 处理表格数据
  dealData = (data) => {
    if (!data.superPressure.length > 0) {
      this.setState({
        dataSource: [],
      });
      return;
    }
    const rawName = [
      { property: '超高压蒸汽', value: 'superPressure' },
      { property: '高压蒸汽', value: 'highPressure' },
      { property: '中压蒸汽', value: 'mediumPressure' },
      { property: '低压蒸汽', value: 'lowPressure' },
    ];
    const arr = [];
    rawName.forEach((item, index) => {
      arr.push({
        key: index,
        itemName: item.property,
        hotElectricity: data[item.value][0].collectValue || '/',
        desuperheatInput: data[item.value][1].collectValue || '/',
        desuperheatOut: data[item.value][2].collectValue || '/',
        ethylene: data[item.value][3].collectValue || '/',
        carbon: data[item.value][4].collectValue || '/',
        eoeg: data[item.value][5].collectValue || '/',
        butadiene: data[item.value][6].collectValue || '/',
        aromatics: data[item.value][7].collectValue || '/',
        mtbe: data[item.value][8].collectValue || '/',
        hdpe: data[item.value][9].collectValue || '/',
        lldpe: data[item.value][10].collectValue || '/',
        stpp: data[item.value][11].collectValue || '/',
        recycle: data[item.value][12].collectValue || '/',
        air: data[item.value][13].collectValue || '/',
        luhua: data[item.value][14].collectValue || '/',
        other: data[item.value][15].collectValue || '/',
        balance: data[item.value][16].collectValue || '/',
      });
    });
    this.setState({
      dataSource: arr,
    });
  };
  // 按时间获取蒸汽平衡消耗信息
  onChange = (date) => {
    const startDate = date.valueOf();
    // 按时间请求蒸汽平衡数据
    this.props.dispatch({
      type: 'productionDaily/getSteamBalance',
      payload: { startDate },
    }).then(() => {
      this.dealData(this.props.steamBalance);
      this.getStartTime(this.props.steamBalance.superPressure || []);
    });
  };
  // 点击行
  rawClick = (record) => {
    this.setState({
      showChart: !this.state.showChart,
      record,
    });
  };
  render() {
    const { showChart, record } = this.state;
    const { title } = this.props;
    return (
      <div className={styles.warp}>
        <div className={styles.title}>
          <div className={styles.left} />
          <div className={styles.text}>全厂蒸汽平衡表（吨/时）</div>
          <div className={styles.left} />
        </div>
        {showChart ? <Waterfall title={title} data={record} click={this.rawClick} /> : (
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
                onRow={(item) => {
                return {
                  onClick: () => this.rawClick(item),
                };
              }}
                dataSource={this.state.dataSource}
                columns={cols}
                pagination={false}
                loading={this.props.loading.global}
                scroll={{ x: this.state.scrollX }}
                rowClassName={(record, index) => {
                  return index % 2 === 0 ? styles.blue : styles.blueRow;
                }}
                bordered
              />
            </Scrollbars>
          </div>
)}
      </div>

    );
  }
}
