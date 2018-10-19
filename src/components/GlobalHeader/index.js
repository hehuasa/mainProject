import React, { PureComponent } from 'react';
import { Icon, Spin, Tag, Divider, Switch, Popover, Select, Button, Badge, Modal, Form, Tooltip } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import styles from './index.less';
import Weather from './Weather';
import HandAlarmDeal from './HandAlarmDeal';
import { getBrowserStyle } from '../../utils/utils';

import alarmIcon from '../../assets/header/alarm.png';
import majorIcon from '../../assets/header/major.png';
import userIcon from '../../assets/header/user.png';
import settingIcon from '../../assets/header/setting.png';
import { mapConstants } from '../../services/mapConstant';
import { getBordStyle } from '../../utils/MapService';
import { handleCheck } from '../../routes/ResourceTree/treeAction';

const Option = Select.Option;
const { confirm } = Modal;
@Form.create()
export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showAlarm: false,
    };
  }
  componentDidMount() {
    const close = document.getElementById('close');
    close.style.zIndex = -1;
    // 请求未完成的报警事件
    this.props.dispatch({
      type: 'emergency/undoneEventList',
    });
    const { dispatch } = this.props;
    // 请求登录信息
    dispatch({
      type: 'user/fetchCurrent',
    });
    // 请求报警类型
    dispatch({
      type: 'alarm/getAlarmType',
    });
    // 请求报警数据
    dispatch({
      type: 'alarm/fetch',
    }).then(() => {
      dispatch({
        type: 'alarm/filter',
        payload: {
          historyList: this.props.alarm.groupByOverview.list,
          alarms: this.props.alarm.list,
          para: this.props.alarm.overviewShow,
        },
      });
    });
    // 聚合信息
    dispatch({
      type: 'resourceTree/getResourceGroupByArea',
    });
    // setInterval(() => {

    // 请求视频权限
    this.props.dispatch({
      type: 'global/getPtzPower',
    });
    // }, 3000);
  }
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  openBoardList = (key, title) => {
    const { expandKeys, activeKeys } = this.props.panelBoard;
    const openBoard = (boardType) => {
      const newArr = [];
      for (const arr of activeKeys) {
        newArr.push(arr.keys);
      }
      if (!activeKeys.find(value => value.keys === key)) {
        activeKeys.unshift({ name: boardType, uniqueKey: 0, keys: key, param: { title } });
      }
      if (newArr.indexOf(boardType) === -1) {
        expandKeys.push(boardType);
        this.props.dispatch({
          type: 'panelBoard/queryList',
          payload: {
            expandKeys,
            activeKeys,
          },
        });
      } else if (expandKeys.indexOf(boardType) === -1) {
        expandKeys.push(boardType);
        this.props.dispatch({
          type: 'panelBoard/queryList',
          payload: {
            expandKeys,
            activeKeys,
          },
        });
      }
      //  else {
      //   expandKeys.splice(expandKeys.indexOf(boardType), 1);
      //   this.props.dispatch({
      //     type: 'panelBoard/queryList',
      //     payload: {
      //       expandKeys,
      //       activeKeys,
      //     },
      //   });
      // }
    };
    openBoard(key, title);
  }
  // 报警
  onHandAlarmDeal = () => {
    this.setState({
      showAlarm: true,
    });
  }
  onHandAlarm = () => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rawMaterialIds = [fieldsValue.rawMaterialIds];
      const { alarmTypeId } = fieldsValue;

      fieldsValue.casualtys = [];
      fieldsValue.keys.map((obj, i) => {
        if (fieldsValue.location[i] == null && fieldsValue.injured[i] == null && fieldsValue.deaths[i] == null) {
          return;
        }
        if (fieldsValue.injured[i] == null) {
          fieldsValue.injured[i] = 0;
        }
        if (fieldsValue.deaths[i] == null) {
          fieldsValue.deaths[i] = 0;
        }

        const template = {};
        template.postion = fieldsValue.location[i];
        template.injured = fieldsValue.injured[i];
        template.death = fieldsValue.deaths[i];
        template.reportUserId = fieldsValue.reportUserId[i];
        template.reportUserName = fieldsValue.reportUserName[i];
        template.recordTime = fieldsValue.recordTime[i];
        fieldsValue.casualtys.push(JSON.parse(JSON.stringify(template)));
      });

      delete fieldsValue.probeResourceID1;
      delete fieldsValue.resourceID1;
      delete fieldsValue.rawMaterialIds1;

      this.props.dispatch({
        type: 'emergency/addHandAlarm',
        payload: {
          alarmStr: JSON.stringify(fieldsValue),
          rawMaterialIds,
        },
      }).then(() => {
        this.props.dispatch({
          type: 'alarm/fetch',
        });
        form.resetFields();
        this.setState({
          showAlarm: false,
        });
      });


      // this.props.dispatch({
      //   type: 'emergency/getAlarmEvent',
      //   // payload: { eventStr: JSON.stringify(fieldsValue), rawMaterialIds: JSON.stringify(rawMaterialIds) },
      //   payload: {
      //     eventStr: JSON.stringify(fieldsValue),
      //     rawMaterialIds,
      //     alarmTypeId,
      //   }
      // }).then(() => {
      //   form.resetFields();
      //   this.setState({
      //     showAlarm: false,
      //   });
      // });
    });
  }
  // 打开看板
  // openBoardList = () => {
  //   const { expandKeys, activeKeys } = this.props.panelBoard;
  //   const openBoard = (boardType) => {
  //     const newArr = [];
  //     for (const arr of activeKeys) {
  //       newArr.push(arr.keys);
  //     }
  //     if (newArr.indexOf(boardType) === -1) {
  //       expandKeys.push(boardType);
  //       this.props.dispatch({
  //         type: 'panelBoard/queryList',
  //         payload: {
  //           expandKeys,
  //           activeKeys: [
  //             { name: boardType, uniqueKey: 0, keys: boardType, param: { title: '事件信息' } },
  //             ...activeKeys,
  //           ],
  //         },
  //       });
  //     } else if (expandKeys.indexOf(boardType) === -1) {
  //       expandKeys.push(boardType);
  //       this.props.dispatch({
  //         type: 'panelBoard/queryList',
  //         payload: {
  //           expandKeys,
  //           activeKeys,
  //         },
  //       });
  //     }
  //   };
  //   openBoard('EventInfo');
  // }
  // 打开标签页
  cancelSvaeKey = (eventID, key, title) => {
    const { dispatch, tabs } = this.props;
    if (tabs.tabs.find(value => value.key === `/${key}`)) {
      // 关闭tab页
      dispatch({
        type: 'tabs/del',
        payload: { key: `/${key}` },
      }).then(() => {
        const { video1 } = this.props;
        const video = video1;

        const { winHeight } = getBrowserStyle();
        if (this.props.tabs.activeKey.indexOf('homePage') !== -1) {
          // 恢复看板
          dispatch({
            type: 'global/changeRightCollapsed',
            payload: false,
          }).then(() => {
            const { view, extent } = mapConstants;
            if (view.height) {
              view.goTo({ extent }).then(() => {
                getBordStyle(view).then((style) => {
                  dispatch({
                    type: 'accessControl/queryStyle',
                    payload: style,
                  });
                });
              });
            }
          });
          // 恢复视频区
          dispatch({
            type: 'video/reposition',
            payload: {
              CmdCode: '10002',
              Point:
              {
                x: video.position.x,
                y: winHeight - 112 - 30, // 误差为43
              },
            },
          });
          dispatch({
            type: 'video/relayout',
            payload: {
              CmdCode: '10003',
              Layout: 'Transverse',
              WindowCount: '4',
            },
          });
          dispatch({
            type: 'video/resize',
            payload: {
              CmdCode: '10001',
              Size:
              {
                Width: video.size.width,
                Height: '155',
              },
            },
          });
          dispatch({
            type: 'homepage/getVideoFooterHeight',
            payload: 0,
          });
          dispatch({
            type: 'homepage/getMapHeight',
            payload: { domType: 'map' },
          });
        }

        dispatch({
          type: 'emergency/saveEventId',
          payload: {
            eventId: eventID,
            tableId: `/${key}`,
          },
        });
        dispatch({
          type: 'tabs/addTabs',
          payload: { key: `/${key}`, title },
        });
      });
    } else {
      dispatch({
        type: 'emergency/saveEventId',
        payload: {
          eventId: eventID,
          tableId: `/${key}`,
        },
      });
      dispatch({
        type: 'tabs/addTabs',
        payload: { key: `/${key}`, title },
      });
    }
    this.openBoardList('EventInfo', '事件信息');
  }
  // 更改事件状态
  confirm = (row, eventStatu, key, title) => {
    const storage = window.localStorage;
    storage.eventID = row.eventID;

    const { dispatch, currentUser } = this.props;
    const { userID } = currentUser.baseUserInfo;
    if (row.eventStatu === 0) {
      dispatch({
        type: 'emergency/updateProcessNode',
        payload: { eventID: row.eventID, eventStatu, userID },
      }).then(() => {
        dispatch({
          type: 'emergency/saveCurrent',
          payload: eventStatu,
        });
        dispatch({
          type: 'emergency/saveViewNode',
          payload: eventStatu,
        });
        dispatch({
          type: 'emergency/selectNodeType',
          payload: { eventID: row.eventID, eventStatu },
        });
        this.cancelSvaeKey(row.eventID, key, title);
      });
    } else {
      this.cancelSvaeKey(row.eventID, key, title);
    }
  };
  onSelectEvent = (value, options) => {
    this.props.saveHeaderSelectText(value);
    const key = 'command/emergencyEvent';
    const title = '应急事件';
    const row = {
      eventID: value,
      eventStatu: parseInt(options.props.title, 0),
    };
    this.confirm(row, 1, key, title);
  };
  onCancelAlarm = () => {
    this.setState({
      showAlarm: false,
    });
  };

  return = () => {
    const { dispatch, videoFooterHeight } = this.props;
    dispatch({
      type: 'tabs/active',
      payload: { key: '/homePage' },
    }).then(() => {
      const { video1 } = this.props;
      const video = video1;
      const { winHeight } = getBrowserStyle();
      // 取消组态图
      dispatch({
        type: 'flow/queryCurrentFlow',
        payload: { show: false, data: {} },
      });
      // 取消设备检测图
      dispatch({
        type: 'homepage/queryDeviceMonitor',
        payload: { show: false, devicesName: '', ctrlResourceType: '' },
      });
      dispatch({
        type: 'flow/queryDeviceMonitor',
        payload: { show: false, ctrlResourceType: '', spaceTime: 0, devicesName: '' },
      });
      //  取消上面两个图的input check
      const inputs1 = document.getElementsByName('EnvMonitor');
      const inputs2 = document.getElementsByName('DeviceMonitor');
      for (const input1 of inputs1) {
        input1.checked = false;
      }
      for (const input1 of inputs2) {
        input1.checked = false;
      }
      // 恢复看板
      if (videoFooterHeight.current !== 0) {
        return false;
      }
      // 恢复看板
      dispatch({
        type: 'global/changeRightCollapsed',
        payload: false,
      }).then(() => {
        const { view, currentExtent, domWarp } = mapConstants;
        if (view.height) {
          view.goTo({ extent: currentExtent }).then(() => {
            getBordStyle(view).then((style) => {
              dispatch({
                type: 'accessControl/queryStyle',
                payload: style,
              });
            });
          });
        }
        const width = domWarp.clientWidth;
        const a = setInterval(() => {
          if (domWarp.clientWidth !== width) {
            clearInterval(a);
            dispatch({
              type: 'video/resize',
              payload: {
                CmdCode: '10001',
                Size:
                                {
                                  // Width: 400, // 误差与边距20
                                  Width: domWarp.clientWidth - 16, // 误差与边距20
                                  Height: video.size.height,
                                },
              },
            }).then(() => {
              dispatch({
                type: 'video/relayout',
                payload: video.layoutCommand,
              });
            });
            dispatch({
              type: 'homepage/getMapHeight',
              payload: { domType: 'map' },
            });
            dispatch({
              type: 'video/switch',
              payload: {
                CmdCode: 'Show',
              },
            });
            const { videoFooterHeight } = this.props;
            dispatch({
              type: 'homepage/getVideoFooterHeight',
              payload: { current: videoFooterHeight.cache, cache: videoFooterHeight.current },
            });
          }
        }, 500);
      });
    });
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  onVisibleChange = (visible) => {
    this.setState({ visible });
  };
  // 改变搜索半径
  handleRadiusChange = (value) => {
    this.props.dispatch({
      type: 'map/centerRadius',
      payload: Number(value),
    });
  };
  handleMapLinkChange = (value) => {
    this.props.dispatch({
      type: 'alarm/linkMap',
      payload: Number(value),
    });
  };
    handleMin = () => {
      this.props.dispatch({
        type: 'video/devTools',
        payload: { CmdCode: 'MIN' },
      });
    };
    handleClose = () => {
      const that = this;
      confirm({
        title: '请确认',
        content: '将关闭窗口',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.props.dispatch({
            type: 'video/devTools',
            payload: { CmdCode: 'EXIT' },
          });
        },
      });
    };
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
      const event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      window.dispatchEvent(event);
    }
  render() {
    const {
      currentUser,
      isMobile,
      logo, onChangeSwitch, boolean, skValue, onClickQuit, alarmCount, majorList,
      undoneEventList, selcetText,
    } = this.props;
    const menu = (
      <div style={{ width: '180px' }}>
        <div className={styles.controlIcon}>用户名称:<span>{currentUser.loginAccount}</span></div>
        <div className={styles.controlIcon}>人员姓名:<span>{currentUser.baseUserInfo.userName}</span></div>
        <div className={styles.controlIcon}>所属部门:<span>{currentUser.baseUserInfo.orgnizationName}</span></div>
        <div className={styles.quit}>
          <Button onClick={onClickQuit}>退出</Button>
        </div>
      </div>
    );
    const menuControl = (
      <div style={{ width: '180px' }}>
        <div className={styles.controlIcon}>
          <div>重点关注</div>
          <Switch size="small" checkedChildren="开" unCheckedChildren="关" defaultChecked onChange={onChangeSwitch} checked={boolean} />
        </div>
        <div className={styles.controlIcon}>
          <div>滚动速率</div>
          <div className={styles.controlUl}>
            <div className={styles.ontrolList}>
              <div key="sk1" onClick={() => this.props.onClickSpeed('sk1')} className={skValue === 'sk1' ? styles.skBack : null}>慢</div>
              <div key="sk2" onClick={() => this.props.onClickSpeed('sk2')} className={skValue === 'sk2' ? styles.skBack : null}>中</div>
              <div key="sk3" onClick={() => this.props.onClickSpeed('sk3')} className={skValue === 'sk3' ? styles.skBack : null}>快</div>
            </div>
          </div>
        </div>
        {/* <div className={styles.controlIcon}> */}
        {/* <div>地图显示</div> */}
        {/* <div> */}
        {/* <Select defaultValue="1" className={styles.selectStyle} getPopupContainer={triggerNode => triggerNode.parentNode} onChange={this.handleChange} > */}
        {/* <Option value="1" title="默认显示报警总览地图">报警总览地图</Option> */}
        {/* <Option value="2" title="默认显示上次退出登陆时的地图">上次退出登陆时的地图</Option> */}
        {/* </Select> */}
        {/* </div> */}
        {/* </div> */}
        <div className={styles.controlIcon}>
          <div>报警定位</div>
          <div>
            <Select defaultValue="0" className={styles.selectStyle} getPopupContainer={triggerNode => triggerNode.parentNode} onChange={this.handleMapLinkChange} >
              <Option value="0" title="自动定位">自动定位</Option>
              {/* <Option value="1" title="在显示时报警总览图时，保持报警总览">在显示时报警总览图时，保持报警总览</Option> */}
              <Option value="2" title="不定位">不定位</Option>
            </Select>
          </div>
        </div>
        {/* <div className={styles.controlIcon}> */}
        {/* <div>视频定位</div> */}
        {/* <div> */}
        {/* <Select defaultValue="1" className={styles.selectStyle} getPopupContainer={triggerNode => triggerNode.parentNode} onSelect={this.handleChange}> */}
        {/* <Option value="1" title="系统按设置自动执行视频联动，打开关联视频">系统按设置自动执行视频联动，打开关联视频</Option> */}
        {/* <Option value="2" title="暂停视频联动，不打开关联视频">暂停视频联动，不打开关联视频</Option> */}
        {/* </Select> */}
        {/* </div> */}
        {/* </div> */}
        <div className={styles.controlIcon}>
          <div>搜索资源半径</div>
          <div>
            <Select defaultValue="50" className={styles.selectStyle} getPopupContainer={triggerNode => triggerNode.parentNode} onSelect={this.handleRadiusChange}>
              <Option value="50" title="50米">50米</Option>
              <Option value="100" title="100米">100米</Option>
              <Option value="150" title="150米">150米</Option>
              <Option value="200" title="200米">200米</Option>
            </Select>
          </div>
        </div>
      </div >
    );

    const everydayWork = (
      majorList.list ? (
        <div style={{ width: 320 }}>
          <h2 className={styles.everydayTitle}>重点关注</h2>
          <div className={styles.everydaytime}>{moment().format('YYYY-MM-DD')}</div>
          <div className={styles.everydayList}>
            {
              majorList.list.data.map((item) => {
                return item.statu === 1 ? <div key={item.concernID}><div>{`${item.sortIndex}：`}</div><div>{`${item.content}`}</div></div> : null;
              })
            }
          </div>
        </div>
      ) : ''
    );
    const majorLength = majorList.list ? majorList.list.data.filter(item => item.statu === 1).length : 0;
    return (
      <div className={styles.header}>
        {isMobile && (
          [
            (
              <Link to="/" className={styles.logo} key="logo">
                <img src={logo} alt="logo" width="32" />
              </Link>
            ),
            <Divider type="vertical" key="line" />,
          ]
        )}
        <Link to="/" className={styles.logo} key="logo">
          <img src={logo} alt="logo" width="32" />
          {/* <span>安全生产应急指挥系统</span> */}
        </Link>
        <div className={styles.right}>
          <Tooltip placement="bottom" title="返回首页">
            <span className={styles.showBack}>
              <Icon type="home" className={styles.pointIcon} onClick={this.return} />
            </span>
          </Tooltip>
          <Tooltip placement="bottom" title="手动报警">
            <span className={styles.showBack}>
              <Icon type="form" className={styles.pointIcon} onClick={this.onHandAlarmDeal} />
            </span>
          </Tooltip>

          <Select
            placeholder="请选择应急事件"
            size="small"
            dropdownMatchSelectWidth={false}
            onChange={this.onSelectEvent}
            value={selcetText}
            style={{ marginRight: 6, width: 120 }}
          >
            {
              undoneEventList.map(item => (
                <Option title={`${item.eventStatu}`} key={`${item.eventID}`} value={`${item.eventID}`}>{item.eventName}</Option>
              ))
            }
          </Select>

          <Modal
            style={{ position: 'absolute', left: 260 }}
            title="手动报警"
            visible={this.state.showAlarm}
            onOk={this.onHandAlarm}
            onCancel={this.onCancelAlarm}
            mask={false}
            width="80%"
          >
            <HandAlarmDeal form={this.props.form} />
          </Modal>
          <Weather />
          <Popover placement="bottomRight" content={everydayWork} >
            <span className={styles.showBack} onClick={() => { onChangeSwitch(true); }}>
              <Badge count={majorList.list ? majorLength : ''} offset={[-8, -3]} style={{ height: 20, backgroundColor: '#2fc5a1', border: 0 }}>
                <img src={majorIcon} alt="major" className={styles.pointIcon} />
              </Badge>
            </span>
          </Popover>
          <Tooltip placement="bottom" title="当前报警列表">
            <span className={styles.showBack}>
              <Badge count={alarmCount} offset={[0, 0]} >
                <img src={alarmIcon} alt="alarm" style={{ width: 24 }} className={styles.pointIcon} onClick={() => { this.openBoardList('AlarmList', '当前报警列表'); }} />
              </Badge>
            </span>
          </Tooltip>
          {currentUser.loginAccount ? (
            <span>
              <Popover placement="bottomRight" content={menu} overlayClassName={styles.pop} trigger="click">
                <Tooltip placement="bottom" title="用户信息">
                  <span className={`${styles.action} ${styles.account}`}>
                    <img src={userIcon} alt="user" className={styles.userIcon} />
                    <span className={styles.name}>{currentUser.loginAccount}</span>
                  </span>
                </Tooltip>
              </Popover>
              <Popover placement="bottomRight" trigger="click" style={{ background: 'red' }} overlayClassName={styles.pop} visible={this.state.visible} onVisibleChange={this.onVisibleChange} content={menuControl} >
                <Tooltip placement="bottom" title="设置">
                  <span className={styles.showBack}>
                    <img src={settingIcon} alt="setting" className={styles.pointIcon} onClick={this.onIfCloseToggle} />
                  </span>
                </Tooltip>
              </Popover>
            </span>
          ) : <Spin size="small" style={{ marginLeft: 8 }} />}
          {/* <Popover placement="bottomRight" trigger="click" style={{ background: 'red' }} overlayClassName={styles.pop} visible={this.state.visible} onVisibleChange={this.onVisibleChange} content={menuControl} > */}
          <Tooltip placement="bottom" title="最小化">
            <span className={styles.minWarp}>
              {/* <img src={settingIcon} alt="setting" className={styles.pointIcon} onClick={this.onIfCloseToggle} /> */}
              <Icon className={styles.close} type="minus" style={{ fontSize: 20, color: '#fff', fontWeight: 800 }} onClick={this.handleMin} />
            </span>
          </Tooltip>
          <Tooltip placement="bottom" title="关闭">
            <span className={styles.closeWarp}>
              {/* <img src={settingIcon} alt="setting" className={styles.pointIcon} onClick={this.onIfCloseToggle} /> */}
              <Icon className={styles.close} type="close" style={{ fontSize: 20, color: '#fff', fontWeight: 800 }} onClick={this.handleClose} />
            </span>
          </Tooltip>


        </div>
      </div>
    );
  }
}
