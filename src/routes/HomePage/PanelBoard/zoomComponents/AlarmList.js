import React, { PureComponent } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { hoveringAlarm, searchByAttr } from '../../../../utils/mapService';
import styles from './zoomComponents.less';
import { mapConstants } from '../../../../services/mapConstant';

const columns = [
  {
    title: '序号',
    dataIndex: 'sort',
    key: 'sort',
    render: (text, record, index) => {
      return <span >{index + 1}</span>;
    },
  },
  {
    title: '事发位置',
    dataIndex: 'areaName',
    className: styles.cursorStyle,
    key: 'areaName',
  },
  {
    title: '报警类型',
    dataIndex: 'alarmType.alarmTypeName',
    className: styles.cursorStyle,
    key: 'alarmType',
  }, {
    title: '报警点位编号',
    dataIndex: 'alarmDes',
    className: styles.cursorStyle,
    key: 'alarmDes',
  }, {
    title: '报警点位名称',
    dataIndex: 'resourceName',
    className: styles.cursorStyle,
    key: 'resourceName',
  }, {
    title: '首报时间',
    dataIndex: 'startTime',
    key: 'startTime',
    className: styles.cursorStyle,
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
      return Number(a.receiveTime) - Number(b.receiveTime);
    },
    render: (val) => {
      if (!val) {
        return '';
      }
      return <span>{moment(val).format('L HH:mm:ss')}</span>;
    },
  }];

@connect(({ alarm, map }) => ({
  alarm,
  popupScale: map.popupScale,
  iconArray: alarm.iconArray,
  infoPops: map.infoPops,
}))
class AlarmCounting extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'alarm/fetch',
    });
  }
  handleClick = (record) => {
    const { popupScale, dispatch, infoPops } = this.props;
    const { view } = mapConstants;
    searchByAttr({ searchText: record.resourceGisCode, searchFields: ['ObjCode'] }).then(
      (res) => {
        if (res.length > 0) {
          const screenPoint = view.toScreen(res[0].feature.geometry);
          view.goTo({ center: res[0].feature.geometry, scale: popupScale }).then(() => {
            hoveringAlarm({ layer: mapConstants.mainMap.findLayerById('报警选中'), geometry: res[0].feature.geometry, alarm: record, dispatch, screenPoint, infoPops });
          });
        }
      }
    );
  };
  render() {
    const { alarm } = this.props;
    return (
      <div className={styles.regionWarp}>
        <Table
          columns={columns}
          bordered
          rowClassName={styles.cursorStyle}
          dataSource={alarm.list}
          size="small"
          scroll={{ x: 450 }}
          pagination={{ pageSize: 10 }}
          rowKey={record => record.alarmCode}
          onRow={(record) => {
            return {
              onClick: () => this.handleClick(record), // 点击行
            };
          }}
        />
      </div>
    );
  }
}

export default AlarmCounting;

