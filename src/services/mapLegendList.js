const imgArray = [
  '放射源',
  '感温探测器',
  '感烟探测器',
  '工业视频',
  '扩音对讲',
  '红外对射',
  '呼吸机',
  '火炬',
  '可燃气体探测设备',
  '火焰探测器',
  '空气呼吸机',
  '门禁',
  '泡沫泵',
  '泡沫炮',
  '手动报警按钮',
  '手提式',
  '推车式',
  '污水泵',
  '消防水泵',
  '消防水炮',
  '消火栓',
  '有毒气体',
  '重大危险源',
];

const createList = () => {
  const mapLegendListWithAlarm = [];
  for (const name of imgArray) {
    let index = 0;
    while (index < 5) {
      index += 1;
      const newName = name + index;
      try {
        const newItem = require(`../assets/map/lengend/${newName}.png`);
        if (newItem) {
          mapLegendListWithAlarm.push({ name: newName, url: newItem });
        }
      } catch (e) {

      }
    }
  }
  const cacheArray1 = [];
    const cacheArray2 = [];
  for (const name of imgArray) {
    try {
      const item = require(`../assets/map/lengend/${name}.png`);
      if (item) {
        const item1 = mapLegendListWithAlarm.find(value => value.name === name + 1);
        if (item1) {
            cacheArray1.push({ name, url: item });
        } else {
            cacheArray2.push({ name, url: item });
        }
      }
    } catch (e) {

    }
  }
  const mapLegendList = cacheArray1.concat(cacheArray2);
  // 按颜色排个序
  return { mapLegendList, mapLegendListWithAlarm };
};

const { mapLegendList, mapLegendListWithAlarm } = createList();

export { mapLegendList, mapLegendListWithAlarm };
