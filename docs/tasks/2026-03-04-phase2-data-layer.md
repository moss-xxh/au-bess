# 阶段2：数据基建与Dashboard概览骨架
## 日期: 2026-03-04
## 状态: 执行中

## 核心决策
- 不装Axios，纯Promise封装
- 继承v2的电站数据模型（NEM区域、真实电站名）
- 不加假延迟，直接同步返回mock
- 禁止引入ECharts
- Owner看全量，Operator看分配的电站
