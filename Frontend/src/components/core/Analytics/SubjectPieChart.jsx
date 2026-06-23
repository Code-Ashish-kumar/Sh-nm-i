import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const monoFont = "'JetBrains Mono', monospace";

const COLORS = [
  "#E8553D", // tomato
  "#8FAE7D", // sage
  "#D9A441", // marigold
  "#6FA3A0", // teal
  "#B5739E", // plum
  "#6B8CAE", // denim
];

const SubjectPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-[#7A7164] text-sm">
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
            stroke="#1F1A16"
            strokeWidth={2}
            labelLine={false}
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
            y="41%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A89F94"
            fontSize="11"
            fontFamily={monoFont}
            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Total Focus
          </text>

          <text
            x="50%"
            y="51%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#E8553D"
            fontSize="24"
            fontWeight="600"
            fontFamily={monoFont}
          >
            {Math.floor(totalDuration / 3600)}h
          </text>

          <Tooltip
            contentStyle={{
              backgroundColor: "#1F1A16",
              border: "1px solid #2A241E",
              borderRadius: "16px",
              color: "#F2EAE0",
              fontFamily: monoFont,
              fontSize: "12px",
              padding: "10px 14px",
            }}
            itemStyle={{ color: "#F2EAE0" }}
            labelStyle={{ color: "#A89F94" }}
            formatter={(value, name, props) => {
              const percentage = (
                (value / totalDuration) *
                100
              ).toFixed(1);

              return [
                `${formatDuration(value)} (${percentage}%)`,
                props.payload.subject_name,
              ];
            }}
          />

          {/* <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              color: "#A89F94",
              paddingTop: "20px",
              fontSize: "12px",
              fontFamily: monoFont,
            }}
          /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectPieChart;