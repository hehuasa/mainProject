import React, { PureComponent } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'dva';
import { Collapse, Col, Button, Row, Switch } from 'antd';
import styles from './index.less';
import close from '../../../../assets/map/叉叉.png';
import { paSystemDetail } from '../../../../utils/MapService';

const { Panel } = Collapse;

let timer;
@connect(({ map, homepage, resourceTree, paSystem }) => {
  const { paBordInfo, mainMap, mapView } = map;
  return {
    mainMap,
    mapView,
    paBordInfo,
    paSystemInfo: paSystem.paSystemInfo,
    mapHeight: homepage.mapHeight,
    paLayer: paSystem.paLayer,
    currentArea: paSystem.currentArea,
    resourceGroupByArea: resourceTree.resourceGroupByArea,
  };
})
export default class PAInfo extends PureComponent {
  state= {
    modalVisible: false,
  };
  componentDidMount() {
    timer = setInterval(() => {
      const { dispatch, currentArea } = this.props;
      const sysInfo = this.props.paSystemInfo.find(value => Number(value.areaGISCode) === Number(currentArea.ObjCode));
      currentArea.sysInfo = sysInfo;
      dispatch({
        type: 'paSystem/saveCurrentArea',
        payload: currentArea,
      });
    }, 3000);
  }
  componentWillUnmount() {
    clearInterval(timer);
  }
  handlePAChange = (resource) => {
    const { dispatch, mainMap, mapView, currentArea, paLayer } = this.props;
    dispatch({
      type: 'paSystem/changePASystem',
      payload: { resourceIDs: [resource.resourceID], opType: 1 },
    }).then(() => {
      paSystemDetail({ map: mainMap, view: mapView, layer: paLayer, dispatch, paData: this.props.paSystemInfo });
      const sysInfo = this.props.paSystemInfo.find(value => Number(value.areaGISCode) === Number(currentArea.ObjCode));
      currentArea.sysInfo = sysInfo;
      dispatch({
        type: 'paSystem/saveCurrentArea',
        payload: currentArea,
      });
    });
  };
  handleClose = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'resourceTree/saveCtrlResourceType',
      payload: '',
    });
  };
  // hideModal = () => {
  //   this.setState({ modalVisible: false });
  // };
  showModal = () => {
    this.setState({ modalVisible: true });
  };
  transData = (data, sysInfo) => {
    const array = [];
    for (const item of data) {
      if (item.areaGISCode === sysInfo.areaGISCode) {
        item.disabled = true;
        item.checked = true;
      }
      let index = 0;
      for (const item1 of item.devices) {
        if (item1.state === 'open') {
          item.indeterminate = true;
          index += 1;
        }
      }
      if (index === item.devices.length) {
        item.checked = true;
      }
      array.push(item);
    }
    return array;
  };
  // onChange = (e) => {
  //   console.log(e);
  // }
  render() {
    const { mapHeight, paBordInfo, paSystemInfo, currentArea } = this.props;
    const { sysInfo } = currentArea;
    // const newData = this.transData(paSystemInfo, sysInfo);
    return (
      <div className={styles.warp}>
        <div className={styles.header}>
          <div className={styles.name}>扩音对讲</div>
          <div className={styles.close}>
            <Button type="primary" size="small" onClick={this.handleClose}><img src={close} alt="关闭" /></Button>
          </div>
        </div>
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={200}
          autoHeightMax={mapHeight - 73 - 48 - 32 - 32}
        >
          <Collapse bordered={false} defaultActiveKey="0">
            <Panel key="0" header="基本信息">
              <Row type="flex">
                <Col span={8}>分区号：</Col>
                <Col span={16}>{sysInfo.area.areaCode}</Col>
                <Col span={8}>广播区域：</Col>
                <Col span={16}>{sysInfo.area.areaName}</Col>
                <Col span={8}>扩音开关：</Col>
                <Col span={16}>
                  <div className={styles.switch}>
                    { sysInfo.devices.map(item =>
                      <Switch key={item.device.resourceCode} checked={item.state === 'open'} checkedChildren={item.device.resourceName} unCheckedChildren={item.device.resourceName} onChange={() => this.handlePAChange(item.device)} />
                    )}
                  </div>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Scrollbars>
        {/* <div className={styles.btn}> */}
        {/* <Button size="small" onClick={this.showModal}>扩音对象选择</Button> */}
        {/* <Modal */}
        {/* title="扩音对象选择" */}
        {/* visible={this.state.modalVisible} */}
        {/* onOk={this.hideModal} */}
        {/* onCancel={this.hideModal} */}
        {/* okText="确认" */}
        {/* cancelText="取消" */}
        {/* > */}
        {/* <Group onChange={this.onChange} > */}
        {/* <Row> */}
        {/* { newData.map((item) => { */}
        {/* return ( */}
        {/* <Col span={12} key={item.areaGISCode}> */}
        {/* <Checkbox */}
        {/* checked={item.checked} */}
        {/* indeterminate={item.indeterminate} */}
        {/* disabled={item.disabled} */}
        {/* value={item.areaGISCode} */}
        {/* > */}
        {/* {item.area.areaName} */}
        {/* </Checkbox> */}
        {/* </Col> */}
        {/* ); */}
        {/* })} */}
        {/* </Row> */}
        {/* </Group> */}
        {/* </Modal> */}
        {/* </div> */}
      </div>);
  }
}
