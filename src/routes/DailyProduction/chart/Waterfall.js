import React, { PureComponent } from 'react';
import { Chart, Axis, Geom, Tooltip, Util, Shape, Legend } from 'bizcharts';
import styles from './index.less';

const textColor = '#c0c0c0';
const lineColor1 = '#6dc3ea';
const lineColor2 = '#00e600';

const getRectPath = (points) => {
  const path = [];
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (point) {
      const action = i === 0 ? 'M' : 'L';
      path.push([action, point.x, point.y]);
    }
  }
  const first = points[0];
  path.push(['L', first.x, first.y]);
  path.push(['z']);
  return path;
};

const getFillAttrs = (cfg) => {
  const defaultAttrs = Shape.interval;
  const attrs = Util.mix({}, defaultAttrs, {
    fill: cfg.color,
    stroke: cfg.color,
    fillOpacity: cfg.opacity,
  }, cfg.style);
  return attrs;
};

Shape.registerShape('interval', 'waterfall', {
  draw(cfg, container) {
    const attrs = getFillAttrs(cfg);
    let rectPath = getRectPath(cfg.points);
    rectPath = this.parsePath(rectPath);
    const interval = container.addShape('path', {
      attrs: Util.mix(attrs, {
        path: rectPath,
      }),
    });

    if (cfg.nextPoints) {
      let linkPath = [
        ['M', cfg.points[2].x, cfg.points[2].y],
        ['L', cfg.nextPoints[0].x, cfg.nextPoints[0].y],
      ];

      if (cfg.nextPoints[0].y === 0) {
        linkPath[1] = ['L', cfg.nextPoints[1].x, cfg.nextPoints[1].y];
      }
      linkPath = this.parsePath(linkPath);
      container.addShape('path', {
        attrs: {
          path: linkPath,
          stroke: 'rgba(0, 0, 0, 1)',
          lineDash: [4, 2],
        },
      });
    }

    return interval;
  },
});

const transData = (data) => {
  const array = [];
  for (const [index, item] of Object.entries(data)) {
    if (typeof item === 'number') {
      array.push({
        type: index, value: item, origin: item,
      });
    }
  }
  for (let i = 0; i < array.length; i += 1) {
    const item = array[i];
    if (i > 0 && i < array.length - 1) {
      if (Util.isArray(array[i - 1].value)) {
        item.value = [array[i - 1].value[1], item.value + array[i - 1].value[1]];
      } else {
        item.value = [array[i - 1].value, item.value + array[i - 1].value];
      }
    }
  }
  return array;
};
const cols = {
  day: {
    type: 'linear',
    tickInterval: 1,
  },
};
export default class Waterfall extends PureComponent {
  render() {
    const { data } = this.props;
    const newData = transData(data);
    return (
      <div className={styles.warp}>
        <h2>标题</h2>
        <div onClick={this.props.click}>关闭</div>
        <Chart
          height={400}
          data={newData}
          scale={cols}
          forceFit
        >
          <Legend
            custom={true}
            clickable={false}
            items={[
              { value: '增项', marker: { symbol: 'square', fill: '#1890FF', radius: 5}},
              { value: '减项', marker: { symbol: 'square', fill: '#8c8c8c', radius: 5}}
            ]}
          />
          <Axis name="type" />
          <Axis name="value" />
          <Tooltip crosshairs={{ type: 'y' }} />
          <Geom
            type="interval"
            position="type*value"
            shape="waterfall"
            color={['type*value*origin', (type, value, origin) => {
              if (origin < 0) {
                return 'rgba(0, 0, 0, 0.65)';
              }
              return '#1890FF';
},
            ]}
            tooltip={['type*value', (type, value) => {
              if (Util.isArray(value)) {
                return {
                  name: '数值',
                  value: value[1] - value[0],
                };
              }
              return {
                name: '数值',
                value,
              };
            }]}
          />
        </Chart>
      </div>
    );
  }
}

