import React, { PureComponent } from 'react';
import { Card, Divider, Icon, Carousel } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import styles from './eventInfo.less';

@connect(({ alarmDeal, emergency }) => ({
  alarmDeal,
  emergency,
}))
export default class EventInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      continueTime: null,
    };
  }
  componentDidMount() {
    const { emergency } = this.props;

    // if (emergency.eventId) {
    //   this.props.dispatch({
    //     type: 'alarmDeal/queryEventInfoReport',
    //     payload: {
    //       id: emergency.eventId,
    //     },
    // }).then(() => {
    const { eventInfoReport } = this.props.emergency;
    this.time = setInterval(() => {
      if (Object.keys(this.props.emergency.eventInfoReport).length !== 0) {
        this.props.dispatch({
          type: 'emergency/continueTime',
          payload: this.props.emergency.eventInfoReport,
        })
      }
    }, 5000)
    // });
    // }
  }
  componentWillUnmount() {
    clearInterval(this.time);
  }
  render() {
    const { eventInfoReport } = this.props.emergency;
    // console.log(11, this.props.emergency.infoRecordList)
    // console.log(22, moment(eventInfoReport.eventTime))
    // console.log(33,  moment().moment(eventInfoReport.eventTime))00:15:50

    return (
      <div className={styles.eventInfo}>
        <Card style={{ border: 0 }} bodyStyle={{ padding: '24px 8px' }}>
          <p className={styles.eventTitle}>{eventInfoReport.eventName}</p>
          <p className={styles.responseTitle}>响应时长：<span className={styles.responseTitleColor}>{eventInfoReport.continueTime}</span></p>
          <p className={styles.incidentTitle}>事发时间：{eventInfoReport.eventTime ? moment(eventInfoReport.eventTime).format('YYYY-MM-DD HH:mm:ss') : null}</p>
          <p className={styles.incidentTitle}><Icon type="environment" style={{ margin: '0 3px', color: '#8080f1' }} />{eventInfoReport.eventPlace}</p>
          <div style={{ paddingLeft: 16 }}>
            {
              (eventInfoReport.injured || eventInfoReport.death) ?
                (
                  <div>
                    <em>伤{eventInfoReport.injured}人</em>
                    <em>死{eventInfoReport.death}人</em>
                  </div>
                ) :
                <em>无伤亡人数</em>
            }
          </div>
          <Divider style={{ margin: '16px 0' }} />
          <div className={styles.carouselBox}>
            {
              this.props.emergency.infoRecordList.length < 4 ?
                (
                  this.props.emergency.infoRecordList.map((item, index) => (
                    <div key={`eventInfo${index}`} >{item.recordTime ? moment(item.recordTime).format('YYYY-MM-DD HH:mm:ss') : null}{item.recordContent}</div>
                  ))
                ) :
                (
                  <Carousel autoplay={this.props.emergency.infoRecordList.length > 2 ? true : false} vertical dots={false} >
                    {
                      this.props.emergency.infoRecordList.map((item, index) => (
                        <div key={`eventInfo${index}`} >{item.recordTime ? moment(item.recordTime).format('YYYY-MM-DD HH:mm:ss') : null}{item.recordContent}</div>
                      ))
                    }
                  </Carousel>
                )
            }

          </div>
        </Card>
      </div >
    )
  }
};

