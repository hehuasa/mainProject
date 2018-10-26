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
@connect(({ userList, typeCode, organization, productionDaily }) => ({
  userList,
  typeCode,
  organization,
  limisRawMaterial: productionDaily.limisRawMaterial,
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
    // 时间进度
    this.props.dispatch({
      type: 'productionDaily/getTimeUsePre',
      payload: { startDate: moment() },
    });
    this.props.dispatch({
      type: 'productionDaily/getLimisReportData',
      payload: { sampleType: '原料' },
    }).then(() => {
      console.log(999, this.props.limisRawMaterial);
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
      const renderContent = (value, rowSpan, colSpan) => {
        const obj = {
          children: value,
          props: {},
        };
        obj.props.rowSpan = rowSpan === undefined ? 1 : rowSpan;
        obj.props.colSpan = colSpan === undefined ? 1 : colSpan;
        return obj;
      };
      const cols = [
        {
          title: '原料名称',
          dataIndex: 'sampleName',
          width: 100,
          render: (value, row) => renderContent(value, row.sampleRowSpan),
        }, {
          title: '分析项目',
          dataIndex: 'item',
          colSpan: 2,
          width: 140,
          render: (value, row) => {
            if (row.item === null) {
              return renderContent(row.name, row.itemRowSpan, 2);
            } else {
              return renderContent(value, row.itemRowSpan);
            }
          },
        }, {
          title: '项目值',
          dataIndex: 'name',
          colSpan: 0,
          width: 100,
          render: (value, row) => {
            if (row.item === null) {
              return renderContent(value, 1, 0);
            } else {
              return renderContent(value);
            }
          },
        }, {
          title: '控制指标',
          dataIndex: 'mplDesc',
          width: 80,
        }, {
          title: '罐号/批号',
          dataIndex: 'samplingPoint',
          width: 80,
          render: (value, row) => renderContent(value, row.sampleRowSpan),
        }, {
          title: '实测值',
          dataIndex: 'text',
          width: 80,
        },
      ];
      return (
        <div className={styles.warp}>
          <div className={styles.title}>
            <div className={styles.left} />
            <div className={styles.text}>原材料质量情况</div>
            <div className={styles.left} />
          </div>
          { showChart ? <Trend click={this.rawClick} sortIndex={sortIndex} name={chartName} dateTimes={dateTimes} /> : (
            <div className={styles.content}>
              <div className={styles.timeArea}>
                <div className={styles.timeProcess}>时间进度: {this.props.timeUsePre ? `${this.props.timeUsePre} %` : '' }</div>
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
                  scroll={{ x: 580 }}
                />
              </Scrollbars>
            </div>
        ) }
        </div>
      );
    }
}
