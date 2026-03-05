# TOOLS.md - 工具配置

## 截图验证

```bash
~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome \
  --headless --no-sandbox --disable-gpu \
  --screenshot=/tmp/test.png --window-size=1920,1080 \
  "http://49.51.194.118:8080/v2/station.html"
```

注意：需要注入localStorage登录状态才能正确渲染（通过--evaluate-script或Playwright）

## 部署命令

```bash
# 压缩
cd /var/www/bess-v2 && gzip -k -f -9 <modified-file>

# 权限
chown -R nginx:nginx /var/www/bess-v2/

# 版本备份
VERSION="v1.x-$(date +%Y%m%d-%H%M)"
mkdir -p /root/backups/v2-releases/$VERSION
cp -r /var/www/bess-v2/* /root/backups/v2-releases/$VERSION/
```

## Git推送

```bash
cd /var/www/bess-v2
git add -A && git commit -m "描述" && git push origin main
```
