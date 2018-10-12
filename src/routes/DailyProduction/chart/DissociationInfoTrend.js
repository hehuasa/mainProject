import React, { PureComponent } from 'react';
import { Button, Card } from 'antd';
import moment from 'moment';
import { Chart, Axis, Geom, Tooltip, Legend } from 'bizcharts';
import { connect } from 'dva';
import { DataSet } from '@antv/data-set';
import { textColor, lineColor1, lineColor2 } from '../color/color';
import styles from './index.less';

const cotTitle = 'COT（℃）';
const loadValueTitle = '负荷（t/h）';

const cols = {
  date: {
    alias: '日期',
    range: [0, 1],
    tickCount: 6,
  },
};
const transData = (data, type) => {
  const newData = [];
  let key;
  if (type === 0) {
    key = loadValueTitle;
    for (const item of data) {
      item.dateFormat = moment(item.startDate).format('l');
      item[loadValueTitle] = item.loadValue;
      newData.sort((a, b) => {
        return a.startDate - b.startDate;
      });
    }
  } else {
    key = cotTitle;
    for (const item of data) {
      item.dateFormat = moment(item.startDate).format('l');
      item[cotTitle] = item.cot;
      newData.sort((a, b) => {
        return a.startDate - b.startDate;
      });
    }
  }

  const ds = new DataSet();
  const dv = ds.createView().source(data);
  dv.transform({
    type: 'fold',
    fields: [key], // 展开字段集
    key: 'date', // key字段
    value: 'value', // value字段
  });
  return dv;
};

@connect(({ productionDaily, homepage }) => {
  return {
    history: productionDaily.history,
    height: homepage.mapHeight,
  };
})
export default class DissociationInfoTrend extends PureComponent {
  componentDidMount() {
    const { dispatch, sortIndex, dateTimes } = this.props;
    dispatch({
      type: 'productionDaily/getDissociationHistoryData',
      payload: { sortIndex, date: dateTimes },
    });
  }
  render() {
    const { history, name, height, dateTimes, click } = this.props;
    const chartHeight = Number(height) / 2 - 100;
    const newData0 = transData(history, 0);
    const newData1 = transData(history, 1);
    return (
      <div className={styles.warp}>
        <Card title={name}>
          <Chart
            padding={['auto', 50, 'auto', 'auto']}
            height={chartHeight}
            data={newData0}
            scale={cols}
            forceFit
          >
            <Legend />
            <Axis
              name="dateFormat"
              title={{ position: 'end',
                                textStyle: {
                                    fontSize: '16',
                                    textAlign: 'right',
                                    fill: '#fff',
                                    rotate: 0,
                                },
                            }}
            />
            <Tooltip crosshairs={{ type: 'y' }} />
            <Axis
              title={{ position: 'end',
                                textStyle: {
                                    fontSize: '16',
                                    textAlign: 'right',
                                    fill: '#fff',
                                    rotate: 0,
                                },
                            }}
              name="value"
              line={{
                                lineWidth: 1, // 设置线的宽度
                                stroke: textColor, // 设置线的颜色
                            }}
              grid={{
                                type: 'line', // 网格的类型
                                lineStyle: {
                                    lineWidth: 0.1,
                                    stroke: '#333', // 网格线的颜色
                                } }}
            />
            <Geom
              type="line"
              position="dateFormat*value"
              size={2}
              color={['date', [lineColor1, lineColor2]]}
            />
            <Geom
              type="point"
              position="dateFormat*value"
              size={4}
              shape="circle"
              color={['date', [lineColor1, lineColor2]]}
              tooltip={null}
            />
          </Chart>
          <Chart
            padding={['auto', 50, 'auto', 'auto']}
            height={chartHeight}
            data={newData1}
            scale={cols}
            forceFit
          >
            <Legend />
            <Axis
              name="dateFormat"
              title={{ position: 'end',
                textStyle: {
                  fontSize: '16',
                  textAlign: 'right',
                  fill: '#fff',
                  rotate: 0,
                },
              }}
            />
            <Tooltip crosshairs={{ type: 'y' }} />
            <Axis
              title={{ position: 'end',
                textStyle: {
                  fontSize: '16',
                  textAlign: 'right',
                  fill: '#fff',
                  rotate: 0,
                },
              }}
              name="value"
              line={{
                lineWidth: 1, // 设置线的宽度
                stroke: textColor, // 设置线的颜色
              }}
              grid={{
                type: 'line', // 网格的类型
                lineStyle: {
                  lineWidth: 0.1,
                  stroke: '#333', // 网格线的颜色
                } }}
            />
            <Geom
              type="line"
              position="dateFormat*value"
              size={2}
              color={['date', [lineColor1, lineColor2]]}
            />
            <Geom
              type="point"
              position="dateFormat*value"
              size={4}
              shape="circle"
              color={['date', [lineColor1, lineColor2]]}
              tooltip={null}
            />
          </Chart>
          <div className={styles.footer}>
            <Button onClick={() => click({ startDate: dateTimes })}>关闭</Button>
          </div>
        </Card>
      </div>
    );
  }
}

