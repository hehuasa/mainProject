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
  materialInFactory: productionDaily.materialInFactory,
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
      type: 'productionDaily/getMaterialInFactory',
      payload: 0,
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.props.dispatch({
      type: 'productionDaily/getMaterialInFactory',
      payload: startDate,
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
        { title: '发运量',
          dataIndex: 'sendCount',
          width: 100,
        }, { title: '计划量',
          dataIndex: 'planCount',
          width: 100,
        }, { title: '车船号',
          dataIndex: 'carNumber',
          width: 100,
        }, { title: '售达方',
          dataIndex: 'saleto',
          width: 160,
        }, { title: '送达方',
          dataIndex: 'deliverTo',
          width: 160,
        }, { title: '运输方式',
          dataIndex: 'transportType',
          width: 100,
        }, { title: '企业产品等级',
          dataIndex: 'productLevel',
          width: 120,
        }, { title: '提货开始时间',
          dataIndex: 'startTakeTime',
          width: 180,
          render: value => (value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''),
        }, { title: '提货截至时间',
          dataIndex: 'endTakeTime',
          render: value => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '',
          width: 180,
        }, { title: '制单人',
          dataIndex: 'makeBillUser',
          width: 100,
        }, { title: '操作人',
          dataIndex: 'operatorName',
          width: 100,
        }, { title: '订单类型',
          dataIndex: 'orderType',
          width: 100,
        },
      ];
      return (
        <div className={styles.warp}>
          <div className={styles.title}>
            <div className={styles.left} />
            <div className={styles.text}>实时物资进厂列表</div>
            <div className={styles.left} />
          </div>
          <div className={styles.dataSource}>数据来源: 物流系统</div>
          { showChart ? <Trend click={this.rawClick} sortIndex={sortIndex} name={chartName} dateTimes={dateTimes} /> : (
            <div className={styles.content}>
              <div className={styles.timeArea}>
                <div className={styles.creatTime}>制表时间:
                  <DatePicker
                    defaultValue={moment(moment().subtract(1, 'days').valueOf())}
                    allowClear={false}
                    onChange={this.onChange}
                  />
                </div>
              </div>
              <Scrollbars >
                <Table
                  dataSource={this.props.materialInFactory}
                  columns={cols}
                  pagination={false}
                  rowClassName={(record, index) => {
                    return index % 2 === 0 ? styles.blue : styles.blueRow;
                        }}
                  bordered
                  scroll={{ x: 1500, y: 540 }}
                />
              </Scrollbars>
            </div>
        ) }
        </div>
      );
    }
}
