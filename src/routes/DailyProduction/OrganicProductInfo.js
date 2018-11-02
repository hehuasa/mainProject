import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Scrollbars from 'react-custom-scrollbars';
import { Table, Select, Row, Col, DatePicker } from 'antd';
import Progress from '../../components/Progress/Progress';
import OrganicProductInfoTrend from './chart/OrganicProductInfoTrend';
import { bgColor, progressColor } from './color/color';
import styles from './index.less';

const { Option } = Select;
@connect(({ productionDaily }) => ({
  organicProduct: productionDaily.organicProduct,
}))
export default class DissociationInfo extends PureComponent {
  state = {
    dateTimes: null,
    showChart: false,
    sortIndex: 0,
    chartName: '',
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'productionDaily/getOrganicProduct',
    }).then(() => {
      this.getStartTime(this.props.organicProduct);
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.setState({
      dateTimes: startDate,
    });
    this.props.dispatch({
      type: 'productionDaily/getOrganicProduct',
      payload: { startDate },
    });
  };
  // 点击行
  rawClick = (record) => {
    this.setState({
      showChart: !this.state.showChart,
      sortIndex: record.sortIndex,
      chartName: record.organicProductInfoName,
      dateTimes: record.startDate,
    });
  };
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr && dataArr.length > 0) {
      this.setState({ dateTimes: dataArr[0].startDate });
    }
  };
  render() {
    const cols = [
      {
        title: '有机产品',
        dataIndex: 'organicProductInfoName',
        width: '15%',
        render: (text, record) => {
          return text ? (
            <a
              href="#"
              title="点击查看图表"
              className={styles.rawName}
              onClick={() => this.rawClick(record)}
            >{text}
            </a>
          ) : '/';
        },
      }, {
        title: '罐存',
        dataIndex: 'trunkCount',
        width: '10%',
        render: (text) => {
          return text || '/';
        },
      }, {
        title: '罐存率',
        dataIndex: 'trunckCountPre',
        width: '15%',
        render: (text, record) => {
          return text === null ?
            '/' : (
              <Row gutter={16}>
                <Col span={Number(text) > 120 ? 24 : 12}>
                  <Progress percent={Number(text)} bgColor={bgColor} progressColor={progressColor} />
                </Col>
                <Col span={Number(text) > 120 ? 24 : 12}>
                  <span>{`${text} %`}</span>
                </Col>
              </Row>
            );
        },
      }, {
        title: '月出厂计划',
        dataIndex: 'monthOutPlan',
        width: '15%',
        render: (text) => {
          return text || '/';
        },
      }, {
        title: '日出厂量',
        dataIndex: 'dayOutCount',
        width: '10%',
        render: (text) => {
          return text || '/';
        },
      }, {
        title: '月累计出厂',
        dataIndex: 'monthOutCount',
        width: '15%',
        render: (text) => {
          return text || '/';
        },
      }, {
        title: '月出厂进度',
        dataIndex: 'monthOutPre',
        width: '15%',
        render: (text, record) => {
          return text === null ?
            '/' : (
              <Row gutter={16}>
                <Col span={Number(text) > 120 ? 24 : 12}>
                  <Progress percent={Number(text)} bgColor={bgColor} progressColor={progressColor} />
                </Col>
                <Col span={Number(text) > 120 ? 24 : 12}>
                  <span>{`${text} %`}</span>
                </Col>
              </Row>
            );
        },
      },
    ];
    const { showChart, sortIndex, chartName, dateTimes } = this.state;
    return (
      <div className={styles.warp}>
        <div className={styles.title}>
          <div className={styles.left} />
          <div className={styles.text}>{`${this.props.title}（吨）`}</div>
          <div className={styles.left} />
        </div>
        <div className={styles.dataSource}>数据来源: 生产日报导入</div>
        { showChart ? <OrganicProductInfoTrend click={this.rawClick} sortIndex={sortIndex} name={chartName} dateTimes={dateTimes} /> :
        <div className={styles.content}>
          <div className={styles.timeArea}>
            <div className={styles.creatTime}>制表时间:
              <DatePicker
                value={this.state.dateTimes ? moment(this.state.dateTimes) : moment()}
                allowClear={false}
                onChange={this.onChange}
              />
            </div>
          </div>
          <Scrollbars>
            <Table
              dataSource={this.props.organicProduct}
              columns={cols}
              rowKey={record => record.organicProductInfoID}
              pagination={false}
              rowClassName={(record, index) => {
              return index % 2 === 0 ? styles.blue : styles.blueRow;
            }}
              bordered
            />
          </Scrollbars>
        </div> }
      </div>
    );
  }
}
