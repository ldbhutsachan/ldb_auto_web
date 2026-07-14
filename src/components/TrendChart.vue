<template>
  <div class="trend-chart-wrapper" ref="wrapperRef">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="trend-svg"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <!-- Grid lines -->
      <g class="grid-group">
        <!-- Horizontal grid lines -->
        <line
          v-for="(y, i) in horizontalGridLines"
          :key="'h-' + i"
          :x1="padding.left"
          :y1="y"
          :x2="svgWidth - padding.right"
          :y2="y"
          class="grid-line horizontal"
        />
        <!-- Vertical grid lines (line charts only — bars already separate categories) -->
        <template v-if="type === 'line'">
          <line
            v-for="(x, i) in verticalGridLines"
            :key="'v-' + i"
            :x1="x"
            :y1="padding.top"
            :x2="x"
            :y2="svgHeight - padding.bottom"
            class="grid-line vertical"
          />
        </template>
      </g>

      <!-- Y-axis labels -->
      <text
        v-for="(label, i) in yLabels"
        :key="'yl-' + i"
        :x="padding.left - 10"
        :y="horizontalGridLines[i] + 4"
        class="axis-label y-label"
        text-anchor="end"
      >{{ label }}</text>

      <!-- X-axis labels -->
      <text
        v-for="(label, i) in xLabels"
        :key="'xl-' + i"
        :x="verticalGridLines[i]"
        :y="svgHeight - padding.bottom + 18"
        class="axis-label x-label"
        text-anchor="middle"
      >{{ label }}</text>

      <!-- Data series (line/area) -->
      <template v-if="type === 'line'">
        <g v-for="(dataset, sIdx) in datasets" :key="'series-' + sIdx" :class="['series-group', dataset.className]">
          <!-- Fill area -->
          <path
            v-if="dataset.fill"
            :d="getAreaPath(sIdx)"
            class="series-fill"
            :style="{ fill: `url(#gradient-${sIdx})` }"
          />

          <!-- Line path -->
          <path
            :d="getLinePath(sIdx)"
            class="series-line"
            :class="{ 'series-dashed': dataset.dashed }"
            :style="{ stroke: getColor(dataset, sIdx) }"
          />

          <!-- Data points -->
          <circle
            v-for="(pt, pIdx) in dataset.data"
            :key="'pt-' + sIdx + '-' + pIdx"
            :cx="getX(pIdx)"
            :cy="getY(pt)"
            :r="hoveredIndex === pIdx ? 5 : 3"
            class="series-point"
            :class="{ 'is-active': hoveredIndex === pIdx }"
            :style="{ fill: getColor(dataset, sIdx), stroke: getColor(dataset, sIdx) }"
          />
        </g>
      </template>

      <!-- Data series (bar) -->
      <g v-else class="bars-group">
        <template v-for="(dataset, sIdx) in datasets" :key="'barset-' + sIdx">
          <path
            v-for="(pt, pIdx) in dataset.data"
            :key="'bar-' + sIdx + '-' + pIdx"
            :d="getBarPath(pIdx, pt, sIdx)"
            class="series-bar"
            :class="{ 'is-active': hoveredIndex === pIdx }"
            :style="{ fill: getColor(dataset, sIdx) }"
          />
        </template>
      </g>

      <!-- Hover vertical line (line charts only — bars self-highlight via opacity) -->
      <line
        v-if="hoveredIndex !== null && type === 'line'"
        :x1="getX(hoveredIndex)"
        :y1="padding.top"
        :x2="getX(hoveredIndex)"
        :y2="svgHeight - padding.bottom"
        class="hover-line"
      />

      <!-- Gradients for fills (keyed by actual dataset index to match getAreaPath) -->
      <defs>
        <linearGradient
          v-for="(dataset, sIdx) in datasets"
          :key="'grad-' + sIdx"
          :id="'gradient-' + sIdx"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" :stop-color="getColor(dataset, sIdx)" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="getColor(dataset, sIdx)" stop-opacity="0.02" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="tooltipData"
      class="trend-tooltip"
      :class="{ 'is-active': !!tooltipData }"
      :style="tooltipStyle"
    >
      <div class="tooltip-header">{{ tooltipData.label }}</div>
      <div
        v-for="(item, i) in tooltipData.items"
        :key="'ti-' + i"
        class="tooltip-row"
      >
        <span class="tooltip-dot" :style="{ background: item.color }"></span>
        <span class="tooltip-name">{{ item.name }}</span>
        <span class="tooltip-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  datasets: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  colors: { type: Array, default: () => ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'] },
  height: { type: Number, default: 300 },
  padding: {
    type: Object,
    default: () => ({ top: 20, right: 20, bottom: 40, left: 60 })
  },
  gridLines: { type: Number, default: 5 },
  smooth: { type: Boolean, default: true },
  formatter: { type: Function, default: (val) => val },
  type: { type: String, default: 'line' }, // 'line' | 'bar'
})

const svgWidth = computed(() => 800)
const svgHeight = computed(() => props.height + props.padding.top + props.padding.bottom)

const wrapperRef = ref(null)
const hoveredIndex = ref(null)
const tooltipData = ref(null)
const tooltipStyle = ref({})



// Calculate chart area
const chartWidth = computed(() => svgWidth.value - props.padding.left - props.padding.right)
const chartHeight = computed(() => svgHeight.value - props.padding.top - props.padding.bottom)

// Find min/max across all datasets
const dataMin = computed(() => 0)
const dataMax = computed(() => {
  let max = 0
  for (const ds of props.datasets) {
    for (const val of ds.data) {
      if (val > max) max = val
    }
  }
  return max || 1
})

// Scale functions
const getX = (index) => {
  const count = Math.max(props.labels.length - 1, 1)
  return props.padding.left + (index / count) * chartWidth.value
}

const getY = (value) => {
  const range = dataMax.value - dataMin.value || 1
  return svgHeight.value - props.padding.bottom - ((value - dataMin.value) / range) * chartHeight.value
}

// Grid lines
const horizontalGridLines = computed(() => {
  const lines = []
  for (let i = 0; i <= props.gridLines; i++) {
    const y = getY(dataMin.value + (dataMax.value / props.gridLines) * i)
    lines.push(y)
  }
  return lines
})

const verticalGridLines = computed(() => {
  const lines = []
  for (let i = 0; i < props.labels.length; i++) {
    lines.push(getX(i))
  }
  return lines
})

// Y-axis labels
const yLabels = computed(() => {
  const labels = []
  for (let i = 0; i <= props.gridLines; i++) {
    const val = Math.round(dataMin.value + (dataMax.value / props.gridLines) * i)
    labels.push(props.formatter(val))
  }
  return labels
})

// X-axis labels
const xLabels = computed(() => props.labels)

// Get color for a dataset (uses dataset.color if set, otherwise falls back to colors prop)
function getColor(dataset, index) {
  return dataset.color || props.colors[index % props.colors.length]
}

// Generate smooth SVG path
function getLinePath(seriesIndex) {
  const dataset = props.datasets[seriesIndex]
  if (!dataset || dataset.data.length < 2) return ''

  const points = dataset.data.map((val, i) => ({
    x: getX(i),
    y: getY(val),
  }))

  let d = `M ${points[0].x} ${points[0].y}`

  if (props.smooth) {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cp1x = p0.x + (p1.x - p0.x) / 2
      const cp1y = p0.y
      const cp2x = p0.x + (p1.x - p0.x) / 2
      const cp2y = p1.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
  }

  return d
}

// Generate fill area path (line + bottom)
function getAreaPath(seriesIndex) {
  const dataset = props.datasets[seriesIndex]
  if (!dataset || dataset.data.length < 2) return ''

  const linePath = getLinePath(seriesIndex)
  const lastIdx = dataset.data.length - 1
  const bottomY = svgHeight.value - props.padding.bottom

  return `${linePath} L ${getX(lastIdx)} ${bottomY} L ${getX(0)} ${bottomY} Z`
}

// Generate a bar path: rounded top, square baseline, capped thickness (mark spec)
function getBarPath(index, value, seriesIndex) {
  const seriesCount = props.datasets.length
  const slotWidth = chartWidth.value / Math.max(props.labels.length, 1)
  const groupWidth = slotWidth * 0.7
  const gap = 2
  const barWidth = Math.min(24, (groupWidth - (seriesCount - 1) * gap) / seriesCount)
  const groupStart = getX(index) - (barWidth * seriesCount + gap * (seriesCount - 1)) / 2
  const x = groupStart + seriesIndex * (barWidth + gap)

  const yBottom = svgHeight.value - props.padding.bottom
  let yTop = getY(value)
  let barHeight = yBottom - yTop
  if (barHeight < 0.5) {
    yTop = yBottom
    barHeight = 0
  }

  const r = Math.min(4, barWidth / 2, barHeight)

  if (barHeight <= 0) {
    return `M ${x} ${yBottom} L ${x + barWidth} ${yBottom}`
  }

  return `M ${x} ${yBottom}
    L ${x} ${yTop + r}
    Q ${x} ${yTop} ${x + r} ${yTop}
    L ${x + barWidth - r} ${yTop}
    Q ${x + barWidth} ${yTop} ${x + barWidth} ${yTop + r}
    L ${x + barWidth} ${yBottom}
    Z`
}

// Mouse interaction
function onMouseMove(event) {
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const scaleX = svgWidth.value / rect.width
  const svgMouseX = mouseX * scaleX

  // Find nearest x index
  let minDist = Infinity
  let nearestIdx = 0
  for (let i = 0; i < props.labels.length; i++) {
    const dist = Math.abs(svgMouseX - getX(i))
    if (dist < minDist) {
      minDist = dist
      nearestIdx = i
    }
  }

  hoveredIndex.value = nearestIdx

  // Build tooltip data (use dataset.color to avoid color shift when datasets are filtered)
  const tooltipItems = props.datasets.map((ds, sIdx) => ({
    name: ds.name,
    value: props.formatter(ds.data[nearestIdx] || 0),
    color: ds.color || props.colors[sIdx % props.colors.length],
  }))

  tooltipData.value = {
    label: props.labels[nearestIdx] || '',
    items: tooltipItems,
  }

  // Position tooltip relative to the wrapper
  if (wrapperRef.value) {
    const wrapperRect = wrapperRef.value.getBoundingClientRect()
    const hoverX = event.clientX - wrapperRect.left
    const isRightSide = hoverX > wrapperRect.width / 2
    tooltipStyle.value = {
      left: (isRightSide ? hoverX - 180 : hoverX + 16) + 'px',
      top: '-10px',
    }
  }
}

function onMouseLeave() {
  hoveredIndex.value = null
  tooltipData.value = null
}
</script>

<style scoped>
.trend-chart-wrapper {
  position: relative;
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: auto;
  display: block;
}

.grid-line {
  stroke: rgba(0, 0, 0, 0.06);
  stroke-width: 1;
}

.axis-label {
  font-size: 11px;
  font-weight: 500;
  fill: #94a3b8;
  font-family: 'Inter', sans-serif;
}

.series-line {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.series-bar {
  transition: opacity 0.15s ease;
  opacity: 0.85;
}

.series-bar.is-active {
  opacity: 1;
}

.series-dashed {
  stroke-dasharray: 6, 4;
  stroke-width: 2;
}

.series-fill {
  pointer-events: none;
}

.series-point {
  cursor: pointer;
  transition: r 0.2s ease, stroke-width 0.2s ease;
  stroke-width: 2;
}

.series-point.is-active {
  stroke-width: 3;
}

.hover-line {
  stroke: rgba(0, 0, 0, 0.12);
  stroke-width: 1;
  stroke-dasharray: 4, 3;
  pointer-events: none;
}

.trend-tooltip {
  position: absolute;
  background: white;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  pointer-events: none;
  z-index: 100;
  min-width: 150px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.trend-tooltip.is-active {
  opacity: 1;
}

.tooltip-header {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tooltip-name {
  font-weight: 500;
  color: #64748b;
  flex: 1;
}

.tooltip-value {
  font-weight: 700;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}
</style>
