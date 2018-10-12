import React, { PureComponent } from 'react';
import { Chart, Axis, Geom, Tooltip, Legend, Guide } from 'bizcharts';
import moment from 'moment';
import { searchByAttr } from '../../../../../utils/MapService';

const { Line } = Guide;

// formatter: value => (moment(parseFloat(value)).format('YYYY-MM-DD HH:mm:ss')), // 格式化文本内容

export default class CommonLineChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      g2Chart: null,
    };
  }

  onClickSetMap = (ev) => {
    const stringItem = ev.item.value;
    const gISCode = stringItem.slice(stringItem.lastIndexOf('&') + 1);
    const { mapView } = this.props;
    searchByAttr({ searchText: gISCode, searchFields: ['ObjCode'] }).then(
      (res) => {
        if (res.length > 0) {
          mapView.goTo({ center: res[0].feature.geometry, scale: 7000 }).then(() => {
            this.props.dispatch({
              type: 'resourceTree/selectByGISCode',
              payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode },
            });
          });
        }
      }
    );
  };

  render() {
    const { allDv, targetCheckedList, constantlyConditionCalc } = this.props;

    return (
      allDv.map((item, index) => {
        const conditionCalc = [];
        if (constantlyConditionCalc[targetCheckedList[index]]) {
          constantlyConditionCalc[targetCheckedList[index]].conditionCalc.map((leaguer) => {
            if (leaguer.range.length > 0) {
              conditionCalc.push(leaguer.range[0].start);
              conditionCalc.push(leaguer.range[0].end);
            }
          });
        }
        const conditionItem = [...new Set(conditionCalc)];
        const cols = {
          month: {
            range: [0, 1],
          },
          temperature: {
            min: constantlyConditionCalc[targetCheckedList[index]] ? constantlyConditionCalc[targetCheckedList[index]].minValue : 0,
            max: constantlyConditionCalc[targetCheckedList[index]] ? constantlyConditionCalc[targetCheckedList[index]].maxValue : 0,
          },
        };
        const quotaName = constantlyConditionCalc[targetCheckedList[index]] ? constantlyConditionCalc[targetCheckedList[index]].quotaName : '';
        return (
          <div style={{ height: 400, marginBottom: 20 }} key={`line${index + 1}`}>
            <div>{quotaName}</div>
            <Chart
              height={400}
              data={item}
              scale={cols}
              forceFit
              onGetG2Instance={(g2Chart) => {
                g2Chart.animate(false);
                this.state.g2Chart = g2Chart;
              }}
              onPlotClick={(ev) => {
                const point = {
                  x: ev.x,
                  y: ev.y,
                };
                const items = this.state.g2Chart.getTooltipItems(point);
                if (!items) {
                  return null;
                }
                // this.handClick(items[0]);
              }}
              onTooltipChange={(ev) => {
                for (const item of ev.items) {
                  item.name = `${moment(parseFloat(item.point._origin.month)).format('YYYY-MM-DD HH:mm:ss')}</br>${item.name.slice(item.name.indexOf('&') + 1)}`;
                }
              }}

            >
              <Legend
                itemFormatter={(text) => {
                  return text.slice(text.indexOf('&') + 1);
                }}
                selectedMode="single"
                onClick={(ev) => {
                  this.onClickSetMap(ev);
                }}
              />
              <Axis
                name="month"
                label={{
                formatter: val => moment(parseFloat(val)).format('HH:mm:ss'),
              }}
              />
              <Axis name="temperature" />
              <Tooltip crosshairs={{ type: 'y' }} showTitle={false} />
              <Geom
                type="line"
                position="month*temperature"
                size={2}
                color="city"
                shape="smooth"
              />
              <Geom type="point" position="month*temperature" size={3} shape="circle" color="city" />
              <Guide>
                {
                  conditionItem.map((value) => {
                    return (
                      <Line
                        start={['min', value]}
                        end={['max', value]}
                        text={{
                          content: `阈值为${value}`,
                          position: 'end',
                          style: {
                            textAlign: 'end',
                            fill: '#333', // 文本颜色
                          },
                        }}
                        lineStyle={{
                          stroke: '#ffb4b4', // 线的颜色
                          lineDash: [0, 2, 2], // 虚线的设置
                          lineWidth: 3, // 线的宽度
                        }}
                      />
                    );
                  })
                }
              </Guide>
            </Chart>
          </div>
        );
      })
    );
  }
}

// label={{ formatter: val => moment(val).format('HH:mm:ss') }}

// {/* <Line start={['min', 30]}
//   end={['max', 30]} text={{
//     content: '阈值最小值为30',
//     position: 'end',
//     style: {
//       textAlign: 'end',
//       fill: '#333', // 文本颜色
//     }
//   }}
//   lineStyle={{
//     stroke: '#00ff00', // 线的颜色
//     lineDash: [0, 2, 2], // 虚线的设置
//     lineWidth: 3 // 线的宽度
//   }}
// /> */}
// <Line start={['min', 80]}
//   end={['max', 80]} text={{
//     content: '阈值最大值为80',
//     position: 'end',
//     autoRotate: false,
//     style: {
//       textAlign: 'end',
//       fill: '#333', // 文本颜色
//     }
//   }}
//   lineStyle={{
//     stroke: '#ff0000', // 线的颜色
//     lineDash: [0, 2, 2], // 虚线的设置
//     lineWidth: 3 // 线的宽度
//   }}
// />
