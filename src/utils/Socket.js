import Sockette from 'sockette';
// import fetch from 'dva/fetch';

const Socket = ({ onmessage, currentUser }) => {
  // console.log('currentUser', currentUser.baseUserInfo.userID);
  if (window.serviceUrl.socketUrl !== '') {
  const id = (Math.ceil(currentUser.baseUserInfo.userID *Math.random() * 100 * Math.random() * 10));
  return new Sockette(`${window.serviceUrl.socketUrl}websocket?${id}`, {
  // return new Sockette(`ws://10.157.24.41:8088/websocket?${id}`, {
    timeout: 5e3,
    maxAttempts: 10,
    onmessage,
  });
  }
};

const SocketVideo = ({ onmessage }) => {
  const start = 10000; const end = 10050;
  const wsSrc = 'ws://127.0.0.1:';
  let socket;
  let loopIndex = 0;
  const array = [];
  let index = -1;
  let isConnect = false;
  const getArray = (num) => {
    index += 1;
    if (index <= num) {
      array.push(index);
      getArray(num);
    }
  };
  let range = 0;
  // const onerror = (e) => {
  //   e.target.close();
  // };
  const onopen = (e) => {
    isConnect = true;
    SocketVideo.socket = e.target;
  };
  let port = start;
  const findSocket = () => {
    array.splice(0, array.length);
    getArray(range);
    loopIndex += 1;
    for (const item of array) {
      port = start + item;
      if (isConnect === true || port > end) {
        break;
      }
      // let response = await fetch(url)
      // const a = () => {
      //   return fetch('http://192.168.0.7:4000/system/login').then(checkStatus);
      // };
      // a();
      // const a = jsonpFetch(`${httpSrc + port}`);
      // a.then(res => {
      //   console.log(res)
      // })
      //   const newPort = port;
      //   fetch(`${httpSrc + newPort}`, { mode: "no-cors"}).then((res) => {
      // createSocket(newPort);
      //   });
      socket = new WebSocket(`${wsSrc + port}`);
      socket.onerror = onerror;
      socket.onmessage = onmessage;
      socket.onopen = onopen;
      // socket = new Sockette(`${src + port}`, {
      //   timeout: 10,
      //   onerror,
      //   onmessage,
      //   onopen,
      // });
    }
    setTimeout(() => {
      if (!isConnect && loopIndex < 5) {
        range = 10;
        findSocket();
      }
    }, 1000);
  };
  range = 10;
  findSocket();
  return socket;
};
export { Socket, SocketVideo };
