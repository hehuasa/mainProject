import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { Table, Select, DatePicker } from 'antd';
import Waterfall from './chart/Waterfall';
import styles from './index.less';

const cols = [
  { title: '空分', dataIndex: 'air', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: '污水处理', dataIndex: 'wasteWaterDeal', width: 100, render: (value) => { return value === null ? '/' : value; } },
  { title: '乙烯装置', dataIndex: 'ethylene', width: 100, render: (value) => { return value === null ? '/' : value; } },
  { title: '裂解汽油加氢', dataIndex: 'pyrolysis', width: 120, render: (value) => { return value === null ? '/' : value; } },
  { title: 'C5', dataIndex: 'carbon', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: '原料中间罐区', dataIndex: 'rawMaterial', width: 120, render: (value) => { return value === null ? '/' : value; } },
  { title: 'EO/EG', dataIndex: 'eoeg', width: 100, render: (value) => { return value === null ? '/' : value; } },
  { title: '丁二烯', dataIndex: 'butadiene', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: '芳烃抽提', dataIndex: 'aromatics', width: 100, render: (value) => { return value === null ? '/' : value; } },
  { title: 'MTBE/丁烯-1', dataIndex: 'mtbe', width: 120, render: (value) => { return value === null ? '/' : value; } },
  { title: 'HDPE', dataIndex: 'hdpe', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: 'LLDPE', dataIndex: 'lldpe', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: 'STPP', dataIndex: 'stpp', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: 'JPP', dataIndex: 'jpp', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: '产品罐区', dataIndex: 'product', width: 100, render: (value) => { return value === null ? '/' : value; } },
  { title: '鲁华', dataIndex: 'luhua', width: 80, render: (value) => { return value === null ? '/' : value; } },
  { title: '平衡差量', dataIndex: 'balance', width: 100, render: (value) => { return value === null ? '/' : value; } },
];
@connect(({ productionDaily, loading }) => ({
  wasteWater: productionDaily.wasteWater,
  loading,
}))
export default class WastWaterBalance extends PureComponent {
  state = {
    dataSource: [],
    scrollX: 1600,
    showChart: false,
    record: {},
    dateTimes: null,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求动力消耗
    dispatch({
      type: 'productionDaily/getWasteWater',
    }).then(() => {
      this.dealData(this.props.wasteWater);
      this.getStartTime(this.props.wasteWater);
    });
  }
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr.sewage && dataArr.sewage.length > 0) {
      this.setState({ dateTimes: dataArr.sewage[0].startDate });
    }
  };
  // 处理表格数据
  dealData = (data) => {
    if (!data.sewage.length > 0) {
      this.setState({
        dataSource: [],
      });
      return;
    }
    const rawName = [
      { property: '生产污水', value: 'sewage' },
      { property: '低压氮气', value: 'lowNitrogen' },
    ];
    const arr = [];
    rawName.forEach((item, index) => {
      const temp = data[item.value];
      arr.push({
        key: index,
        itemName: item.property,
        air: temp[0].collectValue, // 空分
        wasteWaterDeal: temp[1].collectValue, // 污水处理
        ethylene: temp[2].collectValue, // 乙烯装置
        pyrolysis: temp[3].collectValue, // 裂解汽油加烃
        carbon: temp[4].collectValue, // C5
        rawMaterial: temp[5].collectValue, // 原料中间罐区
        eoeg: temp[6].collectValue, // EO/EG
        butadiene: temp[7].collectValue, // 丁二烯
        aromatics: temp[8].collectValue, // 芳烃抽提
        mtbe: temp[9].collectValue, // MTBE/丁烯-1
        hdpe: temp[10].collectValue, // HDPE
        lldpe: temp[11].collectValue, // LLDPE
        stpp: temp[12].collectValue, // STPP
        jpp: temp[13].collectValue, // JPP
        product: temp[14].collectValue, // 产品罐区
        luhua: temp[15].collectValue, // 鲁华
        balance: temp[16].collectValue, // 平衡差量
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
      type: 'productionDaily/getWasteWater',
      payload: { startDate },
    }).then(() => {
      this.dealData(this.props.wasteWater);
      this.getStartTime(this.props.wasteWater);
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
          <div className={styles.text}>全厂生产污水（吨/时）和氮气（立方米/时）平衡表</div>
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
