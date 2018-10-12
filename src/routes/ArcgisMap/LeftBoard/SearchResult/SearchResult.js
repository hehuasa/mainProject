import React, { PureComponent } from 'react';
import { Pagination, message } from 'antd';
import { connect } from 'dva';
import { addSearchIcon, changeIcon } from '../../../../utils/MapService';
import styles from '../../Sraech/index.less';
import locateHover from '../../../../assets/map/search/locate.png';
import locate from '../../../../assets/map/search/locate-hover.png';
import { mapConstants } from '../../../../services/mapConstant';

const mapStateToProps = ({ map, resourceTree }) => {
  const { searchText, searchDeviceArray, mapBoardShow, isRecenter } = map;
  return {
    searchText,
    searchDeviceArray,
    baseLayer: mapConstants.mainMap,
    mainMap: mapConstants.mainMap,
    mapView: mapConstants.view,
    mapBoardShow,
    isRecenter,
    resourceTree,
    ctrlResourceType: resourceTree.ctrlResourceType,
  };
};
class SearchResult extends PureComponent {
  state = {
    lists: [],
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  };
  componentDidMount() {
    const { searchDeviceArray, mainMap, mapView, dispatch, isRecenter } = this.props;
    if (searchDeviceArray.length !== 0) {
      const lists = searchDeviceArray.slice(0, 5);
      this.setState({
        lists,
      });
        addSearchIcon(mainMap, mapView, lists, dispatch, isRecenter);
    } else {
      // addSearchIcon(mainMap, mapView, [], dispatch, isRecenter);
    }
  }
  handleChange = (page, pageSize) => {
    const { searchDeviceArray, mainMap, dispatch, isRecenter, mapView } = this.props;
    const lastPage = page - 1;
    const sliceStart = lastPage * pageSize;
    const lists = searchDeviceArray.slice(sliceStart, sliceStart + pageSize);
    this.setState({
      lists,
    });
    //  添加定位标
    addSearchIcon(mainMap, mapView, lists, dispatch, isRecenter);
  };
  handleMouseOver = (index) => {
    const { mainMap } = this.props;
    this.setState({
      [index]: true,
    });
    changeIcon(mainMap, '地图搜索结果', index, 'resultId', 'locateHover');
  };
  handleMouseLeave= (index) => {
    const { mainMap } = this.props;
    this.setState({
      [index]: false,
    });
    changeIcon(mainMap, '地图搜索结果', index, 'resultId', 'locate');
  };
  handleClick = (item) => {
    const { mainMap, dispatch, mapView } = this.props;
    // 根据ObjCode 作为giscode 请求资源数据
    const { ObjCode } = item.feature.attributes;
    dispatch({
      type: 'resourceTree/selectByGISCode',
      payload: { pageNum: 1, pageSize: 1, isQuery: true, fuzzy: false, GISCode: ObjCode },
    }).then(() => {
      if (this.props.resourceTree.resourceInfo === undefined || this.props.resourceTree.resourceInfo === {}) {
        message.error('未请求到资源相关数据');
      } else {
        // 返回搜索列表区域
        dispatch({
          type: 'map/mapBoardShow',
          payload: { backResult: true },
        });
      }
    });
    // 首先清除弹窗
    dispatch({
      type: 'map/trueMapShow',
      payload: false,
    });
    // 居中并弹窗
    mapView.goTo({ center: item.feature.geometry }).then(() => {
      const screenPoint = mainMap.toScreen(item.feature.geometry);
      dispatch({
        type: 'map/showInfoWindow',
        payload: { show: true, type: 'simpleInfo', screenPoint, mapStyle: { width: mainMap.width, height: mainMap.height }, attributes: item.feature.attributes },
      });
    });
  };

  render() {
    const { searchDeviceArray } = this.props;
    console.log('searchDeviceArray', searchDeviceArray);
    return (
      searchDeviceArray !== null && searchDeviceArray.length > 0 ? (
        <div className={styles.searchResult}>
          {this.state.lists.map((item, index) => {
          return (
            <div
              key={item.feature.geometry.x}
              onMouseOver={() => { this.handleMouseOver(index); }}
              onMouseLeave={() => { this.handleMouseLeave(index); }}
              onClick={() => { this.handleClick(item); }}
            >
              <div className={styles.img}>
                {this.state[index] ? <img alt="定位示意(鼠标进入)" src={locateHover} /> : <img alt="定位示意" src={locate} />}
                <div>{`${index + 1}`}</div>
              </div>
              <div>
                <div className={styles.resultName}>{item.feature.attributes['设备名称'] === '空' ? item.feature.attributes['设备类型'] : item.feature.attributes['设备名称']}</div>
                <div>{`资源编码:  ${item.feature.attributes['设备编号']}`}</div>
              </div>
            </div>
          );
        })}
          <Pagination
            total={searchDeviceArray.length}
            showTotal={total => `共 ${Math.ceil(total / 5)}页`}
            defaultPageSize={5}
            defaultCurrent={1}
            onChange={this.handleChange}
            size="small"
            hideOnSinglePage
          />
        </div>
      ) : <div className={styles.searchResult} style={{ marginLeft: 8 }}>搜索结果为空</div>);
  }
}
export default connect(mapStateToProps)(SearchResult);
