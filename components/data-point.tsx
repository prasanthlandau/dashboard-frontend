"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@mui/x-charts";
import { CircularProgress, Alert } from "@mui/material";
import axios from "axios";

// Define the base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// A custom legend component that filters out zero-value items
const Legend = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="flex flex-col justify-center space-y-2">
    {data.map((item) =>
      item.value > 0 ? (
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

// The main component, now fetching data
export default function DataPoint({ selectedWeek, selectedWeekLabel }: { selectedWeek: string, selectedWeekLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedWeek) return;

    setLoading(true);
    setError(null);
    try {
      const [startDate, endDate] = selectedWeek.split('_');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // --- (EDIT) Use the absolute API_BASE_URL ---
      const url = `${API_BASE_URL}/reports/data-point?${params.toString()}`;
      const response = await axios.get(url);
      setData(response.data);
    } catch (e: any) {
      console.error('Error fetching data point report:', e);
      setError(e.message || "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><CircularProgress /></div>;
  }

  if (error) {
    return <Alert severity="error">Error fetching data: {error}</Alert>;
  }

  if (!data) {
    return <Alert severity="info">No data available for the selected period.</Alert>;
  }

  const { metricCards, onboardedUsers, userTypes, cumulativeUsers } = data;

  const totalOnboardedUsers = onboardedUsers.data.reduce((sum: number, d: { value: number }) => sum + d.value, 0);
  const totalProfiles = userTypes.data.reduce((sum: number, d: { value: number }) => sum + d.value, 0);
  const totalCumulativeUsers = cumulativeUsers.data.reduce((sum: number, d: { value: number }) => sum + d.value, 0);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Weekly Data For Tech Team ({selectedWeekLabel})
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((item: { label: string, value: string }) => (
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

      {/* Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <DonutCard
          title="Onboarded Users"
          data={onboardedUsers.data}
          centerValue={totalOnboardedUsers}
          centerLabel="Total Users"
        />
        <DonutCard
          title="User Types"
          data={userTypes.data}
          centerValue={totalProfiles}
          centerLabel="Total Profiles"
        />
        <DonutCard
          title="Users Registered From Sep 1st to Today"
          data={cumulativeUsers.data}
          centerValue={totalCumulativeUsers}
          centerLabel="Total Users"
        />
      </div>
    </div>
  );
}
