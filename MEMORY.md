# MEMORY.md - 长期记忆

## 关键坐标

### 服务器
- 腾讯云 49.51.194.118, OpenCloudOS 9.4, 60G磁盘
- nginx 8080端口: /v2/ → /var/www/bess-v2/
- JS/CSS 30天缓存, HTML no-cache, gzip_static on
- FileBrowser: /files/ → /root/filecloud/

### 版本管理
- 备份目录: /root/backups/v2-releases/
- 回滚脚本: /root/backups/v2-releases/rollback.sh
- 当前版本: v1.0-20260303-1054

## 性能优化记录 (2026-03-03)

- 移除3个死API（Google/高德/百度地图，placeholder key导致10s超时）
- Leaflet本地化到 vendor/ 目录
- 所有大文件预压缩 .gz (echarts -68%, i18n -81%)
- station.html去掉echarts和leaflet（列表页不需要）
- 公共组件合并为 js/components-bundle.js
- 卫星地图从ArcGIS换成Google瓦片
- Mock电站从128个减到7个

## 教训

- **Sonnet不要写复杂代码** — 菜单系统连续崩溃的根因
- **不要在workspace堆文件** — 测试文件、报告文件用完即删
- **改动最小化** — 能改3行别改30行，改多了容易出新bug
- **Gemini方案要翻译** — 不能直接转发，要提取为具体操作指令
- **session会膨胀** — 超500条记录性能会崩，注意控制
