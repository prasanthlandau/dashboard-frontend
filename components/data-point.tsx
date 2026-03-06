"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DonutItem = {
  id: number;
  label: string;
  value: number;
  color: string;
};

type LegendProps = {
  data: DonutItem[];
};

/* ───────────────────────────────────
   Week helpers: last N completed Mon–Sun weeks
   ─────────────────────────────────── */

type WeekItem = {
  label: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
};

function getRecentWeeks(count = 2): WeekItem[] {
  const weeks: WeekItem[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Monday of current week (local)
  const day = today.getDay(); // 0=Sun,1=Mon,...6=Sat
  const currentMonday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  currentMonday.setDate(today.getDate() + diffToMonday);

  // Build last `count` completed weeks, skipping current week
  for (let i = 1; i <= count; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - 7 * i);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

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
   Legend + Donut
   ─────────────────────────────────── */

const LegendComponent: React.FC<LegendProps> = ({ data }) => (
  <div className="flex flex-col justify-center space-y-2">
    {data.map((item) =>
      item.value > 0 ? (
        <div key={item.label} className="flex items-center text-sm">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          />
          <span>{`${item.label}: `}</span>
          <span className="font-semibold ml-1">
            {item.value.toLocaleString()}
          </span>
        </div>
      ) : null
    )}
  </div>
);

type DonutCardProps = {
  title: string;
  data: DonutItem[];
  centerLabel: string;
  centerValue: number;
};

const DonutCard: React.FC<DonutCardProps> = ({
  title,
  data,
  centerLabel,
  centerValue,
}) => {
  const COLORS = data.map((item) => item.color);
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <Card className="flex flex-col h-full w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center gap-4 p-4">
        <div className="relative w-full max-w-[220px] mx-auto" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="82%"
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-4xl font-bold">{centerValue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{centerLabel}</p>
          </div>
        </div>
        <LegendComponent data={data} />
      </CardContent>
    </Card>
  );
};

/* ───────────────────────────────────
   Types for API
   ─────────────────────────────────── */

type MetricCard = {
  label: string;
  value: string;
};

type ReportResponse = {
  metricCards: MetricCard[];
  onboardedUsers: { data: DonutItem[] };
  userTypes: { data: DonutItem[] };
  cumulativeUsers: { data: DonutItem[] };
  error?: string;
};

/* ───────────────────────────────────
   Page component
   ─────────────────────────────────── */

export default function DataPointPage() {
  const weeks = useMemo(() => getRecentWeeks(2), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekItem>(weeks[0]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const API_BASE_URL = process.env
    .NEXT_PUBLIC_API_BASE_URL as string | undefined;

  useEffect(() => {
    async function fetchReport() {
      setReport(null);

      console.log("DataPoint selected week:", selectedWeek);

      try {
        const res = await axios.get<ReportResponse>(
          `${API_BASE_URL}/data-point`,
          {
            params: {
              startDate: selectedWeek.startDate,
              endDate: selectedWeek.endDate,
            },
          }
        );
        setReport(res.data);
        console.log("Backend API result:", res.data);
      } catch (error: any) {
        setReport({ error: error.message } as ReportResponse);
      }
    }
    if (API_BASE_URL) {
      fetchReport();
    }
  }, [selectedWeek, API_BASE_URL]);

  const headingPeriod = selectedWeek.label;
  const endLabel = new Date(selectedWeek.endDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Weekly Data For Tech Team ({headingPeriod})
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

      {!report && <div>Loading dashboard data...</div>}
      {report && report.error && (
        <div className="text-red-600">Error: {report.error}</div>
      )}

      {report && report.metricCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {report.metricCards.map((item) => (
            <Card
              key={item.label}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {report &&
        report.onboardedUsers &&
        report.userTypes &&
        report.cumulativeUsers && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <DonutCard
              title="Onboarded Users"
              data={report.onboardedUsers.data}
              centerValue={report.onboardedUsers.data.reduce(
                (sum, d) => sum + d.value,
                0
              )}
              centerLabel="Total Users"
            />
            <DonutCard
              title="User Types"
              data={report.userTypes.data}
              centerValue={report.userTypes.data.reduce(
                (sum, d) => sum + d.value,
                0
              )}
              centerLabel="Total Profiles"
            />
            <DonutCard
              title={`Users (01 Sep 24 – ${endLabel})`}
              data={report.cumulativeUsers.data}
              centerValue={report.cumulativeUsers.data.reduce(
                (sum, d) => sum + d.value,
                0
              )}
              centerLabel="Total Users"
            />
          </div>
        )}
    </div>
  );
}
