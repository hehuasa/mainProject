import React, { PureComponent } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Col, Spin } from 'antd';
import styles from './index.less';
import { constantlyModal } from '../../../services/constantlyModal';

let timer; // 定时器id
export default class DeviceMonitor extends PureComponent {
  state = {
    data: [],
  };
  componentDidMount() {
    const { deviceMonitor, dispatch } = this.props;
    const { ctrlResourceType } = deviceMonitor;
    const option = JSON.parse(this.props.currentFlow.data.graphicsContent);
    dispatch({
      type: 'constantlyData/getDeviceMonitorData',
      payload: { ctrlResourceType },
    }).then(() => {
      if (constantlyModal[ctrlResourceType]) {
        const { data } = constantlyModal[ctrlResourceType];
        // 按照炉号（datacode）分组
        const array = [];
        for (const item of data) {
          // 判断新增还是push
          const index = array.findIndex(value => value.processNumber === item.resResourceInfo.processNumber);
          for (const [key, value] of Object.entries(option.quotas)) {
            if (value === item.dataTypeName) {
              if (index === -1) {
                const obj = {};
                obj[key] = { value: item.value, meterUnit: item.meterUnit, dataTypeName: item.dataTypeName };
                obj.processNumber = item.resResourceInfo.processNumber;
                obj.sort = Number(item.resResourceInfo.resourceCode);
                array.push(obj);
              } else {
                array[index][key] = { value: item.value, meterUnit: item.meterUnit, dataTypeName: item.dataTypeName };
                array[index][key].processNumber = item.resResourceInfo.processNumber;
                array[index][key].sort = Number(item.resResourceInfo.resourceCode);
              }
            }
          }
        }
        array.sort((a, b) => {
          return a.sort - b.sort;
        });
        this.setState({ data: array });
      }
    });
    timer = setInterval(() => {
      dispatch({
        type: 'constantlyData/getDeviceMonitorData',
        payload: { ctrlResourceType },
      }).then(() => {
        if (constantlyModal[ctrlResourceType]) {
          const { data } = constantlyModal[ctrlResourceType];
          // 按照炉号（datacode）分组
          const array = [];
          for (const item of data) {
            // 判断新增还是push
            const index = array.findIndex(value => value.processNumber === item.resResourceInfo.processNumber);
            for (const [key, value] of Object.entries(option.quotas)) {
              if (value === item.dataTypeName) {
                if (index === -1) {
                  const obj = {};
                  obj[key] = { value: item.value, meterUnit: item.meterUnit, dataTypeName: item.dataTypeName };
                  // obj[1] = { value: item.value, meterUnit: item.meterUnit };
                  obj.processNumber = item.resResourceInfo.processNumber;
                  obj.sort = Number(item.resResourceInfo.resourceCode);
                  array.push(obj);
                } else {
                  array[index][key] = { value: item.value, meterUnit: item.meterUnit, dataTypeName: item.dataTypeName };
                  array[index][key].processNumber = item.resResourceInfo.processNumber;
                  array[index][key].sort = Number(item.resResourceInfo.resourceCode);
                }
              }
            }
          }
          array.sort((a, b) => {
            return a.sort - b.sort;
          });
          this.setState({ data: array });
        }
      });
    }, option.spaceTime);
  }
  componentWillUnmount() {
    clearInterval(timer);
  }
  render() {
    const { mapHeight, deviceMonitor } = this.props;
    const { data } = this.state;
    return (
      <div className={styles.warp}>
        <Scrollbars style={{ height: mapHeight }}>
          <div className={styles.deviceType}>{deviceMonitor.devicesName}</div>
          <div className={styles.cardWarp}>
            { data && data.length > 0 ? data.map(item => (
              <Col xs={12} sm={21} md={12} lg={12} xl={12} xxl={8} style={{ textAlign: 'center' }} key={Math.random() * new Date().getTime()}>
                <div className={styles.card} key={item.processNumber}>
                  <div className={styles.title}>{item.processNumber}</div>
                  <div className={styles.text}>
                    { item[0] ? (
                      <div className={item[1] ? styles.quota2 : styles.quota1}>
                        <div className={styles.value}>{parseFloat(Number(item[0].value).toFixed(2))} </div>
                        <div className={styles.units}> {`${item[0].dataTypeName}(${item[0].meterUnit})`}</div>
                      </div>) : null }
                    { item[1] ? (
                      <div className={styles.quota2}>
                        <div className={styles.value}>{parseFloat(Number(item[1].value).toFixed(2))} </div>
                        <div className={styles.units}> {`${item[1].dataTypeName}(${item[1].meterUnit})`}</div>
                      </div>
) : null
                  }
                  </div>

                  <div className={styles.circle}>
                    <div className={styles.content}>
                      {
                      item[2] ? <div className={styles.quota3}>{parseFloat(Number(item[2].value).toFixed(2))}</div> : '无数据'
                    }
                      {
                      item[2] ? <span className={styles.units}>{`${item[2].dataTypeName}(${item[2].meterUnit})`}</span> : '无数据'
                    }

                    </div>
                  </div>
                </div>
              </Col>

          )) : <Spin size="large" /> }
          </div>
        </Scrollbars>
      </div>
    );
  }
}
