import React from 'react';

const StatTiles = ({ data }) => {
  // Fallback in case data hasn't loaded yet
  if (!data) return null;

  // Helper function to format seconds into a clean "Xh Ym" string
  const formatTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return '0m';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  // Array of tile configurations makes it easy to map over them and render consistently
  const tiles = [
    {
      title: 'Total Focus Time',
      value: formatTime(data.total_focus_time),
      subtitle: 'Last 7 Days',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Sessions Completed',
      value: data.sessions_completed || 0,
      subtitle: 'Focus blocks finished',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Average Session',
      value: formatTime(data.average_session_time),
      subtitle: 'Time per focus block',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
      ),
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Top Subject',
      value: data.top_subject || 'None',
      subtitle: 'Most time spent on',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {tiles.map((tile, index) => (
        <div
          key={index}
          className="
            group
            relative
            overflow-hidden
            bg-slate-900
            border
            border-slate-800
            rounded-3xl
            p-6
            transition-all
            duration-300
            hover:border-indigo-500/40
            hover:-translate-y-1
            hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]
          "
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          
          <div className="relative flex items-start justify-between">
            {/* Left Content */}
            <div>
              <p className="text-sm font-medium text-slate-400">
                {tile.title}
              </p>

              <h3 className="mt-3 text-3xl font-bold text-white tracking-tight">
                {tile.value}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                {tile.subtitle}
              </p>
            </div>

            {/* Icon */}
            <div
              className={`
                p-3
                rounded-2xl
                ${tile.bgColor}
                bg-opacity-10
                border
                border-white/5
              `}
            >
              {tile.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default StatTiles;