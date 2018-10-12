import React, { PureComponent } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';
import styles from './index.less';

// class selfRow extends PureComponent {
//   render() {
//     console.log('props', this.props);
//   }
//     return (
//       <Draggable key={this.props['data-row-key']} draggableId={this.props['data-row-key']} index={this.props['data-row-key']}>
//         {(draggableProvided, DraggableStateSnapshot) => (
//           <tr
//             // className={classnames({
//             //   dragging: DraggableStateSnapshot.isDragging,
//             // })}
//             ref={draggableProvided.innerRef}
//             // isDragging={DraggableStateSnapshot.isDragging}
//             draggable={true}
//             {...draggableProvided.draggableProps}
//             {...draggableProvided.dragHandleProps}
//             {...this.props}
//           />
//         )}
//
//       </Draggable>
//     );
//   }
// }
{ /* <Tables */ }
{ /* // loading={loading} */ }
{ /* rowKey={'concernID'} */ }
{ /* dataSource={data.data} */ }
{ /* // components={components} */ }
{ /* columns={columns} */ }
{ /* /> */ }
// class BodyWrapper extends PureComponent {
//   render() {
//     return (
//       <Droppable droppableId="droppable" >
//         {(droppableProvided, droppableSnapshot) => (
//           <tbody {...this.props} ref={droppableProvided.innerRef} />
//         )}
//       </Droppable>
//
//     );
//   }
// }
class DndTable extends PureComponent {
  render() {
    const { columns, dataSource, rowKey } = this.props;
    return (
      <DragDropContext>
        <div className={classnames('ant-table', 'ant-table-default', 'ant-table-scroll-position-left', 'ant-table-scroll-position-right')}>
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <thead className="ant-table-thead">
                  <tr>
                    { columns.map(item => (
                      <th key={item.dataIndex} width={item.width}>
                        {item.title}
                      </th>
))}
                  </tr>
                </thead>
                <Droppable droppableId="droppable" >
                  {(droppableProvided, droppableSnapshot) => (
                    <tbody
                      ref={droppableProvided.innerRef}
                      {...droppableProvided.droppableProps}
                      className="ant-table-tbody"
                    >
                      { dataSource.map(item => (
                        <Draggable key={item[rowKey]} draggableId={item[rowKey]} index={item[rowKey]}>
                          {(DraggableProvided, DraggableStateSnapshot) => {
                            const { red } = styles;
                            return (
                              <tr
                                className={classnames({
                                            dragging: DraggableStateSnapshot.isDragging,
                                [red]: DraggableStateSnapshot.isDragging,
                                'ant-table-row': true,
                                'ant-table-row-level-0': true,
                                          })}
                                ref={DraggableProvided.innerRef}
                        // isDragging={DraggableStateSnapshot.isDragging}
                                {...DraggableProvided.draggableProps}
                                {...DraggableProvided.dragHandleProps}
                              >
                                { columns.map(item1 => (
                                  <td key={item1.dataIndex} width={item1.width}>
                                    {item1.render ? item1.render(item[item1.dataIndex], item) : item[item1.dataIndex]}
                                  </td>
))}
                              </tr>
                          );
}}
                        </Draggable>
))}
                    </tbody>
                )}


                </Droppable>
              </table>
            </div>
          </div>
        </div>
      </DragDropContext>
    );
  }
}
export { DndTable };
