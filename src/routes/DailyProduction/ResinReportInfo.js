import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Scrollbars from 'react-custom-scrollbars';
import { Table, Select, Row, Col, DatePicker } from 'antd';
import Progress from '../../components/Progress/Progress';
import { bgColor, progressColor } from './color/color';
import ResinReportInfoTrend from './chart/ResinReportInfoTrend';
import styles from './index.less';

const { Option } = Select;
@connect(({ productionDaily }) => ({
  resinProduct: productionDaily.resinProduct,
  solidDefects: productionDaily.solidDefects,
}))
export default class DissociationInfo extends PureComponent {
  state = {
    dateTimes: null,
    showChart: false,
    sortIndex: 0,
    chartName: '',
  };
  componentDidMount() {
    // 请求树脂产品
    this.props.dispatch({
      type: 'productionDaily/getResinProduct',
    }).then(() => {
      this.getStartTime(this.props.resinProduct);
      // 请求固体残次品
      this.props.dispatch({
        type: 'productionDaily/getSolidDefects',
      }).then(() => {
        this.props.dispatch({
          type: 'productionDaily/saveResinProduct',
          payload: [...this.props.resinProduct, ...this.props.solidDefects],
        });
      });
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.setState({
      dateTimes: startDate,
    });
    this.props.dispatch({
      type: 'productionDaily/getResinProduct',
      payload: { startDate },
    }).then(() => {
      this.getStartTime(this.props.resinProduct);
      // 请求固体残次平
      this.props.dispatch({
        type: 'productionDaily/getSolidDefects',
        payload: { startDate },
      }).then(() => {
        this.props.dispatch({
          type: 'productionDaily/saveResinProduct',
          payload: [...this.props.resinProduct, ...this.props.solidDefects],
        });
      });
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
    const renderContent = (value, row, index) => {
      const obj = {
        children: value || '/',
        props: {},
      };
      if (index === this.props.resinProduct.length - 1) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    const cols = [
      {
        title: '产品名称',
        dataIndex: 'resinName',
        width: '15%',
        render: (text, record, index) => {
          return text ? (
            <a
              href="#"
              title="点击查看图表"
              className={styles.rawName}
              onClick={() => this.rawClick(record)}
            >{text}
            </a>
          ) : '/';
          // if (index < this.props.resinProduct.length - 1) {
          //   return text;
          // }
          // return {
          //   children: this.props.solidDefects[0] ? this.props.solidDefects[0].info : '',
          //   props: {
          //     colSpan: 8,
          //   },
          // };
        },
      }, {
        title: '罐存',
        dataIndex: 'factoryStockCount',
        width: '10%',
        render: renderContent,
      }, {
        title: '厂内库存率',
        dataIndex: 'facotryStockPre',
        width: '15%',
        render: (text, record, index) => {
          return {
            children: text === null ?
              '/' : (
                <Row gutter={16}>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <Progress percent={Number(text)} bgColor={bgColor} progressColor={progressColor} />
                  </Col>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <span>{`${text} %`}</span>
                  </Col>
                </Row>
              ),
            props: {
              colSpan: index === this.props.resinProduct.length - 1 ? 0 : 1,
            },
          };
        },
      }, {
        title: '日入库',
        dataIndex: 'dayInStock',
        width: '10%',
        render: renderContent,
      }, {
        title: '日出厂',
        dataIndex: 'dayOutStock',
        width: '10%',
        render: renderContent,
      }, {
        title: '月出厂计划',
        dataIndex: 'monthOutPlan',
        width: '10%',
        render: renderContent,
      }, {
        title: '月累计出厂',
        dataIndex: 'monthOutCount',
        width: '15%',
        render: renderContent,
      }, {
        title: '月出厂进度',
        dataIndex: 'mouthOutPre',
        width: '15%',
        render: (text, record, index) => {
          return {
            children: text === null ?
              '/' : (
                <Row gutter={16}>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <Progress percent={Number(text)} bgColor={bgColor} progressColor={progressColor} />
                  </Col>
                  <Col span={Number(text) > 120 ? 24 : 12}>
                    <span>{`${text} %`}</span>
                  </Col>
                </Row>
              ),
            props: {
              colSpan: index === this.props.resinProduct.length - 1 ? 0 : 1,
            },
          };
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
        {showChart ? (
          <ResinReportInfoTrend
            click={this.rawClick}
            sortIndex={sortIndex}
            name={chartName}
            dateTimes={dateTimes}
          />
) : (
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
              dataSource={this.props.resinProduct}
              columns={cols}
              rowKey={record => record.organicProductInfoID}
              pagination={false}
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
