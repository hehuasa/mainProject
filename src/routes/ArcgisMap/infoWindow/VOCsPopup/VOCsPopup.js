import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Popover, Row, Col } from 'antd';
import styles from './index.less';

const mapStateToProps = ({ map }) => {
  return {
    infoPops: map.vocsPops,
  };
};
class ClusterPopup extends PureComponent {
  handleClick = () => {
    const { popValue, dispatch } = this.props;
    const { list, areaName, keys } = popValue;
    dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: '',
    });
    dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: 'vocsMonitor',
    });
    dispatch({
      type: 'vocsMonitor/queryMapSelectedList',
      payload: { list, areaName, keys },
    });
  };
  render() {
    const { popValue } = this.props;
    const { attributes, data } = popValue;
    const { style } = attributes;
    // 弹出式气泡窗内容
    const content = (
      <div className={styles.content}>
        <Row><Col span={18}>维修点数量</Col><Col span={2}> : </Col><Col span={4}> {data.maintNumber}</Col></Row>
        <Row><Col span={18}>已维修点数量</Col><Col span={2}> : </Col><Col span={4}> {data.alreadyMaintNumber}</Col></Row>
        <Row><Col span={18}>无法维修点数量</Col><Col span={2}> : </Col><Col span={4}> {data.notMaintNumber}</Col></Row>
        <Row><Col span={18}>待维修点数量</Col><Col span={2}> : </Col><Col span={4}> {data.waitMaintNumber}</Col></Row>
      </div>
    );
    // 聚合气泡窗内容
    const count = (
      <div>
        <div className={styles.blueCircleOnly}>{popValue.count}</div>
      </div>
    );
    const warp = (
      <Popover content={content} placement="rightTop" overlayClassName={styles.pop}>
        <div className={styles.warp} style={style} onClick={this.handleClick}>
          { count }
        </div>
      </Popover>
    );
    return (
      <div>
        { warp }
      </div>
    );
  }
}
export default connect(mapStateToProps)(ClusterPopup);
