import React, { PureComponent } from 'react';
import { Select, Table, Tabs, Card, Row, Col, Icon } from 'antd';
import { connect } from 'dva';

import styles from './index.less';

const Option = Select.Option;
const { TabPane } = Tabs;
@connect(({ emergency }) => ({
  planInfoID: emergency.planInfoID,
  planFeatures: emergency.planFeatures,
  planCommand: emergency.planCommand,
  planResource: emergency.planResource,
  planAnnexPage: emergency.planAnnexPage,
  dealCardList: emergency.dealCardList,
  orgAnnexList: emergency.orgAnnexList,
  emgcAnnex: emergency.emgcAnnex,
}))
export default class PlanInfo extends PureComponent {
  componentDidMount() {
    // 通过预案ID 获取处置卡列表 uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
    this.props.dispatch({
      type: 'emergency/getDealCard',
      payload: { planInfoID: this.props.planInfoID, uploadType: 3 },
    });
  }
  tabChange = (activeKey) => {
    const { dispatch, planInfoID } = this.props;
    const { pageNum, pageSize } = this.props.planAnnexPage;
    switch (activeKey) {
      case '1': break;
      case '2': // 组织机构
        this.props.dispatch({
          type: 'emergency/getOrgAnnex',
          payload: { planInfoID: this.props.planInfoID, uploadType: 1 },
        });
        break;
      case '3':
        dispatch({
          type: 'emergency/getFeatures',
          payload: { planInfoID },
        });
        break;
      case '4': // 应急流程
        this.props.dispatch({
          type: 'emergency/getEmgcProcess',
          payload: { planInfoID: this.props.planInfoID, uploadType: 4 },
        });
        break;
      case '5':
        dispatch({
          type: 'emergency/getPlanCommand',
          payload: { planInfoID },
        });
        break;
      case '6':
        dispatch({
          type: 'emergency/getPlanResource',
          payload: { planInfoID },
        });
        break;
      case '7':
        this.page(pageNum, pageSize);
        break;
      case '8':
        this.props.dispatch({
          type: 'emergency/getDealCard',
          payload: { planInfoID, uploadType: 3 },
        });
        break;
      default: break;
    }
  };
  // 预案附件分页数据
  page = (pageNum, pageSize) => {
    const { dispatch, planInfoID } = this.props;
    // uploadType:1 为组织、2为附件、3为处置卡 4.应急流程
    dispatch({
      type: 'emergency/getPlanAnnexPage',
      payload: { pageNum, pageSize, planInfoID, uploadType: 2, isQuery: true, fuzzy: false },
    });
  };
  render() {
    const { planInfo, planFeatures, planCommand, planResource } = this.props;
    // 实施方案 基本信息表头
    const columns = [
      {
        title: '预案编号',
        dataIndex: 'userPlanCode',
        width: 100,
        key: 'userPlanCode',
      }, {
        title: '预案名称',
        dataIndex: 'planName',
        width: 100,
        key: 'planName',
      }, {
        title: '预案类别',
        dataIndex: 'planType',
        width: 100,
        key: 'planType',
      }, {
        title: '预案等级',
        dataIndex: 'planLevelID',
        width: 100,
        key: 'planLevelID',
      }, {
        title: '适用对象',
        children: [
          {
            title: '名称',
            dataIndex: 'objName',
            key: 'objName',
            width: 100,
          }, {
            title: '编号',
            dataIndex: 'objCode',
            key: 'objCode',
            width: 100,
          },
        ],
      }, {
        title: '预案版本',
        dataIndex: 'version',
        width: 100,
        key: 'version',
      }, {
        title: '编写部门',
        dataIndex: 'baseOrganization',
        width: 100,
        key: 'baseOrganization',
        render: (text) => {
          return text ? text.orgnizationName : '';
        },
      }, {
        title: '直接匹配特征',
        dataIndex: 'future',
        width: 100,
        key: 'future',
      },
    ];
    // 实施方案 事件特征表头
    const featureCols = [
      {
        title: '特征编号',
        dataIndex: 'featureCode',
        width: 100,
        key: 'featureCode',
        render: (text, record) => {
          return record.planFeatureInfo.featureCode || '';
        },
      }, {
        title: '特征类型',
        dataIndex: 'featureTypeName',
        width: 100,
        key: 'featureTypeName',
      }, {
        title: '特征名称',
        dataIndex: 'featureName',
        width: 120,
        key: 'featureName',
        render: (text, record) => {
          return record.planFeatureInfo.featureName || '';
        },
      }, {
        title: '规则',
        dataIndex: 'featureExpresstion',
        width: 80,
        key: 'featureExpresstion',
      }, {
        title: '特征值',
        dataIndex: 'featureValue',
        width: 80,
        key: 'featureValue',
      }, {
        title: '单位',
        dataIndex: 'featureUnit',
        width: 80,
        key: 'featureUnit',
        render: (text, record) => {
          return record.planFeatureInfo.featureUnit || '';
        },
      }, {
        title: '权重',
        dataIndex: 'weight',
        width: 80,
        key: 'weight',
      }, {
        title: '特征描述',
        dataIndex: 'featureDes',
        width: 200,
        key: 'featureDes',
        render: (text, record) => {
          return record.planFeatureInfo.featureDes || '';
        },
      }];
    // 实施方案 预案指令表头
    const commandCols = [
      {
        title: '流程节点',
        dataIndex: 'nodeName',
        width: 100,
        key: 'nodeName',
        render: (text, record) => {
          return record.planFlowNode.nodeName || '';
        },
      }, {
        title: '指令分类',
        dataIndex: 'commandType',
        width: 100,
        key: 'commandType',
      }, {
        title: '指令内容',
        dataIndex: 'commandContent',
        width: 200,
        key: 'commandContent',
      }, {
        title: '执行岗位',
        dataIndex: 'excutePostionList',
        width: 120,
        key: 'excutePostionList',
        render: (text) => {
          let str = '';
          if (text && text.length > 0) {
            text.forEach((item, index) => {
              if (index !== text.length - 1) {
                str = `${str + item.postionName}, `;
              } else {
                str += item.postionName;
              }
            });
          }
          return str;
        },
      }, {
        title: '执行时长',
        dataIndex: 'executeTime',
        width: 100,
        key: 'executeTime',
      }, {
        title: '注意事项',
        dataIndex: 'attention',
        width: 200,
        key: 'attention',
      }];
    // 实施方案 应急资源表头
    const resourceCols = [
      {
        title: '资源编号',
        dataIndex: 'resourceCode',
        width: 100,
        key: 'resourceCode',
        render: (text, record) => {
          return record.resResourceInfo ? record.resResourceInfo.resourceCode :
            (record.resToolMaterialInfo ? record.resToolMaterialInfo.materialCode : '');
        },
      }, {
        title: '资源名称',
        dataIndex: 'resourceName',
        width: 100,
        key: 'resourceName',
        render: (text, record) => {
          return record.resResourceInfo ? record.resResourceInfo.resourceName :
            (record.resToolMaterialInfo ? record.resToolMaterialInfo.materialName : '');
        },
      }, {
        title: '规格型号',
        dataIndex: 'type',
        width: 120,
        key: 'type',
        render: (text, record) => {
          return record.resToolMaterialInfo ? record.resToolMaterialInfo.model : '';
        },
      }, {
        title: '功能',
        dataIndex: 'function',
        width: 120,
        key: 'function',
      }, {
        title: '数量',
        dataIndex: 'useCount',
        width: 80,
        key: 'useCount',
      }, {
        title: '存放地点',
        dataIndex: 'savePlace',
        width: 120,
        key: 'savePlace',
        render: (text, record) => {
          return record.resToolMaterialInfo ? record.resToolMaterialInfo.savePlace : '';
        },
      }, {
        title: '保管人',
        dataIndex: 'userID',
        width: 100,
        key: 'userID',
        render: (text, record) => {
          return record.resToolMaterialInfo ?
            (record.resToolMaterialInfo.baseUserInfo ?
              record.resToolMaterialInfo.baseUserInfo.userName : '') : '';
        },
      }, {
        title: '备注',
        dataIndex: 'remark',
        width: 200,
        key: 'attention',
        render: (text, record) => {
          return record.resToolMaterialInfo ? record.resToolMaterialInfo.remark : '';
        },
      }];
    // 实施方案 预案附件
    const annexCols = [
      {
        title: '附件名称',
        dataIndex: 'annexName',
        width: '40%',
        key: 'annexName',
        render: (text, record) => {
          return record.resArchiveInfo ? record.resArchiveInfo.fileName : '';
        },
      }, {
        title: '操作',
        width: '20%',
        key: 'action',
        render: (text, record) => (
          <span>
            <a
              href={`/upload/${record.resArchiveInfo.savePath}`}
              download={record.resArchiveInfo.fileName}
            >下载
            </a>
          </span>
        ),
      }];
    const data = [{}, {}, {}, {}];
    return (
      <div className={styles.planInfo}>
        <Tabs tabPosition="left" defaultActiveKey="8" onChange={this.tabChange}>
          <TabPane tab="基本信息" key="1">
            <Card title="基本信息">
              <Table columns={columns} dataSource={[planInfo]} scroll={{ x: 1200 }} />
            </Card>
          </TabPane>
          <TabPane tab="应急组织" key="2">
            <Card title="组织机构">
              <div className={styles.cardExtra}>
                <Row gutter={16}>
                  {this.props.orgAnnexList.map((card, index) => {
                    return (
                      <Col span={8}>
                        <Card
                          title={card.resArchiveInfo.fileName}
                          style={{ marginBottom: 8 }}
                        >
                          <img
                            className={styles.picture}
                            alt="加载失败"
                            src={`/upload/${card.resArchiveInfo.savePath}`}
                          />
                        </Card>
                      </Col>
                    );
                  })
                  }
                </Row>
              </div>
            </Card>
          </TabPane>
          <TabPane tab="事件特征" key="3">
            <Card title="事件特征" style={{ }}>
              <Table columns={featureCols} pagination={{ pageSize: 5 }} dataSource={planFeatures} scroll={{ x: 1200 }} />
            </Card>
          </TabPane>
          <TabPane tab="应急流程" key="4">
            <Card title="应急流程">
              <div className={styles.cardExtra}>
                <Row gutter={16}>
                  {this.props.emgcAnnex.map((card, index) => {
                    return (
                      <Col span={24}>
                        <Card
                          title={card.resArchiveInfo.fileName}
                          style={{ marginBottom: 8 }}
                        >
                          <div className={styles.pictureList}>
                            <img
                              className={styles.picture}
                              alt="加载失败"
                              src={`/upload/${card.resArchiveInfo.savePath}`}
                            />
                          </div>
                        </Card>
                      </Col>
                    );
                  })
                  }
                </Row>
              </div>
            </Card>
          </TabPane>
          <TabPane tab="预案指令" key="5">
            <Card title="预案指令" style={{ }}>
              <Table columns={commandCols}  pagination={{ pageSize: 5 }} dataSource={planCommand} scroll={{ x: 1200 }} />
            </Card>
          </TabPane>
          <TabPane tab="应急资源" key="6">
            <Card title="应急资源" style={{ }}>
              <Table columns={resourceCols}  pagination={{ pageSize: 5 }} dataSource={planResource} scroll={{ x: 1200 }} />
            </Card>
          </TabPane>
          <TabPane tab="预案附件" key="7">
            <Card title="预案附件" style={{ }}>
              <Table
                columns={annexCols}
                dataSource={this.props.planAnnexPage.result}
                pagination={{
                  pageSize: this.props.planAnnexPage.pageSize,
                  current: this.props.planAnnexPage.pageNum,
                  total: this.props.planAnnexPage.total,
                  onChange: this.page,
                }}
              />
            </Card>
          </TabPane>
          <TabPane tab="处置卡" key="8">
            <Card title="处置卡信息">
              <div className={styles.cardExtra}>
                <Row gutter={16}>
                  {this.props.dealCardList.map((card, index) => {
                    return (
                      <Col span={8}>
                        <Card
                          title={card.resArchiveInfo.fileName}
                          style={{ marginBottom: 8 }}
                        >
                          <img
                            className={styles.picture}
                            alt="加载失败"
                            src={`/upload/${card.resArchiveInfo.savePath}`}
                          />
                        </Card>
                      </Col>
                    );
                  })
                  }
                </Row>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
