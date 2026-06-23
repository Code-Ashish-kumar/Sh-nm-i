import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const monoFont = "'JetBrains Mono', monospace";

const SessionBarGraph = ({ data, onDayClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[420px] text-[#7A7164] text-sm">
        No activity data available
      </div>
    );
  }

  const formatTooltipDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const formatYAxisTick = (seconds) => {
    const hrs = Math.floor(seconds / 3600);

    if (hrs === 0) return "";
    return `${hrs}h`;
  };

  const formatXAxisTick = (dateStr) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient
              id="focusGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#F07A5F" />
              <stop offset="100%" stopColor="#E8553D" />
            </linearGradient>

            <linearGradient
              id="breakGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#A9C599" />
              <stop offset="100%" stopColor="#8FAE7D" />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#2A241E"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#A89F94",
              fontSize: 12,
              fontFamily: monoFont,
            }}
            dy={10}
          />

          <YAxis
            tickFormatter={formatYAxisTick}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#A89F94",
              fontSize: 12,
              fontFamily: monoFont,
            }}
            width={45}
          />

          <Tooltip
            cursor={{
              fill: "rgba(232,85,61,0.08)",
            }}
            contentStyle={{
              background: "#1F1A16",
              border: "1px solid #2A241E",
              borderRadius: "16px",
              color: "#F2EAE0",
              boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
              fontFamily: monoFont,
              fontSize: "12px",
              padding: "10px 14px",
            }}
            labelStyle={{
              color: "#A89F94",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#F2EAE0",
            }}
            formatter={(value) => formatTooltipDuration(value)}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                }
              )
            }
          />

          <Legend
            wrapperStyle={{
              color: "#A89F94",
              paddingTop: "20px",
              fontSize: "12px",
              fontFamily: monoFont,
            }}
            iconType="square"
          />

          <Bar
            dataKey="focus_duration"
            name="Focus Time"
            stackId="a"
            fill="url(#focusGradient)"
            radius={[0, 0, 10, 10]}
            maxBarSize={46}
            cursor="pointer"
            onClick={(item) =>
              onDayClick?.(item.date)
            }
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                style={{
                  transition: "all .3s ease",
                }}
              />
            ))}
          </Bar>

          <Bar
            dataKey="break_duration"
            name="Break Time"
            stackId="a"
            fill="url(#breakGradient)"
            radius={[10, 10, 0, 0]}
            maxBarSize={46}
            cursor="pointer"
            onClick={(item) =>
              onDayClick?.(item.date)
            }
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                style={{
                  transition: "all .3s ease",
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SessionBarGraph;