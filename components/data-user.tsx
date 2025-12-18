"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Clock } from "lucide-react";

/* ───────────────────────────────────
   Types
   ─────────────────────────────────── */

type DonutSlice = {
  name: string;
  value: number;
};

type StatCard = {
  label: string;
  value: string; // "X Hr Y Min" from backend
  period: string;
};

type UserDataResponse = {
  statCards: StatCard[];
  weeklyUserBreakdown: DonutSlice[];
  userBreakdown: DonutSlice[];
  error?: string;
};

type WeekItem = {
  label: string;
  value: string;
  start: Date;
  end: Date;
};

/* ───────────────────────────────────
   Week helpers (same logic as other page)
   ─────────────────────────────────── */

function getPreviousWeekRange(date = new Date()) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  let day = today.getDay(); // 0=Sun .. 6=Sat
  day = day === 0 ? 7 : day;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - day - 6);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  return { start: lastMonday, end: lastSunday };
}

function getRecentWeeks(count = 8): WeekItem[] {
  const weeks: WeekItem[] = [];
  let ref = new Date();
  for (let i = 0; i < count; i++) {
    const { start, end } = getPreviousWeekRange(ref);
    weeks.push({
      label: `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`,
      value: `${start.toISOString().slice(0, 10)}_${end
        .toISOString()
        .slice(0, 10)}`,
      start,
      end,
    });
    ref = new Date(start);
  }
  return weeks;
}

/* ───────────────────────────────────
   UI helpers
   ─────────────────────────────────── */

const COLORS = ["#3B82F6", "#22C55E", "#3B82F6", "#FBBF24"];

const getTotal = (arr: { value: number }[]) =>
  arr.reduce((sum, d) => sum + d.value, 0);

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[15px]">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ background: color }}
      />
      <span className="text-gray-700">{label}:</span>
      <span className="font-semibold text-gray-900">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

type DonutCardProps = {
  title: string;
  footer: string;
  data: DonutSlice[];
  colors: string[];
  centerLabel: string;
  showLegend?: boolean;
};

function DonutCard({
  title,
  footer,
  data,
  colors,
  centerLabel,
  showLegend = true,
}: DonutCardProps) {
  const total = getTotal(data);

  const TooltipRenderer = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name } = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{name}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
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

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900 leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{centerLabel}</span>
          </div>
        </div>

        {showLegend && (
          <div className="flex flex-col gap-2">
            {data.map((d, i) => (
              <LegendRow
                key={d.name}
                color={colors[i % colors.length]}
                label={d.name}
                value={d.value}
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
  );
}

/* ───────────────────────────────────
   Page component
   ─────────────────────────────────── */

export default function UserDataPage() {
  const API_BASE_URL = process.env
    .NEXT_PUBLIC_API_BASE_URL as string | undefined;

  const weeks = useMemo(() => getRecentWeeks(8), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekItem>(weeks[0]);
  const [data, setData] = useState<UserDataResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      setData(null);
      try {
        const res = await axios.get<UserDataResponse>(
          `${API_BASE_URL}/user-data`,
          {
            params: {
              startDate: selectedWeek.start.toISOString(),
              endDate: selectedWeek.end.toISOString(),
            },
          }
        );

        const endLabel = selectedWeek.end.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const updated: UserDataResponse = {
          ...res.data,
          statCards: res.data.statCards.map((card, idx) => {
            if (idx === 0) {
              // Last week's total watchminutes: show the selected week range
              return {
                ...card,
                period: `${selectedWeek.start.toLocaleDateString()} – ${selectedWeek.end.toLocaleDateString()}`,
              };
            }
            if (idx === 1) {
              // Total watchminutes: show 1 Sep 2024 – [selected end date]
              return {
                ...card,
                period: `01 Sep 2024 – ${endLabel}`,
              };
            }
            return card;
          }),
        };

        setData(updated);
      } catch (error: any) {
        setData({
          statCards: [],
          weeklyUserBreakdown: [],
          userBreakdown: [],
          error: error.message,
        });
      }
    }

    if (API_BASE_URL) {
      fetchData();
    }
  }, [API_BASE_URL, selectedWeek]);

  const headingPeriod = `${selectedWeek.start.toLocaleDateString()} – ${selectedWeek.end.toLocaleDateString()}`;
  const endLabel = selectedWeek.end.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Weekly Data For Implementation Team ({headingPeriod})
        </h1>
        <select
          className="ml-4 border p-2 rounded"
          value={selectedWeek.value}
          onChange={(e) =>
            setSelectedWeek(
              weeks.find((w) => w.value === e.target.value) || weeks[0]
            )
          }
        >
          {weeks.map((week) => (
            <option value={week.value} key={week.value}>
              {week.label}
            </option>
          ))}
        </select>
      </div>

      {!data && <div>Loading implementation data...</div>}
      {data && data.error && (
        <div className="text-red-600 mb-4">Error: {data.error}</div>
      )}

      {data && data.statCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {data.statCards.map((item) => (
            <Card
              key={item.label}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <Clock className="w-6 h-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{item.value}</p>
                {item.period && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ({item.period})
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DonutCard
            title={`Users Registered Last Week (${headingPeriod})`}
            data={data.weeklyUserBreakdown}
            colors={[COLORS[2], COLORS[3]]}
            centerLabel="Users Registered"
            footer="* Including manual onboard users"
          />

          <DonutCard
            title={`Total Users Registered (01 Sep 2024 – ${endLabel})`}
            data={data.userBreakdown}
            colors={[COLORS[0], COLORS[1]]}
            centerLabel="Total Users"
            footer="* Including manual onboard users"
          />
        </div>
      )}
    </div>
  );
}
