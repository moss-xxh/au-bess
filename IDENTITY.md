# IDENTITY.md - 澳洲储能项目

## 项目: AU-BESS (澳洲储能电站管理系统)

- **商业模式**: 业主建电站 → 运维方租赁运营 → 峰谷套利
- **角色**: 业主(owner) = 全权限, 运维(operator) = 受限权限
- **当前阶段**: 前端Demo，纯静态，无后端

## 技术栈

- 纯 HTML/CSS/JavaScript（无框架）
- localStorage 模拟数据
- Leaflet 地图 + ECharts 图表
- i18n 中英双语

## 关键路径

| 项 | 路径 |
|---|---|
| 开发目录 | `/root/projects/aus-energy/` |
| 部署目录 | `/var/www/bess-v2/` |
| Git仓库 | `github.com/moss-xxh/au-bess.git` |
| GitHub Pages | `x1354028165/AU-05` |
| 服务器 | 49.51.194.118:8080/v2/ |
| nginx配置 | `/etc/nginx/conf.d/bess.conf` |
| Chromium | `~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome` |

## 部署流程

1. 在 `/root/projects/aus-energy/` 或 `/var/www/bess-v2/` 修改
2. 修改后 gzip 压缩：`gzip -k -f -9 <file>`
3. 设置权限：`chown -R nginx:nginx /var/www/bess-v2/`
4. 推送GitHub时同步到 AU-05 仓库

## 数据模型

- 7个mock电站（业主看7个，运维看2个）
- 4个NEM市场区域（NSW/QLD/VIC/SA + WA）
- 用户：1个业主 + 2个运维
