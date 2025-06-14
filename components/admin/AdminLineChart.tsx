"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart with a label"

const chartConfig = {
  count: {
    label: "Messages",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function AdminLineChart({chartData}:{chartData:any}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Analytics</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="p-5">
          <LineChart
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day"
              padding={{ left: 30, right: 30 }}
            />
            <YAxis 
              allowDecimals={false}
              domain={[0, 'auto']}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{
                fill: "#8884d8",
                strokeWidth: 2,
              }}
              activeDot={{ r: 8 }}
            >
              <LabelList
                dataKey="count"
                position="top"
                offset={10}
                fill="#666"
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          User Activity <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total users for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}
