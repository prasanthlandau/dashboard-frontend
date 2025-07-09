
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Users, Clock, BookOpen, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 1300 },
  { name: 'Mar', value: 1200 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 1000 },
  { name: 'Jun', value: 900 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">/ Executive Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Data from: 25-08-2024 to 08-07-2025
            </div>
            <select className="bg-background border border-input rounded-md px-3 py-1 text-sm">
              <option>Default</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                LL
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)]">
          <nav className="p-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              <span className="font-medium">Dashboard</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Course WatchTime
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">368 Hrs</div>
                <p className="text-sm text-muted-foreground mt-1">
                  1 Hrs this week
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  HW WatchTime
                </CardTitle>
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2694 Hrs</div>
                <p className="text-sm text-muted-foreground mt-1">
                  2 Hrs this week
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Classrooms
                </CardTitle>
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">386</div>
                <p className="text-sm text-muted-foreground mt-1">
                  3 this week
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Homeworks
                </CardTitle>
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1267</div>
                <p className="text-sm text-muted-foreground mt-1">
                  11 this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analytics Overview</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-muted-foreground">User Accounts Created</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
