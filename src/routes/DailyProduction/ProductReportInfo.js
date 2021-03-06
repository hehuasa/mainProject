import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Select, Col, Table, DatePicker } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import styles from './index.less';

const { Option } = Select;
@connect(({ productionDaily }) => ({
  productionStatus: productionDaily.productionStatus,
}))
export default class GasBalance extends PureComponent {
  state = {
    dateTimes: null,
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'productionDaily/getProductionStatus',
    }).then(() => {
      this.getStartTime(this.props.productionStatus);
    });
  }
  // 按时间获取装置信息
  onChange = (date) => {
    const startDate = date.valueOf();
    this.props.dispatch({
      type: 'productionDaily/getProductionStatus',
      payload: { startDate },
    });
  };
  // 获取制表时间
  getStartTime = (dataArr) => {
    if (dataArr && dataArr.length > 0) {
      this.setState({ dateTimes: dataArr[0].reportDate });
    }
  };
  render() {
    return (
      <div className={styles.warp}>
        <div className={styles.title}>
          <div className={styles.left} />
          <div className={styles.text}>{`${this.props.title}`}</div>
          <div className={styles.left} />
        </div>
        <div className={styles.dataSource}>数据来源: 生产日报导入</div>
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
            <div className={styles.productInfo}>

              <div>
                <Row type="flex">
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noRightBorder} ${styles.noBottomBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[0] ? this.props.productionStatus[0].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noRightBorder} ${styles.noBottomBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[1] ? this.props.productionStatus[1].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noRightBorder} ${styles.noBottomBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[2] ? this.props.productionStatus[2].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noBottomBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[3] ? this.props.productionStatus[3].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                </Row>
                <Row type="flex">
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noRightBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[4] ? this.props.productionStatus[4].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                  <Col span={6}>
                    <div
                      className={`${styles.tdContent} ${styles.noRightBorder}`}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[5] ? this.props.productionStatus[5].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                  <Col span={12}>
                    <div
                      className={styles.tdContent}
                      dangerouslySetInnerHTML={{ __html: this.props.productionStatus[6] ? this.props.productionStatus[6].reportInfo.split('\n').join('<br>').split(' ').join('&nbsp;') : '' }}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  }
}
