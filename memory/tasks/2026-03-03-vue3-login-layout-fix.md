# 需求：Vue3登录页左侧标题水平排列

## 背景
v3登录页面需要在左侧显示"Australia Energy Storage"和"Australia's Clean Energy Storage Solution"，要求水平排列不换行，与右侧登录框视觉平衡。

## 修改清单
- 文件：/root/projects/aus-energy-vue3/src/views/LoginView.vue

## 具体操作

1. **找到原版HTML结构**
   - 定位 /root/projects/aus-energy/vpp-login.html 或相关原版文件
   - 复制完整的DOM结构，特别是左侧标题容器

2. **修改 LoginView.vue 的 <template>**
   - 1:1复刻原版的login-container结构
   - 左侧添加标题区域：
     ```html
     <div class="title-section">
       <h1>Australia Energy Storage</h1>
       <h2>Australia's Clean Energy Storage Solution</h2>
     </div>
     ```
   - 保持原有右侧登录框结构

3. **修改 <style> 标签**
   - 删除 scoped：`<style scoped>` → `<style>`
   - 确保标题水平排列：
     ```css
     .title-section h1, .title-section h2 {
       white-space: nowrap;
       display: inline-block;
     }
     ```

4. **检查资源路径**
   - 确保背景图片、logo等静态资源在 public/ 目录
   - 修改CSS中的路径为绝对路径

## 验证方法
- 访问 http://49.51.194.118:8080/v3/ 
- 确认左侧标题水平排列，不换行
- 确认与右侧登录框视觉平衡
- 截图验证布局效果