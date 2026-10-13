# 统一账号权限管理平台 - 前端

## 一、项目背景

统一账号权限管理平台是一个独立开发并部署上线的账号权限管理后台，覆盖统一注册登录、登录态管理、普通用户 / 管理员两级权限分级，以及管理员侧的用户管理与运营数据看板。平台刻意保持轻量：用户侧只有注册与登录，用户数据的维护与统计集中在管理端完成。前后端分离，本仓库为前端部分；后端为 Spring Boot 服务（不在本仓库内）。

## 二、技术架构

| 类别      | 技术                                                        |
| --------- | ----------------------------------------------------------- |
| 框架      | Vue 3（Composition API + `<script setup>`）                  |
| 语言      | TypeScript（严格模式，`noUncheckedIndexedAccess`）           |
| 构建      | Vite                                                        |
| UI 组件库 | Element Plus（CSS 变量深度定制品牌主题，亮 / 暗双模式）      |
| 图表      | ECharts（`echarts/core` 按需引入，Line + Pie + Canvas）      |
| 路由      | Vue Router 5（History 模式 + 全局守卫权限拦截）             |
| HTTP 请求 | Axios（baseURL 环境切换 + 请求 / 响应拦截器）                |
| 状态管理  | Pinia（登录用户状态与权限信息）                              |
| 代码规范  | ESLint + Prettier + Oxlint                                   |
| 按需导入  | `unplugin-auto-import` + `unplugin-vue-components`          |

## 三、项目结构

```text
src/                              # 前端源码目录
├── api/                          # API 接口封装
│   └── user.ts                   # 用户相关：注册/登录/登出/当前用户/搜索/更新/删除
├── assets/                       # 静态资源
│   ├── main.css                  # 主题样式（CSS 变量 + 亮暗双模式）
│   ├── base.css                  # 基础样式
│   ├── logo.png                  # Logo
│   └── iconfont/                 # SVG 图标字体
├── components/                   # 公共组件
│   └── GlobalHeader.vue          # 全局导航栏（Logo + 菜单 + 用户信息 + 主题切换）
├── layouts/                      # 布局组件
│   └── BasicLayout.vue           # 上中下三段式布局骨架
├── router/                       # 路由配置
│   └── index.ts                  # 5 条路由 + History 模式
├── stores/                       # Pinia 状态管理
│   └── useLoginUserStore.ts      # 用户登录状态（ref + getter/setter）
├── views/                        # 页面视图
│   ├── HomeView.vue              # 首页
│   ├── admin/                    # 管理端页面
│   │   ├── DashboardView.vue     # 管理员：数据看板（统计卡片 + 折线图 + 双饼图）
│   │   └── UserManageView.vue    # 管理员：用户列表/搜索/编辑/删除
│   └── user/                     # 用户侧页面
│       ├── UserLoginView.vue     # 登录页
│       └── UserRegisterView.vue  # 注册页
├── access.ts                     # 全局路由守卫 / 权限校验
├── request.ts                    # Axios 实例封装（baseURL/拦截器/类型约束）
├── App.vue                       # 根组件
└── main.ts                       # 入口文件
```

## 四、功能清单

### 用户模块

- 用户注册（账号 + 密码 + 确认密码 + 编号，自定义表单校验规则）
- 用户登录（账号密码登录，登录态持久化，登录成功回跳来源页面）
- 用户登出（清除 Session + 重置 Store + 跳转登录页）

### 权限控制

- 三层权限防护链路（详见「技术要点」）
- 普通用户 / 管理员角色分级，管理端入口仅管理员可见

### 用户管理（管理员）

- 用户列表展示（ID、用户名、账号、头像、性别、创建时间、角色）
- 按用户名搜索
- 编辑用户资料（用户名、头像、性别、电话、邮箱、角色与状态）
- 删除用户，并禁止管理员删除当前登录账号
- 更新、删除操作防重复提交，完成后按当前搜索条件刷新列表

### 数据看板（管理员）

- 顶部统计卡片：总用户数 / 管理员数 / 普通用户数 / 今日新增
- 用户增长趋势折线图（按创建日期聚合，近 N 天自适应数据跨度）
- 性别分布、角色分布饼图
- 数据来自现有用户列表接口，纯前端聚合计算（map / reduce）

## 五、技术要点

- **三层权限防护链路**：Pinia Store 管理登录用户状态与角色 → Vue Router `beforeEach` 全局守卫拦截未授权访问 `/admin/*` → Axios 响应拦截器兜底捕获未登录业务码并全局跳转登录页（携带 `redirect` 参数实现登录后回跳）。
- **登录跳转循环防护**：响应拦截器区分「获取当前用户」接口与其他接口的未登录响应，仅对业务接口跳转，避免 `current` 接口反复触发重定向形成死循环。
- **CSS 变量双主题定制**：通过全局 CSS 变量覆盖 Element Plus 设计令牌（`--el-color-primary`、`--el-bg-color`、`--el-border-color` 等），自定义品牌梦幻色系；亮（浅紫梦幻）/ 暗（深蓝星空）双模式由 `html.theme-dark` 类名驱动，主题偏好 `localStorage` 持久化。
- **`:deep()` 样式穿透**：处理 Element Plus 组件内部嵌套 DOM，管理默认 / hover / focus 三态在亮暗两套配色下的视觉效果。
- **SVG Symbol 图标双主题适配**：图标采用 SVG Symbol 方案，通过 CSS `color` / `fill: currentColor` 控制颜色，亮暗切换时无需替换资源。
- **ECharts 按需引入**：仅注册 LineChart、PieChart 与 Grid / Tooltip / Legend 等必要组件，配合 `unplugin` 系列插件按需自动导入，有效控制打包体积。
- **图表主题联动**：数据看板通过 MutationObserver 监听 `html.theme-dark` 类名变化，主题切换时从 CSS 变量读取配色重新渲染图表；`init` 置于 `onMounted`、`dispose` 置于 `onBeforeUnmount`，并监听窗口 resize，杜绝内存泄漏。
- **工程化：**TypeScript 严格模式全量类型标注；ESLint + Prettier + Oxlint 代码质量保障；`unplugin-auto-import` + `unplugin-vue-components` 实现 Element Plus 组件与 API 按需自动导入，减小打包体积。

## 六、本地运行

### 环境要求

- Node.js >= 18
- pnpm / npm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式（默认代理后端 http://localhost:8080）
pnpm dev

# 类型检查 + 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### API 配置

开发环境 API 基地址为 `http://localhost:8080`，生产环境使用同域相对路径。配置位于 `src/request.ts` 中，通过 `import.meta.env.DEV` 自动切换。
