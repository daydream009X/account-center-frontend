# 小梦用户中心 · 前端

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的用户中心系统前端。

## 技术栈

Vue 3 / TypeScript / Vite / Element Plus / Pinia / Vue Router / Axios

## 功能模块

- **用户登录** — 账号密码登录，表单校验，登录态持久化
- **用户注册** — 账号注册，二次密码确认，校验规则
- **用户管理**（管理员） — 用户列表展示、搜索、删除，角色与性别标签展示
- **全局权限校验** — 路由守卫，非管理员拦截并跳转登录页
- **白日做梦主题** — 全局梦幻色系，自定义输入框、表格、导航栏样式
- **响应式布局** — 左中右三段式顶栏，菜单自动折叠，内容区自适应

## 项目启动

```sh
npm install
npm run dev
```

## 构建

```sh
npm run build
```

## 后端仓库

[user-center-backend](https://github.com/bairizuomeng648/user-center-backend)
