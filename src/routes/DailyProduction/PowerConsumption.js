import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import { Table, Select, DatePicker } from 'antd';
import moment from 'moment';
import Waterfall from './chart/Waterfall';
import styles from './index.less';

const { Option } = Select;
@connect(({ productionDaily, loading }) => ({
  powerConsumption: productionDaily.powerConsumption,
  recycledWater: productionDaily.recycledWater,
  loading,
}))
export default class GasBalance extends PureComponent {
  state = {
    powerConsumption: [],
    recycledWater: [],
    scrollX: 0,
    showChart: false,
    record: {},
    dateTimes: null,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求动力消耗
    dispatch({
      type: 'productionDaily/getPowerConsumption',
    }).then(() => {
      this.dealPowerData(this.props.powerConsumption);
      this.getTime(this.props.powerConsumption[0] || {});
    });
    // 请求循环水
    dispatch({
      type: 'productionDaily/getRecycledWater',
    }).then(() => {
      this.dealWaterData(this.props.recycledWater);
    });
  }
  // 将后台传的动力消耗数据处理为表格需要的数据格式
  dealPowerData = (data) => {
    if (!data.length > 0) {
      this.setState({
        powerConsumption: arr,
      });
      return;
    }
    const arr = [];
    const rawName = ['用电量', '发电量', '外购电量', '天然气', '煤', '卸煤', '煤库存'];
    rawName.forEach((title, index) => {
      const temp = data.filter(item => item.proRptPowerConsumeItem.itemName === title);
      const useObj = temp[0] || {};
      const mouthObj = temp[1] || {};
      arr.push({
        itemName: title,
        useCount: useObj.collectValue,
        useUnit: useObj.unit,
        mouthCount: mouthObj.collectValue,
        mouthUnit: mouthObj.unit,
        key: index,
      });
    });
    this.setState({
      powerConsumption: arr,
    });
  };
  // 处理循环水的数据
  dealWaterData = (data) => {
    if (!data.length > 0) {
      this.setState({
        recycledWater: [],
      });
      return;
    }
    const arr = [];
    const rawName = ['一循', '二循', '三循', '污水装置'];
    rawName.forEach((title, index) => {
      const temp = data.filter(item => item.proRptPowerConsumeItem.itemName === title);
      arr.push({
        itemName: title,
        useCount: temp[0] ? temp[0].collectValue : '',
        ph: temp[1] ? temp[1].collectValue : '',
        turbidity: temp[2] ? temp[2].collectValue : '',
        concentration: temp[3] ? temp[3].collectValue : '',
        alkali: temp[4] ? temp[4].collectValue : '',
        calcium: temp[5] ? temp[5].collectValue : '',
        molybdate: temp[6] ? temp[6].collectValue : '',
        key: index,
      });
    });
    this.setState({
      recycledWater: arr,
    });
  };
  // 获取默认时间
  getTime = (data) => {
    this.setState({
      dateTimes: data.startDate,
    });
  };
  // 按时间获取动力消耗信息
  onChange = (date) => {
    const startDate = date.valueOf();
    // 按时间请求动力消耗数据
    this.props.dispatch({
      type: 'productionDaily/getPowerConsumption',
      payload: { startDate },
    }).then(() => {
      this.dealPowerData(this.props.powerConsumption);
      this.getTime(this.props.powerConsumption[0] || {});
    });
    // 按时间获取水循环数据
    this.props.dispatch({
      type: 'productionDaily/getRecycledWater',
      payload: { startDate },
    }).then(() => {
      this.dealWaterData(this.props.recycledWater);
    });
  };
  render() {
    const { showChart, record } = this.state;
    const { title } = this.props;
    const cols = [
      {
        title: '项目',
        dataIndex: 'itemName',
        width: '24%',
      }, {
        title: '用量',
        dataIndex: 'useCount',
        colSpan: 2,
        width: '24%',
      }, {
        title: '单位',
        colSpan: 0,
        dataIndex: 'useUnit',
        width: '14%',
      }, {
        title: '月累计',
        dataIndex: 'mouthCount',
        colSpan: 2,
        width: '24%',
      }, {
        title: '单位',
        colSpan: 0,
        dataIndex: 'mouthUnit',
        width: '14%',
      },
    ];
    const cycleCols = [
      {
        title: '项目',
        dataIndex: 'itemName',
        width: '10%',
      },
      {
        title: '用量(吨/时)',
        dataIndex: 'useCount',
        width: '14%',
      }, {
        title: 'PH值(7.2-9.0)',
        dataIndex: 'ph',
        width: '12%',
      }, {
        title: '浊度(≤10)',
        dataIndex: 'turbidity',
        width: '12%',
      }, {
        title: '浓缩倍数(≥4)',
        dataIndex: 'concentration',
        width: '14%',
      }, {
        title: '碱浓度(100-450)',
        dataIndex: 'alkali',
        width: '12%',
      }, {
        title: '钙硬度(<700)',
        dataIndex: 'calcium',
        width: '12%',
      }, {
        title: '钼酸根(0.8-1.5)',
        dataIndex: 'molybdate',
        width: '14%',
      },
    ];
    return (
      <div className={styles.warp}>
        <div className={styles.title}>
          <div className={styles.left} />
          <div className={styles.text}>{this.props.title}</div>
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
                dataSource={this.state.powerConsumption}
                columns={cols}
                pagination={false}
                loading={this.props.loading.global}
                scroll={{ x: this.state.scrollX }}
                rowClassName={(record, index) => {
                  return index % 2 === 0 ? styles.blue : styles.blueRow;
                }}
                bordered
              />
              <div style={{ marginTop: -1 }}>
                <Table
                  onRow={(item) => {
                    return {
                      onClick: () => this.rawClick(item),
                    };
                  }}
                  dataSource={this.state.recycledWater}
                  columns={cycleCols}
                  pagination={false}
                  loading={this.props.loading.global}
                  rowClassName={(record, index) => {
                  return index % 2 === 0 ? styles.blue : styles.blueRow;
                }}
                  bordered
                />
              </div>
            </Scrollbars>
          </div>
)}
      </div>

    );
  }
}
