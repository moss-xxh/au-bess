# MEMORY.md — 澳洲储能电站项目

## 关键信息

### 用户
- **Moss** — 项目负责人，GMT+8，中文优先

### 服务器
- **IP**: 49.51.194.118（腾讯云）
- **8080 端口**: 原 AU BESS Platform（`/var/www/bess/`）— Moss 自研的业主/运维双角色 dashboard
- **8080/v2/**: VPP 能源管理前端（`/var/www/bess-v2/`）— X ENERGI 产品，filecloud 来源
- **8081 端口**: 也指向 bess-v2，但云安全组未放行
- **nginx 配置**: `/etc/nginx/conf.d/bess.conf`（主站+v2子路径）、`/etc/nginx/conf.d/bess-v2.conf`（8081）
- **filecloud**: `/root/filecloud/` — Moss 的云盘文件，直接 read 读取，不走 HTTP

### 代码仓库
- **VPP 项目 GitHub**: `https://github.com/moss-xxh/UEH.git`
- filecloud 版本（`/root/filecloud/澳洲电站1.1_副本/`）比 GitHub 多几个文件（role-select 等），但缺 components 目录
- 部署时以 filecloud 为基础 + GitHub 补 components

### GitHub 仓库
- **正确仓库**: https://github.com/x1354028165/AU.git（Moss 指定的，用于 GitHub Pages）
- moss-xxh/UEH 也推了一份但不是主仓库
- 分支: master

### 设计规范
- `design-system.css` — 全局 CSS Variables（颜色/间距/圆角/字体）
- `page-transition.js` — 页面淡入淡出过渡动画
- 菜单: 首页/电站/报表/故障/组织/操作记录（6项，定义在 header-nav.js navItems）
- i18n: getText() 用 key.split('.') 逐层查找嵌套对象

### Headless Chrome
- 路径: `/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`
- 需要 `--no-sandbox --disable-gpu`
- dashboard.html 需要注入 localStorage 登录状态才能渲染

## 工作偏好
- 改动最小化，不要改了一个问题影响别的
- filecloud 文件是权威来源
- 结果 > 过程，只汇报关键节点

## ⚠️ 重要流程：报告与代码一致性检查
- **强制验证**：每次报告前必须检查实际生成的文件内容
- **需求翻译记录**：所有需求翻译过程存入 memory/ 目录
- **一致性原则**：报告描述必须与实际交付物完全一致，绝不允许矛盾
- **验证清单**：执行→验证→记录→报告，确保无差异
