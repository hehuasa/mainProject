import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import { infoPopsModal } from '../../../../services/constantlyModal';
import styles from './index.less';

// 计算地图弹窗的箭头方向，宽高等
const getInfoWindowStyle = ({ mapStyle, screenPoint }) => {
  const arrowLength = 7;
  return {
    bottom: mapStyle.height - screenPoint.y + arrowLength + 5,
    left: screenPoint.x - 2,
  };
};
// 计算字符串长度
const getStrLength = (item) => {
  if (item === null) {
    return { cnLength: 0, enLength: 0 };
  }
  const cnChar = item.match(/[^\x00-\x80]/g);// 利用match方法检索出中文字符并返回一个存放中文的数组
  const entryLen = cnChar === null ? 0 : cnChar.length;// 算出实际的字符长度
  return { cnLength: entryLen, enLength: item.length - entryLen };
};
const mapStateToProps = ({ map }) => {
  return {
    infoPops: map.infoPops,
  };
};
class InfoPops extends PureComponent {
  handleClick = () => {
    const { infoPops, dispatch, popKey } = this.props;
    const index = infoPops.findIndex(value => value.key === popKey);
    infoPops.splice(index, 1);
    delete infoPopsModal[popKey];
    dispatch({
      type: 'mapRelation/queryInfoPops',
      payload: infoPops,
    });
  };
  render() {
    const { popValue } = this.props;
    const style = getInfoWindowStyle(popValue);
    if (style) {
      // 动态宽度
      const { cnLength, enLength } = getStrLength(popValue.name);
      style.width = cnLength * 14 + enLength * 10 + 24 + 24 + 8;
    }
    return (
      <div className={styles.simpleInfo} style={style}>
        <span>{popValue.name}</span>
        <Icon
          type="close"
          style={{ cursor: 'pointer', marginTop: 0 }}
          onClick={this.handleClick}
        />
        <div
          className={styles.bottom}
          style={{ left: '50%',
                    bottom: -5 }}
        />
      </div>
    );
  }
}
export default connect(mapStateToProps)(InfoPops);
