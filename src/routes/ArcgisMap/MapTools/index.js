import React, { PureComponent } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Button } from 'antd';
import { connect } from 'dva';
import { select, measure, delLayer } from '../../../utils/mapService';
import { mapConstants } from '../../../services/mapConstant';
import styles from './index.less';
import zoomIn from '../../../assets/map/tools/放大.png';
import zoomOut from '../../../assets/map/tools/缩小.png';
import reset from '../../../assets/map/tools/地图还原.png';
import circle from '../../../assets/map/tools/圈选.png';
import length from '../../../assets/map/tools/测距.png';
import area from '../../../assets/map/tools/测面积.png';
import legendPic from '../../../assets/map/tools/图例.png';
import layerList from '../../../assets/map/tools/图层.png';

const layers = ['地图搜索结果', '周边查询', '空间查询', '测量', '标注', '圈选'];
const clearLayer = (map, dispatch) => {
  for (const name of layers) {
    const layer = map.findLayerById(name);
    if (layer) {
      map.remove(layer);
    }
  }
    dispatch({
        type: 'map/getDeviceArray',
        payload: null,
    });
};

// 地图工具函数
@connect(({ map, homepage }) => {
  const { layerIds, scale, legend, legendLayer, stopPropagation, toolsBtnIndex } = map;
  const layerids = JSON.parse(JSON.stringify(layerIds));
  return {
    scale,
    layerids,
    legend,
    legendLayer,
    toolsBtnIndex,
    stopPropagation,
    mapHeight: homepage.mapHeight,
  };
})
export default class MapTools extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      layerListShow: false,
      showLegend: false,
    };
  }
  handleClick=(e) => {
    const { mainMap, view, extent } = mapConstants;
    const mapView = view;
    const { dispatch, stopPropagation, toolsBtnIndex } = this.props;
    const { showLegend } = this.state;
    if (stopPropagation) {
      return false;
    }
    let title;
    (e.target.title) ? { title } = e.target : { title } = e.target.parentNode;
    switch (title) {
      case '放大':
        mapView.goTo({ scale: mapView.scale - 1000 });
        break;
      case '缩小':
        mapView.goTo({ scale: mapView.scale + 1000 });
        break;
      case '测距':
          clearLayer(mainMap, dispatch);
        // if (mainMap.findLayerById('空间查询') || mainMap.findLayerById('测量') || mainMap.findLayerById('圈选')) {
        //   return false;
        // }
        dispatch({
          type: 'map/queryToolsBtnIndex',
          payload: toolsBtnIndex === 0 ? -1 : 0,
        });
        if (toolsBtnIndex !== 0) {
            measure(mainMap, mapView, 'polyline', dispatch, this);
        }
        break;
      case '测面积':
          clearLayer(mainMap, dispatch);
        // if (mainMap.findLayerById('空间查询') || mainMap.findLayerById('测量') || mainMap.findLayerById('圈选')) {
        //   return false;
        // }
        dispatch({
          type: 'map/queryToolsBtnIndex',
          payload: toolsBtnIndex === 1 ? -1 : 1,
        });
          if (toolsBtnIndex !== 1) {
              measure(mainMap, mapView, 'polygon', dispatch, this);
          }
        break;
      case '圈选':
          clearLayer(mainMap, dispatch);
        // if (mainMap.findLayerById('空间查询') || mainMap.findLayerById('测量')) {
        //   return false;
        // }
        dispatch({
          type: 'map/queryToolsBtnIndex',
          payload: toolsBtnIndex === 2 ? -1 : 2,
        });
          if (toolsBtnIndex !== 2) {
              select({ map: mainMap, view: mapView, dispatch });
          }

        break;
      case '图例':
        this.setState({
          showLegend: !showLegend,
        });
        this.props.showLegend();
        break;
      case '图层':
        this.setState({ layerListShow: !this.state.layerListShow });
        break;
      case '还原':
        mapView.goTo({ extent });
        break;
      default: break;
    }
  };
  handleLayerDel = (e) => {
    const { mainMap, dispatch, layerids } = this.props;
    if (e.target.title !== '') {
      if (e.target.title === 'closeAll') {
        delLayer(mainMap, layerids, dispatch);
      } else {
        delLayer(mainMap, [e.target.title], dispatch);
      }
    }
  }

  render() {
    const { layerids, stopPropagation, toolsBtnIndex } = this.props;
    const { layerListShow, showLegend } = this.state;
    // const layerListDom = layerListShow ? (
    //   <div className={styles.layers} >
    //     <Scrollbars
    //       autoHide
    //       autoHideTimeout={1000}
    //       autoHideDuration={200}
    //       autoHeight
    //       autoHeightMin={200}
    //       autoHeightMax={420}
    //     >
    //       <ul onClick={this.handleLayerDel}>
    //         <li><span className={`${styles.name} ${styles.title}`}>图层名称</span><span className={`${styles.opreate} ${styles.title}`}>操作</span></li>
    //         { layerids.map((item) => {
    //       return (
    //         <li key={Math.random() * new Date().getTime()}><span className={styles.name}>{item}</span><span className={styles.opreate}><a title={item}>删除</a></span></li>
    //       );
    //     })}
    //       </ul>
    //     </Scrollbars>
    //     <div style={{ width: '100%', textAlign: 'center' }}>
    //       <Button className={styles.closeall} title="closeAll" onClick={this.handleLayerDel}>全部删除</Button>
    //     </div>
    //   </div>
    // ) : null;
    return (
      <div>
        <div className={styles.tools} onClick={this.handleClick} style={{ zIndex: stopPropagation ? -1 : null }}>
          <div title="放大"><img src={zoomIn} alt="放大" /></div>
          <div title="缩小"><img src={zoomOut} alt="缩小" /></div>
            {/*<div title="圈选"><img src={circle} alt="圈选" /></div>*/}
            {/*<div title="测距"><img src={length} alt="测距" /></div>*/}
            {/*<div title="测面积"><img src={area} alt="测面积" /></div>*/}
          <div title="圈选" style={{ background: toolsBtnIndex === 2 ? '#999' : '' }}><img src={circle} alt="圈选" /></div>
          <div title="测距" style={{ background: toolsBtnIndex === 0 ? '#999' : '' }}><img src={length} alt="测距" /></div>
          <div title="测面积" style={{ background: toolsBtnIndex === 1 ? '#999' : '' }}><img src={area} alt="测面积" /></div>
          <div title="图例" style={{ background: showLegend ? '#999' : '' }} ><img src={legendPic} alt="图例" /></div>
          {/*<div title="图层"><img src={layerList} alt="图层" /></div>*/}
          <div title="还原"><img src={reset} alt="还原" /></div>
        </div>
        {/*{ layerListDom }*/}
        {/* <div className={styles.legend} style={{ zIndex: this.props.legend.show ? 10 : -1 }} > */}
        {/* <Scrollbars */}
        {/* autoHide */}
        {/* autoHideTimeout={1000} */}
        {/* autoHideDuration={200} */}
        {/* autoHeight */}
        {/* autoHeightMin={400} */}
        {/* autoHeightMax={this.props.mapHeight - 73 - 48 - 32 - 32} */}
        {/* > */}
        {/* <div ref={(ref) => { this.legendContainer = ref; }} /> */}
        {/* </Scrollbars> */}
        {/* </div> */}

      </div>
    );
  }
}
