import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Checkbox } from 'antd';
import styles from './index.less';

export default class Footer extends PureComponent {
  render() {
    const { save, cancel, onChange } = this.props;
    return (
      <div className={styles.footer}>
        <Button onClick={save} type="primary">保存</Button>
        <Button onClick={cancel}>取消</Button>
        <Checkbox onChange={onChange}>应急演练</Checkbox>
      </div>
    );
  }
}
