# 小梦用户中心 - 前端

基于 Vue 3 + TypeScript + Element Plus + Vite 构建的 PC 端用户管理系统，支持用户注册登录、权限分级校验、管理员用户管理（CRUD），配套自定义品牌主题与亮暗双模式切换。

## 技术栈

| 类别      | 技术                                       |
| --------- | ------------------------------------------ |
| 框架      | Vue 3 (Composition API + `<script setup>`) |
| 语言      | TypeScript（严格模式）                      |
| 构建      | Vite                                       |
| UI 组件库 | Element Plus（全局 CSS 变量主题深度定制）    |
| 路由      | Vue Router 5                               |
| HTTP 请求 | Axios（请求/响应拦截器 + 环境切换）          |
| 状态管理  | Pinia（登录用户状态与权限信息）              |
| 代码规范  | ESLint + Prettier + Oxlint                 |

## 项目结构

```
src/
├── api/                # API 接口封装
│   └── user.ts         # 用户相关：登录/注册/登出/搜索/更新/删除
├── assets/             # 静态资源
│   ├── main.css        # 主题样式（CSS 变量 + 亮暗双模式）
│   ├── base.css        # 基础样式
│   ├── logo.png        # Logo
│   └── iconfont/       # SVG 图标字体
├── components/         # 公共组件
│   └── GlobalHeader.vue    # 全局导航栏（Logo + 菜单 + 用户信息 + 主题切换）
├── layouts/            # 布局组件
│   └── BasicLayout.vue     # 上中下三段式布局骨架
├── router/             # 路由配置
│   └── index.ts            # 4 条路由 + History 模式
├── stores/             # Pinia 状态管理
│   └── useLoginUserStore.ts # 用户登录状态（ref + getter/setter）
├── views/              # 页面视图
│   ├── HomeView.vue        # 首页
│   ├── admin/
│   │   └── UserManageView.vue  # 管理员：用户列表/搜索/编辑/删除
│   └── user/
│       ├── UserLoginView.vue     # 登录页
│       └── UserRegisterView.vue  # 注册页
├── access.ts           # 全局路由守卫 / 权限校验
├── request.ts          # Axios 实例封装（baseURL/拦截器/类型约束）
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 功能概览

### 用户模块

- 用户注册（账号 + 密码 + 确认密码，自定义表单校验规则）
- 用户登录（账号密码登录，登录态持久化，登录成功回跳来源页面）
- 用户登出（清除 Session + 重置 Store + 跳转登录页）

### 用户管理（管理员）

- 用户列表展示（ID、用户名、账号、头像、性别、创建时间、角色）
- 按用户名搜索
- 编辑用户资料（用户名、头像、性别、电话、邮箱、角色与状态）
- 基于 Element Plus FormRules 和自定义 validator 完成字段校验
- 更新、删除操作防重复提交，完成后按当前搜索条件刷新列表
- 删除用户，并禁止管理员删除当前登录账号
- 性别与角色使用 Element Plus Tag 标签区分展示

### 权限控制

- 三层权限防护：
  - Pinia Store 管理登录用户状态与角色
  - Vue Router `beforeEach` 路由守卫拦截未授权访问 `/admin/*`
  - Axios 响应拦截器全局捕获未登录业务码并自动跳转登录页（携带 `redirect` 参数实现登录后回跳）
- 登录跳转循环防护：区分"获取当前用户"接口与其他接口的未登录响应，避免重复跳转

### 主题定制

- 通过 CSS 变量（CSS Variables）全局覆盖 Element Plus 十余个设计令牌（`--el-color-primary`、`--el-bg-color`、`--el-border-color` 等）
- 自定义「白日做梦」梦幻品牌色系，覆盖输入框、表格、导航栏等全部组件
- 基于 `html.theme-dark` 类名驱动亮色（浅紫梦幻风）/ 暗色（深蓝星空风）双模式一键切换
- 主题偏好通过 `localStorage` 持久化，刷新不丢失
- `:deep()` 穿透 scoped 样式处理 Element Plus 组件内部嵌套 DOM，管理默认/hover/focus 三态在亮暗两套配色下的视觉效果
- SVG Symbol 图标方案，通过 CSS `color` / `fill` 控制颜色灵活适配双主题切换

### 工程化

- TypeScript 严格模式全量类型标注
- ESLint + Prettier + Oxlint 代码质量保障
- `unplugin-auto-import` + `unplugin-vue-components` 实现 Element Plus 组件与 API 按需自动导入，减小打包体积

## 页面路由

| 路径                | 页面         |
| ------------------- | ------------ |
| `/`                 | 首页         |
| `/user/login`       | 用户登录     |
| `/user/register`    | 用户注册     |
| `/admin/userManage` | 用户管理（管理员） |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm / npm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### API 配置

开发环境 API 基地址为 `http://localhost:8080`，生产环境使用同域相对路径。配置位于 `src/request.ts` 中，通过 `import.meta.env.DEV` 自动切换。
