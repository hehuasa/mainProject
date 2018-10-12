import React, { PureComponent } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './index.less';


let timerId;
const scrolling = (dom, progress, scrollTop) => {
  progress += 10;
  dom.scrollTop(progress);
  if (dom.getScrollTop() === scrollTop) {
    progress = 0;
    scrollTop = 0;
  } else {
    scrollTop = dom.getScrollTop();
  }
  return { progress, scrollTop };
};
export default class FromComponent extends PureComponent {
  componentDidMount() {
    // 自动滚动
    let progress = 0;
    let scrollTop = 0;
    let progress1 = 0;
    let scrollTop1 = 0;
    timerId = setInterval(() => {
      const { onWheel } = this.props;
      if (!onWheel) {
        const obj = scrolling(this.arrayLeft, progress, scrollTop);
        progress = obj.progress; scrollTop = obj.scrollTop;
        const obj1 = scrolling(this.arrayRight, progress1, scrollTop1);
        progress1 = obj1.progress; scrollTop1 = obj1.scrollTop;
      }
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(timerId);
  }
  // 分解数组
  handleData = (array) => {
    const obj = { arrayLeft: [], arrayRight: [] };
    let index = 0;
    if (array.length > 0) {
      while (index < array.length) {
        index % 2 === 0 ? obj.arrayLeft.push(array[index]) : obj.arrayRight.push(array[index]);
        index += 1;
      }
    }
    return obj;
  };
  render() {
    const { doorOrgCount, style } = this.props;
    const { arrayLeft, arrayRight } = this.handleData(doorOrgCount);
    const height = style.height - 156;
    return (
      <div className={styles.orgInfo}>
        <ul>
          <li className={styles.title}>
            <span className={styles.orgName}>部门名称</span>
            <span className={styles.inFac}>在厂</span>
            <span className={styles.inPro}>生产区</span>
            <span className={styles.inOffice}>办公区</span>
          </li>
          <Scrollbars
            style={{ height }}
            ref={ref => this.arrayLeft = ref}
          >
            {arrayLeft.length > 0 ? arrayLeft.map(item => (

              <li className={styles.list} key={Math.random() * new Date().getTime()}>
                <span className={styles.orgName}>{item.orgName}</span>
                <span className={styles.inFac}>{item.sumNum}</span>
                <span className={styles.inPro}>{item.productCount || 0}</span>
                <span className={styles.inOffice}>{item.officeCount || 0}</span>
              </li>
)) : null}
          </Scrollbars>
        </ul>
        <ul>
          <li className={styles.title}>
            <span className={styles.orgName}>部门名称</span>
            <span className={styles.inFac}>在厂</span>
            <span className={styles.inPro}>生产区</span>
            <span className={styles.inOffice}>办公区</span>
          </li>
          <Scrollbars
            autoHeight
            autoHeightMax={height}
            ref={ref => this.arrayRight = ref}
          >
            {arrayRight.length > 0 ? arrayRight.map(item => (
              <li className={styles.list} key={Math.random() * new Date().getTime()}>
                <span className={styles.orgName}>{item.orgName}</span>
                <span className={styles.inFac}>{item.sumNum}</span>
                <span className={styles.inPro}>{item.productCount || 0}</span>
                <span className={styles.inOffice}>{item.officeCount || 0}</span>
              </li>
)) : null}
          </Scrollbars>
        </ul>
      </div>
    );
  }
}

