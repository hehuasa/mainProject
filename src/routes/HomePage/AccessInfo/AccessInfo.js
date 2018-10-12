import React, { PureComponent } from 'react';
import OrgInfo from './OrgInfo';
import FactoryInfo from './FactoryInfo';
import SmoothDay from './SmoothDay';
import SmoothWeek from './SmoothWeek';
import styles from './index.less';

const timerId = { getData: undefined, switchTable: undefined };
const getData = (dispatch) => {
  // 区域统计
  dispatch({
    type: 'accessControl/getAllDoorCountArea',
  });
  // 请求部门进出统计情况
  dispatch({
    type: 'accessControl/getDoorOrgCount',
  });
  // 人员进出情况
  dispatch({
    type: 'accessControl/getDoorPage',
    payload: { pageSize: 20, pageNum: 1 },
  });
  dispatch({
    type: 'accessControl/getCountByDay',
    payload: { days: 7 },
  });
  dispatch({
    type: 'accessControl/getCountByTime',
  });
};
export default class AccessInfo extends PureComponent {
  state = {
    showIndex: 0,
    onWheel: false,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    timerId.switchTable = setInterval(() => {
      const { onWheel } = this.state;
      let { showIndex } = this.state;
      if (onWheel) {
        return false;
      }
      if (showIndex === 3) {
        showIndex = 0;
      } else {
        showIndex += 1;
      }
      this.setState({ showIndex });
    }, 10000);
    const a = setInterval(() => {
      if (this.props.accessControl.spaceTime !== null) {
        timerId.getData = setInterval(() => {
          getData(dispatch);
        }, this.props.accessControl.spaceTime);
        clearInterval(a);
      }
    });
    getData(dispatch);
  }
  componentWillUnmount() {
    clearInterval(timerId.switchTable);
    clearInterval(timerId.getData);
  }
    getCount = (array) => {
      const count = { inCount: 0, sunCount: 0, detailKey: '', detailValue: '' };
      for (const item of array) {
        count.inCount += item.inNUm;
        count.sunCount += item.sumNum;
      }
      return count;
    };
  handleWheel = (boolean) => {
    this.setState({
      onWheel: boolean,
    });
  };
  render() {
    const { showIndex, onWheel } = this.state;
    const {
      doorOrgCount,
      doorCount,
      countByDay,
      countByTime,
      style,
      allDoorCountArea,
    } = this.props.accessControl;
    const count = this.getCount(allDoorCountArea);
    return (
      <div
        className={styles.warp}
        onMouseOver={() => { this.handleWheel(true); }}
        onMouseOut={() => { this.handleWheel(false); }}
        style={style}
      >
        <div className={styles.warpTitle}>门禁监测</div>
        <div className={styles.header}>
          <span>{`今日入场: ${count.inCount} 人`}</span>
          <span>{`当前在场: ${count.sunCount} 人`}</span>
          {allDoorCountArea.length > 1 ? <span>{`${allDoorCountArea[0].areaName}/${allDoorCountArea[1].areaName}: ${allDoorCountArea[0].sumNum}/${allDoorCountArea[1].sumNum} 人`}</span> : null}

        </div>
        <div className={styles.content}>
          <div style={{ opacity: showIndex === 0 ? 1 : 0 }}>
            <OrgInfo doorOrgCount={doorOrgCount} onWheel={onWheel} style={style} />
          </div>
          <div style={{ opacity: showIndex === 1 ? 1 : 0 }}>
            <FactoryInfo doorCount={doorCount} onWheel={onWheel} style={style} />
          </div>
          <div style={{ opacity: showIndex === 2 ? 1 : 0 }}>
            <SmoothDay countByDay={countByDay} style={style} />
          </div>
          <div style={{ opacity: showIndex === 3 ? 1 : 0 }}>
            <SmoothWeek countByTime={countByTime} style={style} />
          </div>
        </div>
      </div>
    );
  }
}
