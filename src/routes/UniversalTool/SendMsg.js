import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select } from 'antd';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@connect(({ template, userList, sendMsg, tabs, sysFunction }) => ({
  template,
  userList,
  sendMsg,
  tabs,
  sysFunction,
}))
@Form.create()
export default class TableList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // 请求搜索的账户类型
    dispatch({
      type: 'template/fetch',
      payload: '',
    });
    dispatch({
      type: 'userList/fetch',
    });
  }

  doAdd = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'sendMsg/add',
        payload: fieldsValue,
      }).then(() => {
        const { tabs, sysFunction } = this.props;
        const { currentFunctions } = sysFunction;
        const key = 'tools/history';
        const list = currentFunctions;
        if (tabs.tabs.find(value => value.key === `/${key}`)) {
          this.props.dispatch({
            type: 'tabs/active',
            payload: { key: `/${key}` },
          });
        } else {
          this.props.dispatch({
            type: 'tabs/add',
            payload: { key: `/${key}`, list },
          });
        }
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { templateList } = this.props.template;
    const { list } = this.props.userList;
    return (
      <div className={styles.sedMsg}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label="短信模板"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 12 }}
          >
            {getFieldDecorator('gender', {
            rules: [{ required: true, message: '短信模板不能为空' }],
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              <Option value="">请选择</Option>
              {templateList.map(type => (
                <Option
                  key={type.shortMsgTemplateID}
                  value={type.templateTitle}
                >{type.templateTitle}
                </Option>
              ))}
            </Select>
          )
          }
          </FormItem>
          <FormItem
            label="接收人"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 12 }}
          >
            {getFieldDecorator('acceptNumber', {
            rules: [{ required: true, message: '该用户没有电话号码' }],
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              <Option value="">请选择</Option>
              {list.map(type => (
                <Option
                  key={type.userID}
                  value={type.mobile}
                >{type.userName}
                </Option>
              ))}
            </Select>
          )
          }
          </FormItem>
          <FormItem
            label="短信内容"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 12 }}
          >
            {getFieldDecorator('msgContent', {
            rules: [{ required: true, message: '短信内容不能为空' }],
          })(
            <TextArea />
          )}
          </FormItem>
          <FormItem
            wrapperCol={{ span: 12, offset: 5 }}
          >
            <Button icon="export" type="primary" onClick={() => this.doAdd()}>
            确定
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
