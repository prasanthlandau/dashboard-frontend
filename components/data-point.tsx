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

// Utility function: get date range for previous Monday–Sunday week
function getPreviousWeekRange(date = new Date()) {
  let today = new Date(date);
  today.setHours(0, 0, 0, 0);
  let day = today.getDay();
  day = day === 0 ? 7 : day;
  let lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - day - 6);
  let lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  return { start: lastMonday, end: lastSunday };
}

type WeekItem = {
  label: string;
  value: string;
  start: Date;
  end: Date;
};

function getRecentWeeks(count = 2): WeekItem[] {
  const weeks: WeekItem[] = [];
  let ref = new Date();
  for (let i = 0; i < count; i++) {
    const { start, end } = getPreviousWeekRange(ref);
    weeks.push({
      label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
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
      <CardContent className="flex-grow flex flex-row items-center justify-center gap-x-8 p-4">
        <div className="relative w-[220px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
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

export default function DataPointPage() {
  const weeks = useMemo(() => getRecentWeeks(2), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekItem>(weeks[0]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;

  useEffect(() => {
    async function fetchReport() {
      setReport(null);
      try {
        const res = await axios.get<ReportResponse>(
          `${API_BASE_URL}/data-point`,
          {
            params: {
              startDate: selectedWeek.start.toISOString(),
              endDate: selectedWeek.end.toISOString(),
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
          Weekly Data For Tech Team ({headingPeriod})
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
      {/* ... */}
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
              title={`Users Registered (01 Sep 2024 – ${endLabel})`}
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

