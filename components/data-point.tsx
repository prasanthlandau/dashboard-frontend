"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@mui/x-charts/PieChart";

const METRIC_CARDS = [
  { label: "Total Watch Time", value: "10 Hr 21 Min" },
  { label: "Course Library Watch Time", value: "5 Hr 48 Min" },
  { label: "Homework Watch Time", value: "4 Hr 33 Min" },
  { label: "Total Homework Created", value: "8" }
];

// Data for the Profile Distribution chart
const PROFILE_DISTRIBUTION_DATA = [
  { id: 0, value: 4, label: "Teachers", color: "#4caf50" },
  { id: 1, value: 7, label: "Students", color: "#1976d2" }
];

// Data for the Onboarded User distribution chart
const ONBOARDED_PIE_DATA = [
  { id: 0, value: 0, label: "Manual", color: "#66bb6a" },
  { id: 1, value: 11, label: "Self", color: "#42a5f5" }
];

// Data for the new Cumulative User Distribution chart
const CUMULATIVE_DONUT_DATA = [
    { id: 0, value: 5853, label: "Students", color: "#1976d2" },
    { id: 1, value: 361, label: "Teachers", color: "#4caf50" }
];


// A custom legend component that filters out zero-value items
const Legend = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="flex flex-col justify-center space-y-2">
    {data.map((item) =>
      item.value > 0 ? ( // Only render legend item if value is greater than 0
        <div key={item.label} className="flex items-center text-sm">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          />
          <span>{`${item.label}: `}</span>
          <span className="font-semibold ml-1">{item.value.toLocaleString()}</span>
        </div>
      ) : null
    )}
  </div>
);

// A reusable component for a larger, cleaner donut chart with a side legend
const DonutCard = ({ title, data, centerLabel, centerValue }: any) => (
  <Card className="flex flex-col h-full w-full mx-auto">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-center">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow flex flex-row items-center justify-center gap-x-8 p-4">
      <div className="relative w-[220px] h-[220px]">
        <PieChart
          series={[
            {
              data,
              innerRadius: 75,
              outerRadius: 100,
              // We remove the arcLabel and legend to use our custom implementation
            }
          ]}
          legend={{ hidden: true }}
          margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-bold">{centerValue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <Legend data={data} />
    </CardContent>
  </Card>
);

export default function DataPointPage() {
  const totalOnboardedUsers = ONBOARDED_PIE_DATA.reduce(
    (sum, d) => sum + d.value,
    0
  );

  const totalProfiles = PROFILE_DISTRIBUTION_DATA.reduce(
    (sum, d) => sum + d.value,
    0
  );

  const totalCumulativeUsers = CUMULATIVE_DONUT_DATA.reduce(
    (sum, d) => sum + d.value,
    0
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Weekly Data For Tech Team (07 Jul 2025 – 13 Jul 2025)
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {METRIC_CARDS.map((item) => (
          <Card key={item.label} className="shadow-md hover:shadow-lg transition-shadow">
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

      {/* Donut Charts - now in a 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <DonutCard
          title="Onboarded Users"
          data={ONBOARDED_PIE_DATA}
          centerValue={totalOnboardedUsers}
          centerLabel="Total Users"
        />
        <DonutCard
          title="User Types"
          data={PROFILE_DISTRIBUTION_DATA}
          centerValue={totalProfiles}
          centerLabel="Total Profiles"
        />
        <DonutCard
          title="Users Registered From Sep 1st to Today"
          data={CUMULATIVE_DONUT_DATA}
          centerValue={totalCumulativeUsers}
          centerLabel="Total Users"
        />
      </div>
    </div>
  );
}
