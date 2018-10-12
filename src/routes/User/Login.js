import React, { Component } from 'react';
import { connect } from 'dva';
// import $ from 'jquery';
import { Alert, Modal } from 'antd';
import MD5 from 'crypto-js/md5';
import Login from '../../components/Login';
import styles from './Login.less';
import { switchCode } from '../../services/statusCode';
import VideoSocket from '../Websocket/VideoSocket';

const { UserName, Password, Submit } = Login;
const close = document.getElementById('close');
// const jsEncrypt = new window.JSEncrypt();
@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
  };
  componentDidMount() {
    close.addEventListener('click', () => {
      const that = this;
      Modal.confirm({
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
    });
    // 请求公钥
    // $.ajax('/local/getPubKey').then((pubKey) => {
    //   jsEncrypt.setPublicKey(pubKey);
    //   // const obj = {
    //   //   login: 'admin',
    //   //   password: jsEncrypt.encrypt('admin123321'),
    //   // };
    //   // console.log('obj', obj);
    //   // $.post('/local/login', obj).then((res1) => {
    //   //   console.log('res1', res1);
    //   // });
    // });
  }
  // 处理视频插件的通讯
  onmessage1 = ({ data }) => {
    const { dispatch } = this.props;
    if (data === 'Avengers') {
      dispatch({
        type: 'video/getLoaded',
        payload: true,
      });
    }
  };
  handleSubmit = (err, values) => {
    values.password = MD5(values.password).toString();
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
        },
      }).then(() => {
        close.style.zIndex = -1;
      });
    }
    // const obj = {
    //   login: 'admin',
    //   password: jsEncrypt.encrypt(values.password),
    // };
    // console.log('obj', obj);
    // $.post('/local/login', obj).then((res1) => {
    //   console.log('res1', res1);
    // });
  };

  renderMessage = (content) => {
    return (
      <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
    );
  };

  render() {
    const { login, submitting } = this.props;
    const msg = switchCode(login.code);
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
        >

          <VideoSocket onmessage={this.onmessage1} />
          <div key="account" tab="用户登录">
            {
              login.code !== undefined &&
              login.code !== '' &&
              login.code !== 1001 &&
              !login.submitting &&
              this.renderMessage(msg)
            }
            <div className={styles.loginTitle}>用户登录</div>
            <UserName name="login" placeholder="请输入用户名" />
            <Password name="password" placeholder="请输入密码" />
          </div>
          <div>
          </div>
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}
