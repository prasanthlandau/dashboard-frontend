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
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
};

/* ───────────────────────────────────
   Week helpers: last N completed Mon–Sun weeks
   ─────────────────────────────────── */

function getRecentWeeks(count = 2): WeekItem[] {
  const weeks: WeekItem[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Monday of current week (local)
  const day = today.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const currentMonday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  currentMonday.setDate(today.getDate() + diffToMonday);

  // Build last `count` completed weeks, skipping current week
  for (let i = 1; i <= count; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - 7 * i);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // IMPORTANT: build YYYY-MM-DD in LOCAL time, not via toISOString()
    const startDate = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, "0"),
      String(monday.getDate()).padStart(2, "0"),
    ].join("-");

    const endDate = [
      sunday.getFullYear(),
      String(sunday.getMonth() + 1).padStart(2, "0"),
      String(sunday.getDate()).padStart(2, "0"),
    ].join("-");

    weeks.push({
      label: `${monday.toLocaleDateString()} – ${sunday.toLocaleDateString()}`,
      startDate,
      endDate,
    });
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
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground">
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
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-card-foreground">{name}</p>
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

      <CardContent className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-6">
        <div className="relative w-full max-w-[208px] mx-auto" style={{ height: 208 }}>
          <ResponsiveContainer width="100%" height={208}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="82%"
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
            <span className="text-3xl font-bold text-foreground leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">{centerLabel}</span>
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

  const weeks = useMemo(() => getRecentWeeks(2), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekItem>(weeks[0]);
  const [data, setData] = useState<UserDataResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      setData(null);

      console.log("Selected week params:", {
        label: selectedWeek.label,
        startDate: selectedWeek.startDate,
        endDate: selectedWeek.endDate,
      });

      try {
        const res = await axios.get<UserDataResponse>(
          `${API_BASE_URL}/user-data`,
          {
            params: {
              startDate: selectedWeek.startDate,
              endDate: selectedWeek.endDate,
            },
          }
        );

        const endLabel = new Date(selectedWeek.endDate).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

        const updated: UserDataResponse = {
          ...res.data,
          statCards: res.data.statCards.map((card, idx) => {
            if (idx === 0) {
              return {
                ...card,
                period: selectedWeek.label,
              };
            }
            if (idx === 1) {
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

  const headingPeriod = selectedWeek.label;
  const endLabel = new Date(selectedWeek.endDate).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Weekly Data For Implementation Team ({headingPeriod})
        </h1>
        <select
          className="ml-4 border p-2 rounded"
          value={selectedWeek.startDate + "_" + selectedWeek.endDate}
          onChange={(e) => {
            const [s, e2] = e.target.value.split("_");
            const found =
              weeks.find(
                (w) => w.startDate === s && w.endDate === e2
              ) || weeks[0];
            setSelectedWeek(found);
          }}
        >
          {weeks.map((week) => (
            <option
              value={week.startDate + "_" + week.endDate}
              key={week.startDate + "_" + week.endDate}
            >
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
