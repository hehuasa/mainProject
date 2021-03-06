import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { Table, Select, Row, Col, DatePicker } from 'antd';
import Trend from './chart/Trend';
import { fakeData } from './List/lib/data.js';
import { bgColor, progressColor } from './color/color';
import styles from './index.less';
import Progress from '../../components/Progress/Progress';

const { Option } = Select;
@connect(({ userList, typeCode, organization, productionDaily }) => ({
  userList,
  typeCode,
  organization,
  deviceProduction: productionDaily.deviceProduction,
  timeUsePre: productionDaily.timeUsePre,
}))
export default class EquipmentProductInfo extends PureComponent {
  state = {
    equipmentList: [], // 装置列表
    data: [],
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
      type: 'productionDaily/getDeviceProduction',
    }).then(() => {
      // this.getEquipmentList(this.props.deviceProduction);
      this.dealData(this.props.deviceProduction);
      this.getStartTime(this.props.deviceProduction);
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
  // 获取所有装置
  getEquipmentList = (data) => {
    const arr = [];
    data.forEach((obj) => {
      if (!arr.filter(item => item.equipmentName === obj.equipmentName).length > 0) {
        arr.push(obj);
      }
    });
    this.setState({
      equipmentList: arr,
    });
  };
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr && dataArr.length > 0) {
      this.setState({ dateTimes: dataArr[0].startDate });
    }
  };
  // 处理行合并
  dealData = (data) => {
    const arr = [];
    data.forEach((obj) => {
      // 装置合并行rowSpan
      if (arr.filter(item => item.equipmentName === obj.equipmentName).length > 0) {
        obj.equipmentRowSpan = 0;
      } else {
        const a = data.filter(equip => equip.equipmentName === obj.equipmentName);
        obj.equipmentRowSpan = a.length;
      }
      // 合并投入产出行
      if (arr.filter(item => item.equipmentName === obj.equipmentName && item.inOutType === obj.inOutType).length > 0) {
        obj.inOutTypeRowSpan = 0;
      } else {
        obj.inOutTypeRowSpan = data.filter(equip => equip.equipmentName === obj.equipmentName && equip.inOutType === obj.inOutType).length;
      }
      arr.push(obj);
    });
    this.setState({
      data: arr,
    });
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
  // 按装置查看数据
  equipmentChange = (value) => {
    const data = fakeData[0].zhuangzhi;
    if (value === '') {
      this.dealData(data);
    } else {
      this.dealData(data.filter(item => item.equipmentName === value));
    }
  };
    renderView = (props) => {
      props.style.right = 100;
      return (
        <div {...props} />
      );
    }
    render() {
      const { showChart, sortIndex, chartName, dateTimes } = this.state;
      const cols = [
        {
          title: '装置名称',
          dataIndex: 'equipmentName',
          width: '10%',
          render: (value, row) => {
            const obj = {
              children: <span className={styles.rowTitle}>{value}</span>,
              props: {},
            };
            obj.props.rowSpan = row.equipmentRowSpan;
            return obj;
          },
        },
        {
          title: '投入/产出',
          dataIndex: 'inOutType',
          width: '12%',
          render: (value, row) => {
            const obj = {
              children: <span className={styles.rowTitle}>{value}</span>,
              props: {},
            };
            obj.props.rowSpan = row.inOutTypeRowSpan;
            return obj;
          },
        },
        { title: '物料',
          dataIndex: 'rawName',
          width: '10%',
          render: (text, record) => {
            return (
              <a
                href="#"
                title="点击查看图表"
                className={styles.rawName}
                onClick={() => this.rawClick(record)}
              >{text}
              </a>
            );
          },
        },
        { title: '月计划',
          dataIndex: 'monthPlan',
          width: '10%',
          render: (text) => {
            return text || '/';
          },
        },
        { title: '日完成',
          dataIndex: 'dayOver',
          width: '10%',
          render: (text) => {
            return text || '/';
          },
        },
        { title: '月完成',
          dataIndex: 'monthOver',
          width: '10%',
          render: (text) => {
            return text || '/';
          },
        },
        { title: '收率%',
          dataIndex: 'yieldPre',
          width: '10%',
          render: (text) => {
            return text || '/';
          },
        },
        { title: '月进度',
          dataIndex: 'monthPre',
          width: '28%',
          render: (text) => {
            return text === null ?
              '/' : (
                <Row gutter={16}>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <Progress percent={Number(text)} bgColor={bgColor} progressColor={progressColor} />
                  </Col>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <span style={{ color: this.props.timeUsePre < text ? '' : 'red' }}>{`${text} %`}</span>
                  </Col>
                </Row>
              );
          },
        },
      ];
      return (
        <div className={styles.warp}>
          <div className={styles.title}>
            <div className={styles.left} />
            <div className={styles.text}>各装置生产情况（吨）</div>
            <div className={styles.left} />
          </div>
          <div className={styles.dataSource}>数据来源: 生产日报导入</div>
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
                  dataSource={this.state.data}
                  columns={cols}
                  pagination={false}
                  rowClassName={(record, index) => {
                            return record.inOutType === '投入' ? index % 2 === 0 ? styles.blue : styles.blueRow : index % 2 === 0 ? styles.gray : styles.grayRow;
                        }}
                  bordered
                />
              </Scrollbars>
            </div>
        ) }
        </div>
      );
    }
}
