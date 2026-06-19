import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const DailyTimelineGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No session data available for this day.
      </div>
    );
  }

  // Format tooltip to show accurate hours/minutes
  const formatTooltipDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return [`${hrs}h ${mins}m`];
    if (hrs > 0) return [`${hrs}h`];
    return [`${mins}m`];
  };

  // Convert raw seconds to just minutes (or hours) for the Y-Axis ticks
  const formatYAxisTick = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins}m` : '0';
  };

  // Format the 24-hour integers (0, 1, 14, 23) into clean readable times (12 AM, 1 AM, 2 PM)
  const formatHourLabel = (hour) => {
    if (hour === 0 || hour === 24) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Custom Tooltip Label (e.g., changing "14" to "2:00 PM - 3:00 PM")
  const formatTooltipLabel = (hour) => {
    const nextHour = hour + 1;
    return `${formatHourLabel(hour)} - ${formatHourLabel(nextHour)}`;
  };

  // Define the exact ticks we want to show on the X-axis (every 4 hours to prevent crowding)
  const xTicks = [0, 4, 8, 12, 16, 20, 24];

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          <XAxis 
            dataKey="hour" 
            type="number" // Forces a continuous 0-24 numerical scale
            domain={[0, 24]} 
            ticks={xTicks} // Locks the labels to specific intervals
            tickFormatter={formatHourLabel} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          
          <YAxis 
            tickFormatter={formatYAxisTick} 
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip 
            formatter={formatTooltipDuration}
            labelFormatter={formatTooltipLabel}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          
          <Legend verticalAlign="top" height={36} />
          
          {/* SOLID LINE: Focus Time */}
          <Line 
            type="monotone" 
            dataKey="focus_duration" 
            name="Focus Time" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          
          {/* DOTTED LINE: Break Time */}
          {/* strokeDasharray="5 5" creates the dotted/dashed effect */}
          <Line 
            type="monotone" 
            dataKey="break_duration" 
            name="Break Time" 
            stroke="#10b981" 
            strokeWidth={3}
            strokeDasharray="5 5" 
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTimelineGraph;