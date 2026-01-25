"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatus } from "@/types";
import { Clock, BarChart3, PieChart, TrendingUp, Users } from "lucide-react";

// Mock data for charts
const statusData = [
  { name: "Submitted", value: 12, color: "#3b82f6" },
  { name: "Under Review", value: 8, color: "#8b5cf6" },
  { name: "Needs More Info", value: 5, color: "#f59e0b" },
  { name: "Accepted", value: 7, color: "#10b981" },
  { name: "Rejected", value: 3, color: "#ef4444" }
];

const approvalTimeData = [
  { month: "Jan", days: 14 },
  { month: "Feb", days: 12 },
  { month: "Mar", days: 15 },
  { month: "Apr", days: 10 },
  { month: "May", days: 8 },
  { month: "Jun", days: 9 }
];

const fundingRateData = [
  { month: "Jan", rate: 75 },
  { month: "Feb", rate: 82 },
  { month: "Mar", rate: 78 },
  { month: "Apr", rate: 90 },
  { month: "May", rate: 88 },
  { month: "Jun", rate: 92 }
];

// Mock chart components
const DonutChart = ({ data }: { data: any[] }) => (
  <div className="flex h-44 items-center justify-center">
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {data.map((item, index) => {
          const total = data.reduce((acc, d) => acc + d.value, 0);
          const startAngle = data
            .slice(0, index)
            .reduce((acc, d) => acc + (d.value / total) * 360, 0);
          const endAngle = startAngle + (item.value / total) * 360;

          // Convert to radians
          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);

          // Calculate the coordinates
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          // Create the arc path
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
          const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="#fff"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold">{data.reduce((acc, d) => acc + d.value, 0)}</span>
        <span className="text-xs">Total</span>
      </div>
    </div>
  </div>
);

const BarChart = ({ data, valueKey, nameKey }: { data: any[], valueKey: string, nameKey: string }) => (
  <div className="h-44 w-full">
    <div className="flex h-full items-end gap-2 pr-2">
      {data.map((item, index) => {
        const value = item[valueKey];
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        const height = `${(value / maxValue) * 100}%`;
        
        return (
          <div key={index} className="flex h-full flex-1 flex-col items-center justify-end">
            <div 
              className="w-full rounded-t-sm bg-primary" 
              style={{ height }}
              title={`${item[nameKey]}: ${value}`}
            />
            <span className="mt-1 w-full truncate text-center text-xs">
              {item[nameKey]}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const LineChart = ({ data, valueKey, nameKey }: { data: any[], valueKey: string, nameKey: string }) => (
  <div className="h-44 w-full">
    <svg className="h-full w-full" viewBox="0 0 100 50">
      {data.map((item, index) => {
        if (index === 0) return null;
        
        const prev = data[index - 1];
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        
        const x1 = ((index - 1) / (data.length - 1)) * 100;
        const y1 = 50 - ((prev[valueKey] / maxValue) * 45);
        const x2 = (index / (data.length - 1)) * 100;
        const y2 = 50 - ((item[valueKey] / maxValue) * 45);
        
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
        );
      })}
      
      {data.map((item, index) => {
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        const x = (index / (data.length - 1)) * 100;
        const y = 50 - ((item[valueKey] / maxValue) * 45);
        
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="1.5"
            fill="white"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  </div>
);

export function ApplicationAnalytics() {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Applications by Status</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Current status distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart data={statusData} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-xs">{status.name}: {status.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Average Approval Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Days to process applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">11.3 days</span>
            <span className="text-xs text-green-500">↓ 18%</span>
          </div>
          <BarChart data={approvalTimeData} valueKey="days" nameKey="month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Funding Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Percentage of approved applications funded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">84.2%</span>
            <span className="text-xs text-green-500">↑ 6%</span>
          </div>
          <LineChart data={fundingRateData} valueKey="rate" nameKey="month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Applications Processed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Monthly application processing metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">35</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div>
              <p className="text-2xl font-bold">214</p>
              <p className="text-xs text-muted-foreground">This year</p>
            </div>
            <div>
              <p className="text-2xl font-bold">75%</p>
              <p className="text-xs text-muted-foreground">Acceptance rate</p>
            </div>
          </div>
          <div className="h-1 w-full bg-muted">
            <div className="h-1 w-3/4 bg-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Investor Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Investor participation metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Investors per Lot</p>
              <p className="text-xl font-bold">4.3</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Utilization Rate</p>
              <p className="text-xl font-bold">89%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Repeat Investors</p>
              <p className="text-xl font-bold">68%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">New Investors</p>
              <p className="text-xl font-bold">23</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Applications due for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Today", "Tomorrow", "This Week"].map((timeframe, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{timeframe}</span>
                </div>
                <span className="font-medium text-sm">{5 - i * 2}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 