import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Form, Select } from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './TableList.less';
import { commonData } from '../../../../mock/commonData';

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const columns = [
  { title: '接口名', dataIndex: 'name', key: 'name' },
  { title: '接口状态', dataIndex: 'status', key: 'status' },
];

@connect(({ userList, typeCode, organization }) => ({
  userList,
  typeCode,
  organization,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
  };
  componentDidMount() {
    const { dispatch } = this.props;
    this.page(commonData.pageInitial);
  }
  // 获取分页数据
  page = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userList/page',
      payload: page,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      // params.sorter = `${sorter.field}_${sorter.order}`;
      const { field, order } = sorter;
      params.sorter = { field, order };
    }

    dispatch({
      type: 'userList/page',
      payload: params,
    });
  };
  render() {
    const { loading } = this.props;
    return (
      <PageHeaderLayout title="系统接口列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={[]}
              loading={loading}
              data={{ data: [], pagination: {} }}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="userID"
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
