import React, { PureComponent } from 'react';
import { Popover } from 'antd';
import styles from './index.less';

export default class ClusterPopup extends PureComponent {
  render() {
    const { handleMouseOver, handleMouseOut, handleClick, content, style, count, circleBackground } = this.props;
    // 聚合气泡窗内容
    const counts = (
      <div>
        <div className={styles.circle} style={{ background: circleBackground }}>{count}</div>
      </div>
    );
    const popups = (
      <div className={styles.warp} style={style} onClick={handleClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        { counts }
      </div>
    );
    const warp = content ? (
      <Popover content={content} placement="rightTop" overlayClassName={styles.pop}>{popups}</Popover>
    ) : popups;
    return (
      <div>
        { warp }
      </div>
    );
  }
}
