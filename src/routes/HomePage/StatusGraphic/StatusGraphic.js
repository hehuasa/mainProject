import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import styles from './index.less';
import { registerNode } from '../../FlowEditor/lib/customResgister';

registerNode(); // 注册节点
const { G6 } = window;
const editor = { net: {} };

let timer; // 定时器id
let currentResourceID;
@connect(({ flow, homepage, sysFunction }) => {
  return {
    currentFlow: flow.currentFlow,
    GraphiceDatas: flow.GraphiceDatas,
    mapHeight: homepage.mapHeight,
    ztreeObj: sysFunction.ztreeObj,
  };
})
export default class StatusGraphic extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }
  componentDidMount() {
    setTimeout(() => {
      editor.net = new G6.Net({
        container: this.flow,
        mode: 'drag',
        forceFit: true,
        fitView: 'autoZoom',
        // width: 1200,
        height: this.props.mapHeight,
        grid: null,
      });
      const { currentFlow } = this.props;
      const data = JSON.parse(currentFlow.data.graphicsContent);

      const newNodes = [];
      const newEdges = [];
      for (const edge of data.source.edges) {
        let isAdd = true;
        if (edge.controlPoints) {
          for (const item of edge.controlPoints) {
            if (parseFloat(item.x) > 5000 || parseFloat(item.y) > 5000) {
              isAdd = false;
            }
          }
        }

        if (isAdd) {
          newEdges.push(edge);
        }
      }
      for (const node of data.source.nodes) {
        if (Math.abs(parseFloat(node.x)) < 5000 && Math.abs(parseFloat(node.y)) < 5000) {
          if (node.quotaValue) {
            node.quotaValue = '/';
          }
          newNodes.push(node);
        } else if (newEdges.find(value => value.source === node.id) || newEdges.find(value => value.target === node.id)) {
          newNodes.push(node);
        }
      }
      data.source.nodes = newNodes;
      data.source.edges = newEdges;
      editor.net.source(data.source);
      editor.net.render();
      // editor.net.autoZoom();
      currentResourceID = this.props.currentFlow.data.resourceID;
      this.props.dispatch({
        type: 'flow/getGraphiceDatas',
        payload: { resourceID: this.props.currentFlow.data.resourceID },
      }).then(() => {
        for (const node of data.source.nodes) {
          const item = this.props.GraphiceDatas[node.device];
          if (item) {
            node.quotaValue = item.value !== '' ? item.value : '/';
          }
        }
        if (editor.net.destroyed) {
          return false;
        }
        if (currentResourceID === this.props.currentFlow.data.resourceID) {
          editor.net.changeData(data.source);
          // editor.net.refresh();
        }
      });
      timer = setInterval(() => {
        currentResourceID = this.props.currentFlow.data.resourceID;
        this.props.dispatch({
          type: 'flow/getGraphiceDatas',
          payload: { resourceID: this.props.currentFlow.data.resourceID },
        }).then(() => {
          for (const node of data.source.nodes) {
            const item = this.props.GraphiceDatas[node.device];
            if (item) {
              node.quotaValue = item.value !== '' ? item.value : '/';
            }
          }
          if (editor.net.destroyed) {
            return false;
          }
          if (currentResourceID === this.props.currentFlow.data.resourceID) {
            editor.net.changeData(data.source);
            // editor.net.refresh();
          }
        });
      }, 30000);
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(timer);
    editor.net.destroy();
  }
  handleClose() {
    const { ztreeObj, dispatch, currentFlow } = this.props;
    const node = ztreeObj.getNodeByTId(currentFlow.treeNode.tId);
    ztreeObj.selectNode(node);
    // dispatch({
    //   type: 'flow/queryCurrentFlow',
    //   payload: { show: false, data: {} },
    // });
  }
  render() {
    return (
      <div className={styles.warp} style={{ height: this.props.mapHeight }}>
        <div className={styles.close} onClick={this.handleClose}>
          <Icon type="close" style={{ fontSize: 20, color: '#fff', fontWeight: 800 }} />
        </div>
        <div className={styles.canvas} ref={(ref) => { this.flow = ref; }} />
      </div>
    );
  }
}
