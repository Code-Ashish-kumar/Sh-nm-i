import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#818CF8",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#22D3EE",
];

const SubjectPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-slate-500">
        No session data available
      </div>
    );
  }

  const totalDuration = data.reduce(
    (sum, item) => sum + item.total_duration,
    0
  );

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const formatTooltipDuration = (seconds) => {
    return [formatDuration(seconds), "Time Spent"];
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total_duration"
            nameKey="subject_name"
            cx="50%"
            cy="45%"
            innerRadius={75}
            outerRadius={115}
            paddingAngle={3}
            stroke="none"
            labelLine={false}
            activeOuterRadius={125}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Center Content */}
          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#CBD5E1"
            fontSize="12"
          >
            Total Focus
          </text>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FFFFFF"
            fontSize="22"
            fontWeight="700"
          >
            {Math.floor(totalDuration / 3600)}h
          </text>

          <Tooltip
            formatter={formatTooltipDuration}
            contentStyle={{
              backgroundColor: "#0F172A",
              border: "1px solid #334155",
              borderRadius: "16px",
              color: "#fff",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.35)",
            }}
            labelStyle={{
              color: "#CBD5E1",
            }}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.map((subject, index) => (
              <div
                key={subject.subject_name}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[index % COLORS.length],
                  }}
                />

                <span className="text-slate-300 truncate">
                  {subject.subject_name}
                </span>
              </div>
            ))}
          </div>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectPieChart;