'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle
} from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Clock, TrendingUp } from 'lucide-react'

/* ───────────────────────────────────
   Static “stat cards” at the top
   ─────────────────────────────────── */
const OTHER_DATA_POINTS = [
  {
    label: "Last week's total Watchminutes",
    value: '10 Hr 21 Min',
    period: '(07th Jul to 13th Jul)',
    icon: <Clock className="w-6 h-6 text-blue-500" />
  },
  {
    label: 'Total watchminutes',
    value: '2939 Hr 3 Min',
    period: '(since 1st Sep 2024)',
    icon: <TrendingUp className="w-6 h-6 text-green-500" />
  }
]

/* ───────────────────────────────────
   Donut datasets
   ─────────────────────────────────── */
const userBreakdown = [
  { name: 'Students', value: 5853 },
  { name: 'Teachers', value: 361 }
]

const weeklyUserBreakdown = [
  { name: 'Accounts Activated', value: 11 },
  { name: 'Accounts Not Verified', value: 2 }
]

/* Brand colors */
const COLORS = ['#3B82F6', '#22C55E', '#3B82F6', '#FBBF24']

/* Helper: compute total of any dataset */
const getTotal = (arr: { value: number }[]) =>
  arr.reduce((sum, d) => sum + d.value, 0)

/* ───────────────────────────────────
   Custom Legend Row
   ─────────────────────────────────── */
function LegendRow ({
  color,
  label,
  value,
  percent
}: {
  color: string
  label: string
  value: number
  percent: string
}) {
  return (
    <div className="flex items-center gap-2 text-[15px]">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ background: color }}
      />
      <span className="text-gray-700">{label}:</span>
      <span className="font-semibold text-gray-900">{value.toLocaleString()}</span>
    </div>
  )
}

function DonutCard ({
  title,
  footer,
  data,
  colors,
  centerLabel,
  showLegend = true
}: {
  title: string
  data: { name: string; value: number }[]
  colors: string[]
  centerLabel: string
  footer: string
  showLegend?: boolean
}) {
  const total = getTotal(data)

  /* Tooltip bound to this chart only */
  const TooltipRenderer = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, fill } = payload[0]
      const pct = ((value / total) * 100).toFixed(1) + '%'
      return (
        <div
          className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg"
          style={{ borderColor: fill }}
        >
          <p className="font-semibold text-gray-800">{name}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      {/* Chart + Legend wrapper */}
      <CardContent className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
        {/* Donut */}
        <div className="relative w-52 h-52 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                startAngle={90}
                endAngle={450}
                isAnimationActive={false}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipRenderer />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900 leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{centerLabel}</span>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-2">
            {data.map((d, i) => (
              <LegendRow
                key={d.name}
                color={colors[i % colors.length]}
                label={d.name}
                value={d.value}
                percent={((d.value / total) * 100).toFixed(1) + '%'}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <CardTitle className="text-base font-medium text-muted-foreground">
          {footer}
        </CardTitle>
      </CardFooter>
    </Card>
  )
}

/* ───────────────────────────────────
   Page component
   ─────────────────────────────────── */
export default function UserDataPage () {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Weekly Data For Implementation Team (07 Jul 2025 – 13 Jul 2025)
      </h1>

      {/* Static top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {OTHER_DATA_POINTS.map((item) => (
          <Card key={item.label} className="shadow-md hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{item.value}</p>
              
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donut charts with legends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DonutCard
          title="Users Registered Last Week(07 Jul – 13 Jul)"
          data={weeklyUserBreakdown}
          colors={[COLORS[2], COLORS[3]]}
          centerLabel="Users Registered"
          footer="* Including manual onboard users"
        />

        <DonutCard
          title="Total Users Registered (01 Sep 24 – 13 Jul 25)"
          data={userBreakdown}
          colors={[COLORS[0], COLORS[1]]}
          centerLabel="Total Users"
          footer="* Including manual onboard users"
        />
      </div>
    </div>
  )
}
