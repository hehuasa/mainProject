import React, { PureComponent } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import LeftTitle from '../../LeftTitle/LeftTitle';
import { searchByAttr } from '../../../../../utils/mapService';
import styles from '../panel.less';

const getCols = (length) => {
  const obj = {
    device: {
      alias: '报警设备',
    },
    count: {
      alias: '报警数量',
    },
  };
  if (length < 5 && length > 0) {
    obj.count.tickInterval = 1;
  }
  return obj;
};
export default class AlarmCountingStatistics extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      g2Chart: null,
    };
  }
  handClick = (data) => {
    if (!data.point._origin) {
      return;
    }
    const { view } = this.props;
    searchByAttr({ searchText: data.point._origin.val[0].areaGisCode, searchFields: ['ObjCode'] }).then(
      (res) => {
        if (res.length > 0) {
          const polygonExtent = res[0].feature.geometry.extent;
          view.goTo({
            extent: polygonExtent,
          }).then(() => {
            // this.props.dispatch({
            //   type: 'resourceTree/selectByGISCode',
            //   payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode: data.point._origin.val[0].areaGisCode },
            // });
          });
        }
      }
    );
  };
  render() {
    const { list, titleColor } = this.props;
    let newArray;
    if (list.length > 0) {
        newArray = list.sort((a, b) => { return a.count < b.count; });
    }
    const scales = getCols(newArray[0].count);
    return (
      (list.length === 0) ?
        <div className={styles.noData}>暂无数据</div> :
        (
          <div>
            <LeftTitle title={scales.count.alias} />
            <Chart
              height={300}
              data={list}
              scale={scales}
              padding={[20, 30, 40, 60]}
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
                this.handClick(items[0]);
              }}
            >
              <Axis name="device" />
              <Axis name="count" line={{ lineWidth: 1, stroke: '#ccc' }} />
              <Tooltip crosshairs={{ type: 'y' }} />
              <Geom type="interval" position="device*count" color={['#4ea5fb']} />
            </Chart>
          </div>
        )
    );
  }
}
