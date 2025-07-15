"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  Clock,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  TrendingUp
} from "lucide-react";

// The data provided by the user, structured for easier rendering
const USER_DATA_POINTS = [
  {
    label: "Last week's total Watchminutes",
    value: "10 Hr 21 Min",
    period: "(07th Jul to 13th Jul)",
    icon: <Clock className="w-6 h-6 text-blue-500" />
  },
  {
    label: "Total watchminutes",
    value: "2939 Hr 3 Min",
    period: "(since 1st Sep 2024)",
    icon: <TrendingUp className="w-6 h-6 text-green-500" />
  },
  {
    label: "Total Users",
    value: "6,214",
    period: "(1st Sep 2024 - 13th Jul 2025)",
    note: "including manual onboard users",
    icon: <Users className="w-6 h-6 text-purple-500" />
  },
  {
    label: "Total Students",
    value: "5,853",
    period: "(1st Sep 2024 - 13th Jul 2025)",
    note: "including manual onboard users",
    icon: <Users className="w-6 h-6 text-purple-500" />
  },
  {
    label: "Total Teachers",
    value: "361",
    period: "(1st Sep 2024 - 13th Jul 2025)",
    note: "including manual onboard users",
    icon: <Users className="w-6 h-6 text-purple-500" />
  },
  {
    label: "New users joined last week",
    value: "13",
    period: "(07th Jul to 13th Jul)",
    note: "including manual onboard users and unverified users",
    icon: <UserPlus className="w-6 h-6 text-yellow-500" />
  },
  {
    label: "Users activated last week",
    value: "11",
    period: "(07th Jul to 13th Jul)",
    note: "verified their accounts, including manual onboard",
    icon: <UserCheck className="w-6 h-6 text-green-500" />
  },
  {
    label: "Users joined but not verified",
    value: "2",
    period: "(07th Jul to 13th Jul)",
    icon: <UserX className="w-6 h-6 text-red-500" />
  }
];

export default function UserDataPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Weekly Data For Implementation Team (07 Jul 2025 – 13 Jul 2025)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {USER_DATA_POINTS.map((item) => (
          <Card key={item.label} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.period}</p>
              {item.note && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  ({item.note})
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
