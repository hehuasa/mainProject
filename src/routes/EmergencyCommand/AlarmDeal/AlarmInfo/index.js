import React, { PureComponent } from 'react';
// import { connect } from 'dva';
// import Draggable from 'react-draggable';
import { Form, Tabs } from 'antd';
import AlarmEventInfo from './AlarmEventInfo';
import Footer from '../Footer/index';
import AddTemplate from '../AddTemplate/index';

// const { TabPane } = Tabs;
// const FormItem = Form.Item;
@Form.create()

export default class AlarmInfo extends PureComponent {
  componentDidMount() {
    const { alarmId } = this.props.alarmInfo;
    if (alarmId) {
      this.props.dispatch({
        type: 'alarmDeal/getAlarmConten',
        payload: {
          alarmId,
        },
      });
    }
  }

  render() {
    const { form, save, cancel, alarmDeal, isEvent, onChange } = this.props;
    return (
      <div>
        <AlarmEventInfo isEvent={isEvent} alarmInfoConten={alarmDeal.alarmInfoConten} form={form} />
        { isEvent ? <AddTemplate casualtiesData={alarmDeal.alarmInfoConten.casualtys} form={form} /> : null}
        <Footer save={() => save(form, 1)} cancel={cancel} onChange={onChange} />
      </div>
    );
  }
}
