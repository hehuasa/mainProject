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
  takeCargoList: productionDaily.takeCargoList,
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
      type: 'productionDaily/getTakeCargoList',
      payload: 0,
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.props.dispatch({
      type: 'productionDaily/getTakeCargoList',
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
        { title: '类型',
          dataIndex: 'billType',
          width: 100,
        }, { title: '发货时间',
          dataIndex: 'sendTime',
          width: 180,
          render: value => (value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''),
        }, { title: '产品名称',
          dataIndex: 'productName',
          width: 160,
        }, { title: '实发量',
          dataIndex: 'actualCount',
          width: 100,
        }, { title: '计划量',
          dataIndex: 'planCount',
          width: 100,
        }, { title: '车船号',
          dataIndex: 'carNumber',
          width: 100,
        }, { title: '企业库位',
          dataIndex: 'enterprisePostion',
          width: 140,
        }, { title: '运输方式',
          dataIndex: 'transportType',
          width: 100,
        }, { title: '操作人',
          dataIndex: 'operator',
          width: 100,
        }, { title: '送达方',
          dataIndex: 'deliverTo',
          width: 160,
        }, { title: '出厂部门',
          dataIndex: 'outFactoryDept',
          width: 140,
        }, { title: '售达方',
          dataIndex: 'saleTo',
          width: 160,
        }, { title: '卡单备注',
          dataIndex: 'cardBillRemark',
          width: 140,
        }, { title: '进出类型',
          dataIndex: 'inOutType',
          width: 100,
        },
      ];
      return (
        <div className={styles.warp}>
          <div className={styles.title}>
            <div className={styles.left} />
            <div className={styles.text}>实时提货列表清单</div>
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
                  dataSource={this.props.takeCargoList}
                  columns={cols}
                  pagination={false}
                  rowClassName={(record, index) => {
                    return index % 2 === 0 ? styles.blue : styles.blueRow;
                        }}
                  bordered
                  scroll={{ x: 1780, y: 540 }}
                />
              </Scrollbars>
            </div>
        ) }
        </div>
      );
    }
}
