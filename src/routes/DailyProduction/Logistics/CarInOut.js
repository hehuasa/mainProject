import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { Table, Select, Row, Col, DatePicker } from 'antd';
import Trend from '../chart/Trend';
import { fakeData } from '../List/lib/data.js';
import { bgColor, progressColor } from '../color/color';
import styles from '../index.less';
import Progress from '../../../components/Progress/Progress';

const { Option } = Select;
@connect(({ productionDaily }) => ({
  carInOut: productionDaily.carInOut,
  timeUsePre: productionDaily.timeUsePre,
}))
export default class EquipmentProductInfo extends PureComponent {
  state = {
    showChart: false,
    sortIndex: '',
    chartName: '',
    dateTimes: null,
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'productionDaily/getCarInOut',
      // payload: { sampleType: '原料' },
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.props.dispatch({
      type: 'productionDaily/getTimeUsePre',
      payload: { startDate },
    });
    this.props.dispatch({
      type: 'productionDaily/getDeviceProduction',
      payload: { startDate },
    }).then(() => {
      this.dealData(this.props.deviceProduction);
    });
  };
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr && dataArr.length > 0) {
      this.setState({ dateTimes: dataArr[0].startDate });
    }
  };
  // 点击行
  rawClick = (record) => {
    this.setState({
      showChart: !this.state.showChart,
      sortIndex: record.sortIndex,
      chartName: record.rawName,
      dateTimes: record.startDate,
    });
  };
    renderView = (props) => {
      props.style.right = 100;
      return (
        <div {...props} />
      );
    };
    render() {
      const { showChart, sortIndex, chartName, dateTimes } = this.state;
      const cols = [
        { title: '状态',
          dataIndex: 'state',
          width: 80,
        }, { title: '运行状态',
          dataIndex: 'runState',
          width: 100,
        }, { title: '排队号',
          dataIndex: 'oueuingNumbe',
          width: 100,
        }, { title: '卡/单号',
          dataIndex: 'oderNumber',
          width: 100,
        }, { title: '产品名称',
          dataIndex: 'productName',
          width: 200,
        }, { title: '前车牌号',
          dataIndex: 'frontCarNumber',
          width: 100,
        }, { title: '车辆类型',
          dataIndex: 'carType',
          width: 100,
        }, { title: '进出类别',
          dataIndex: 'inOutType',
          width: 100,
        }, { title: '驾驶员姓名',
          dataIndex: 'driverName',
          width: 110,
        }, { title: '驾驶员身份证',
          dataIndex: 'driverIDCard',
          width: 180,
        }, { title: '联系手机',
          dataIndex: 'mobile',
          width: 120,
        }, { title: '领取防火罩时间',
          dataIndex: 'receaveFlashHider',
          width: 160,
        }, { title: '通知进厂时间',
          dataIndex: 'notifyInFatoryTime',
          width: 160,
        }, { title: '车位',
          dataIndex: 'parkingLot',
          width: 100,
        }, { title: '进厂门岗',
          dataIndex: 'inFatoryDoor',
          width: 100,
        }, { title: '进厂时间',
          dataIndex: 'inFatoryTime',
          width: 160,
        }, { title: '发货时间',
          dataIndex: 'deliveryTime',
          width: 160,
        }, { title: '出厂门岗',
          dataIndex: 'outFatoryDoor',
          width: 100,
        }, { title: '出厂时间',
          dataIndex: 'outFatoryTime',
          width: 160,
        },
      ];
      return (
        <div className={styles.warp}>
          <div className={styles.title}>
            <div className={styles.left} />
            <div className={styles.text}>车辆实时进出厂监控</div>
            <div className={styles.left} />
          </div>
          { showChart ? <Trend click={this.rawClick} sortIndex={sortIndex} name={chartName} dateTimes={dateTimes} /> : (
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
              <Scrollbars >
                <Table
                  dataSource={fakeData[0].limisRawMaterial}
                  columns={cols}
                  pagination={false}
                  rowClassName={(record, index) => {
                    return index % 2 === 0 ? styles.blue : styles.blueRow;
                        }}
                  bordered
                  scroll={{ x: 2290 }}
                />
              </Scrollbars>
            </div>
        ) }
        </div>
      );
    }
}
