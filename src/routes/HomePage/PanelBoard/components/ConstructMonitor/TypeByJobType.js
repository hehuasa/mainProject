import React, { PureComponent } from 'react';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';

const getCols = (length) => {
  const obj = {};
  if (length < 5 && length > 0) {
    obj.tickInterval = 1;
  }
  return { count: obj };
};
export default class TypeByJobType extends PureComponent {
  render() {
    const { data } = this.props;
    const scales = getCols(data[0].count);
    return (
      <Chart height={400} data={data} forceFit scale={scales}>
        <Axis name="jobType" />
        <Axis name="count" />
        <Tooltip
          crosshairs={{ type: 'y' }}
          itemTpl='<tr class="g2-tooltip-list-item"><td style="color:{color}">作业数量： </td><td>{value}</td></tr>'
        />
        <Geom type="interval" position="jobType*count" />
      </Chart>
    );
  }
}
