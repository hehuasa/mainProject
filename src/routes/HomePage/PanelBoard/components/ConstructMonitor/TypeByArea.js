import React, { PureComponent } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import { searchByAttr } from '../../../../../utils/mapService';
import LeftTitle from "../../LeftTitle/LeftTitle";

const getCols = (length) => {
  const obj = {};
  if (length < 5 && length > 0) {
    obj.tickInterval = 1;
  }
  return { count: obj };
};
export default class ConstructMonitor extends PureComponent {
  componentDidMount() {
  }

  handleClick = (ev) => {
    const { view, dispatch, list } = this.props;
    const items = this.chart.getTooltipItems({ x: ev.x, y: ev.y });
    if (items.length > 0) {
      const searchText = items[0].point._origin.areaId;
      searchByAttr({ searchText, searchFields: ['ObjCode'] }).then(
        (res) => {
          if (res.length > 0) {
            const item = list.find(value => value.area.areaId === searchText);
            const keys = []; // map 循环时用的key
            for (const data of item.data) {
              keys.push(String(data.jobMonitorID));
            }
            view.goTo({ extent: res[0].feature.geometry.extent.expand(1.2) }).then(() => {
              // 作业监控 单独处理
              dispatch({
                type: 'resourceTree/saveCtrlResourceType',
                payload: 'constructMonitor',
              });
              dispatch({
                type: 'constructMonitor/queryMapSelectedList',
                payload: { list: item.data, area: item.area, keys },
              });
            });
          }
        }
      );
    }
  };
  render() {
    const { data } = this.props;
    data.sort((a, b) => {
      return b.count - a.count;
    });
    const scales = getCols(data[0].count);
    return (
      <Chart
        height={300}
        data={data}
        forceFit
        onPlotClick={this.handleClick}
        onGetG2Instance={(chart) => { this.chart = chart; }}
        scale={scales}
        padding={[20, 30, 40, 30]}
        animate={false}
      >
        <LeftTitle title="作业数量" />
        <Axis
          name="areaName"
          label={{
            autoRotate: false,
            offset: 15,
                // 设置文本的显示样式，还可以是个回调函数，回调函数的参数为该坐标轴对应字段的数值
                textStyle: {
                textAlign: data.length > 5 ? 'end' : 'center', // 文本对齐方向，可取值为： start center end
                fill: '#404040', // 文本的颜色
                fontSize: '12', // 文本大小
                fontWeight: 'bold', // 文本粗细
                rotate: data.length > 5 ? -45 : 0,
            },
                textBaseline: 'bottom', // 文本基准线，可取 top middle bottom，默认为middle
            // formatter(text, item1, index) {
            //   const arr = text.split(' ');
            //   console.log('text', text);
            //   console.log('item', item1);
            //   console.log('index', index);
            //   let str = '\n';
            //   for (const item of text) {
            //     str += `${item}\n`;
            //   }
            //   return str;
            // },
            //     htmlTemplate: (text, item, index1) => {
            //         const { length } = text;
            //         console.log(item);
            //       console.log('index1', index1);
            //         let index = 0;
            //         const getText = () => {
            //           let str = '';
            //           while (index < length) {
            //               str += `<div>${text[index]}</div>`;
            //               index += 1;
            //           }
            //           return str;
            //         };
            //         return (
            //             // `<div >${getText()}</div>`
            //           `<div style="writing-mode: vertical-lr">${text}</div>`
            //         );
            //     },
            }}
        />
        <Axis name="count" line={{ lineWidth: 1, stroke: '#ccc' }} />
        <Tooltip
          crosshairs={{ type: 'y' }}
          itemTpl='<tr class="g2-tooltip-list-item"><td style="color:{color}">作业数量： </td><td>{value}</td></tr>'
        />
        <Geom type="interval" position="areaName*count" />
      </Chart>
    );
  }
}
