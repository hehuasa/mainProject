import React, { PureComponent } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import { searchByAttr } from '../../../../../utils/MapService';
import styles from '../panel.less';

export default class AlarmCountingRound extends PureComponent {
  handClick = (data) => {
    const { view } = this.props;
    searchByAttr({ searchText: data.val[0].areaGisCode, searchFields: ['ObjCode'] }).then(
      (res) => {
        if (res.length > 0) {
          const polygonExtent = res[0].feature.geometry.extent;
          view.goTo({
            extent: polygonExtent,
          }).then(() => {
            // this.props.dispatch({
            //   type: 'resourceTree/selectByGISCode',
            //   payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, gISCode: data.val[0].areaGisCode },
            // });
          });
        }
      }
    );
  };
  render() {
    const { DataView } = DataSet;
    const { list } = this.props;
    const dv = new DataView();
    dv.source(list).transform({
      type: 'percent',
      field: 'count',
      dimension: 'device',
      as: 'percent',
    });
    const cols = {
      percent: {
        formatter: (val) => {
          val = `${Math.floor(val * 1000) / 10}%`;
          return val;
        },
      },
    };
    return (
      (list.length === 0) ?
        <div className={styles.noData}>暂无数据</div> :
        (
          <div>
            <Chart
              height={300}
              data={dv}
              scale={cols}
              padding={[0, 80, 0, 0]}
              forceFit
              onPlotClick={(ev) => {
                if (!ev.data) {
                  return null;
                }
                if (!ev.data._origin) {
                  if (ev.data.device) {
                    this.handClick(ev.data);
                  }
                } else {
                  this.handClick(ev.data._origin);
                }
              }}
            >
              <Coord type="theta" radius={0.75} />
              <Axis name="percent" />
              <Legend position="right" offsetY={(-300 / 2) + 50} offsetX={-50} />
              <Tooltip
                showTitle={false}
                itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
              />
              <Geom
                type="intervalStack"
                position="percent"
                color="device"

                tooltip={['device*percent', (device, percent) => {
                  percent = `${Math.floor(percent * 1000) / 10}%`;
                  return {
                    name: device,
                    value: percent,
                  };
                }]}
                style={{ lineWidth: 1, stroke: '#fff' }}
              >
                <Label
                  content="percent"
                  offset={-40}
                  textStyle={{
                    rotate: 0,
                    textAlign: 'center',
                    shadowBlur: 2,
                    shadowColor: 'rgba(0, 0, 0, .45)',
                  }}
                />
              </Geom>
            </Chart>
          </div>
        )
    );
  }
}
