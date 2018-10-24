import React, { PureComponent } from 'react';
import { Socket } from '../../utils/Socket';

export default class Webscoket extends PureComponent {
  componentDidMount() {
    const { onmessage, socketUrl, currentUser } = this.props;
    console.log('socketUrl', socketUrl);
    console.log('onmessage', onmessage);
    const socket = new Socket({ onmessage, socketUrl, currentUser });
  }
  render() {
    return (null);
  }
}

// const Webscoket = ({ onmessage, socketUrl, currentUser }) => {
//   // console.log(onmessage);
//   const socket = new Socket({ onmessage, socketUrl, currentUser });
//   return (
//     ''
//   );
// };
// export default connect()(Webscoket);
