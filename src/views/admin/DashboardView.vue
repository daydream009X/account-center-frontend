<template>
  <div id="dashboardView" class="custom-card">
    <h1>数据看板</h1>

    <div v-if="loading" class="dashboard-loading">数据加载中...</div>

    <template v-else>
      <!-- 顶部统计卡片 -->
      <div class="stat-cards">
        <div v-for="card in statCards" :key="card.label" class="stat-card">
          <div class="stat-card-label">{{ card.label }}</div>
          <div class="stat-card-value">{{ card.value }}</div>
        </div>
      </div>

      <!-- 用户增长趋势折线图 -->
      <div ref="trendChartRef" class="chart chart-trend"></div>

      <!-- 分布饼图 -->
      <div class="chart-row">
        <div ref="genderChartRef" class="chart chart-pie"></div>
        <div ref="roleChartRef" class="chart chart-pie"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { ElMessage } from 'element-plus'
import { searchUsers, type UserType } from '@/api/user'

echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type ChartInstance = ReturnType<typeof echarts.init>
type PieItem = { name: string; value: number }

const DAY_MS = 24 * 60 * 60 * 1000

const loading = ref(true)
const users = ref<UserType[]>([])

const trendChartRef = ref<HTMLDivElement>()
const genderChartRef = ref<HTMLDivElement>()
const roleChartRef = ref<HTMLDivElement>()

const trendChart = shallowRef<ChartInstance>()
const genderChart = shallowRef<ChartInstance>()
const roleChart = shallowRef<ChartInstance>()

const trendLabels = ref<string[]>([])
const trendDaily = ref<number[]>([])
const trendCumulative = ref<number[]>([])
const genderData = ref<PieItem[]>([])
const roleData = ref<PieItem[]>([])

const statCards = computed(() => {
  const total = users.value.length
  const adminCount = users.value.filter((user) => user.userRole === 1).length
  return [
    { label: '总用户数', value: total },
    { label: '管理员数', value: adminCount },
    { label: '普通用户数', value: total - adminCount },
    { label: '今日新增', value: todayNewCount.value },
  ]
})

const todayNewCount = computed(() => {
  const todayKey = formatDateKey(new Date())
  return users.value.filter((user) => {
    const ts = toTimestamp(user.createTime)
    return ts !== null && formatDateKey(new Date(ts)) === todayKey
  }).length
})

const pad = (n: number) => String(n).padStart(2, '0')

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// createTime 由后端 Date 序列化而来，兼容字符串与毫秒时间戳两种格式
const toTimestamp = (createTime: string | number | undefined): number | null => {
  if (createTime === undefined || createTime === null || createTime === '') return null
  const ts = typeof createTime === 'number' ? createTime : Date.parse(createTime)
  return Number.isNaN(ts) ? null : ts
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

// 近 N 天自适应：数据跨度 + 1，夹在 [7, 30]
const resolveDayCount = (minTs: number | null, now: Date) => {
  if (minTs === null) return 7
  const spanDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(new Date(minTs)).getTime()) / DAY_MS,
  )
  return Math.min(Math.max(spanDays + 1, 7), 30)
}

// 按创建日期聚合：窗口前累计 + 窗口内每日新增与累计
const buildTrend = (list: UserType[], now: Date) => {
  const dailyCounts = new Map<string, number>()
  let minTs: number | null = null
  for (const user of list) {
    const ts = toTimestamp(user.createTime)
    if (ts === null) continue
    if (minTs === null || ts < minTs) minTs = ts
    const key = formatDateKey(new Date(ts))
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1)
  }

  const dayCount = resolveDayCount(minTs, now)
  const windowStart = startOfDay(now).getTime() - (dayCount - 1) * DAY_MS

  let acc = 0
  for (const user of list) {
    const ts = toTimestamp(user.createTime)
    if (ts !== null && ts < windowStart) acc += 1
  }

  const labels: string[] = []
  const daily: number[] = []
  const cumulative: number[] = []
  for (let offset = dayCount - 1; offset >= 0; offset--) {
    const date = new Date(startOfDay(now).getTime() - offset * DAY_MS)
    const key = formatDateKey(date)
    const count = dailyCounts.get(key) ?? 0
    acc += count
    labels.push(key)
    daily.push(count)
    cumulative.push(acc)
  }
  return { labels, daily, cumulative }
}

// 从全局 CSS 变量读取亮 / 暗两套主题配色
const getThemeColors = () => {
  const style = getComputedStyle(document.documentElement)
  const css = (name: string) => style.getPropertyValue(name).trim()
  return {
    textMain: css('--custom-text-main') || '#4f5b66',
    textSecondary: css('--custom-text-secondary') || '#8e9aaf',
    border: css('--custom-border-color') || '#e5e5e5',
    primary: css('--el-color-primary') || '#74b9ff',
    success: css('--el-color-success') || '#a3b18a',
    warning: css('--el-color-warning') || '#ffeaa7',
    info: css('--el-color-info') || '#a29bfe',
    danger: css('--el-color-danger') || '#ff7675',
  }
}

