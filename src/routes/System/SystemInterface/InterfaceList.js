import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Form, Select, Table } from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './TableList.less';
import { commonData } from '../../../../mock/commonData';

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const columns = [
  { title: '接口名', width: '15%', dataIndex: 'pluginCaption', key: 'pluginCaption' },
  { title: '接口编码', width: '10%', dataIndex: 'pluginCode', key: 'pluginCode' },
  { title: '接口状态', width: '10%', dataIndex: 'pluginState', key: 'pluginState', render: text => (text === 1 ? '启用' : '未启用') },
  { title: '接口来源', width: '60%', dataIndex: 'remark', key: 'remark' },
];

@connect(({ userList, system }) => ({
  userList,
  system,
  pluginList: system.pluginList,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
  };
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/fetch',
    });
  }

  render() {
    const { loading } = this.props;
    return (
      <PageHeaderLayout title="系统接口列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <Table
              loading={loading}
              dataSource={this.props.pluginList}
              columns={columns}
              pagination={{
                pageSize: 8,
              }}
              rowKey={record => record.pluginID}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
