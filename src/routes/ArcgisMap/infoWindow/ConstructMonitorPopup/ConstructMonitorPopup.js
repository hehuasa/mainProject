import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import ClusterPopup from '../../../../components/ClusterPopup/ClusterPopup';
import styles from './index.less';
import { addPopupHover } from '../../../../utils/mapService';

const circleBackground = '#27afff';
export default class ConstructMonitorPopup extends PureComponent {
  handleClick = () => {
    const { popValue, dispatch } = this.props;
    const { attributes } = popValue;
    const { list, area, keys } = attributes;
    dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: '',
    });
    dispatch({
      type: 'constructMonitor/queryMapSelectedList',
      payload: { list, area, keys },
    });
    dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: 'constructMonitor',
    });
  };
  handleMouseOver = () => {
    const { popValue } = this.props;
    const { attributes } = popValue;
    addPopupHover(attributes.area, circleBackground);
  };
  handleMouseOut = () => {
    addPopupHover();
  };
  render() {
    const { popValue } = this.props;
    console.log('popValue', popValue);
    const { attributes } = popValue;
    const { style, data } = attributes;
    return (
      <ClusterPopup count={data.list.length} circleBackground={circleBackground} style={style} handleClick={this.handleClick} handleMouseOver={this.handleMouseOver} handleMouseOut={this.handleMouseOut} />
    );
  }
}