type ThemeColors = ReturnType<typeof getThemeColors>

const axisStyle = (colors: ThemeColors) => ({
  axisLine: { lineStyle: { color: colors.border } },
  axisLabel: { color: colors.textSecondary },
  splitLine: { lineStyle: { color: colors.border } },
})

const buildTrendOption = (colors: ThemeColors): EChartsCoreOption => ({
  backgroundColor: 'transparent',
  textStyle: { color: colors.textMain },
  title: {
    text: '用户增长趋势',
    left: 'center',
    textStyle: { color: colors.textMain, fontSize: 16 },
  },
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, textStyle: { color: colors.textSecondary } },
  grid: { left: 48, right: 24, top: 48, bottom: 56 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendLabels.value,
    ...axisStyle(colors),
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    ...axisStyle(colors),
  },
  series: [
    {
      name: '累计用户',
      type: 'line',
      smooth: true,
      data: trendCumulative.value,
      itemStyle: { color: colors.primary },
      areaStyle: { color: colors.primary, opacity: 0.15 },
    },
    {
      name: '当日新增',
      type: 'line',
      smooth: true,
      data: trendDaily.value,
      itemStyle: { color: colors.success },
    },
  ],
})

const buildPieOption = (
  title: string,
  data: PieItem[],
  colors: ThemeColors,
): EChartsCoreOption => ({
  backgroundColor: 'transparent',
  color: [colors.primary, colors.success, colors.warning, colors.info, colors.danger],
  title: { text: title, left: 'center', textStyle: { color: colors.textMain, fontSize: 16 } },
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: colors.textSecondary } },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '55%'],
      label: { color: colors.textMain },
      data,
    },
  ],
})

const applyTheme = () => {
  const colors = getThemeColors()
  trendChart.value?.setOption(buildTrendOption(colors))
  genderChart.value?.setOption(buildPieOption('性别分布', genderData.value, colors))
  roleChart.value?.setOption(buildPieOption('角色分布', roleData.value, colors))
}

const handleResize = () => {
  trendChart.value?.resize()
  genderChart.value?.resize()
  roleChart.value?.resize()
}

// 监听 html.theme-dark 类名变化，主题切换时图表配色跟随
const themeObserver = new MutationObserver((mutations) => {
  const changed = mutations.some((mutation) => mutation.attributeName === 'class')
  if (changed) applyTheme()
})

const fetchData = async () => {
  try {
    const res = await searchUsers('')
    if (res.data.code === 0 && res.data.data) {
      users.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取数据失败')
    }
  } catch {
    ElMessage.error('获取数据失败')
  }
}

onMounted(async () => {
  await fetchData()

  const now = new Date()
  const trend = buildTrend(users.value, now)
  trendLabels.value = trend.labels
  trendDaily.value = trend.daily
  trendCumulative.value = trend.cumulative

  const genderCounts = new Map<string, number>()
  for (const user of users.value) {
    const name = user.gender === 1 ? '男' : user.gender === 0 ? '女' : '未知'
    genderCounts.set(name, (genderCounts.get(name) ?? 0) + 1)
  }
  genderData.value = ['男', '女', '未知']
    .filter((name) => genderCounts.has(name))
    .map((name) => ({ name, value: genderCounts.get(name) ?? 0 }))

  const adminCount = users.value.filter((user) => user.userRole === 1).length
  roleData.value = [
    { name: '普通用户', value: users.value.length - adminCount },
    { name: '管理员', value: adminCount },
  ]

  // 先渲染图表容器（v-else 依赖 loading 为 false），再初始化图表
  loading.value = false
  await nextTick()

  if (trendChartRef.value) trendChart.value = echarts.init(trendChartRef.value)
  if (genderChartRef.value) genderChart.value = echarts.init(genderChartRef.value)
  if (roleChartRef.value) roleChart.value = echarts.init(roleChartRef.value)
  applyTheme()

  window.addEventListener('resize', handleResize)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver.disconnect()
  trendChart.value?.dispose()
  genderChart.value?.dispose()
  roleChart.value?.dispose()
})
</script>

<style scoped>
#dashboardView {
  width: 100%;
}

#dashboardView h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}

.dashboard-loading {
  padding: 120px 0;
  text-align: center;
  color: var(--custom-text-secondary);
}

/* 顶部统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background-color: var(--custom-bg-page);
  border: 1px solid var(--custom-border-color);
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

.stat-card-label {
  font-size: 14px;
  color: var(--custom-text-secondary);
  margin-bottom: 8px;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 图表容器 */
.chart {
  width: 100%;
  background-color: var(--custom-bg-page);
  border: 1px solid var(--custom-border-color);
  border-radius: 8px;
  margin-bottom: 16px;
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

.chart-trend {
  height: 360px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-pie {
  height: 320px;
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-row {
    grid-template-columns: 1fr;
  }

  .chart-pie {
    margin-bottom: 16px;
  }
}
</style>
