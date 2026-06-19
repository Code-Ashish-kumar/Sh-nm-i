import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector'; // Adjust path if needed
import { analyticsEndpoints } from '../services/api'; // Adjust path if needed

import StatTiles from '../components/core/Analytics/StatTiles';
import SubjectPieChart from '../components/core/Analytics/SubjectPieChart'; 
import SessionBarGraph from '../components/core/Analytics/SessionBarGraph';
import TodoHeatmap from '../components/core/Analytics/TodoHeatmap';
import DailyTimelineGraph from '../components/core/Analytics/DailyTimelineGraph'; 

const Analytics = () => {
  // 1. State for Dashboard Data
  // const [dashboardData, setDashboardData] = useState({
  //   tileStats: null,
  //   pieChart: [],
  //   barGraph: [],
  //   heatmap: []
  // });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // 2. State for Timeline Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  const token = useSelector((state) => state.auth.token); 
  
  // 3. Fetch Dashboard Data on Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsDashboardLoading(true);
        const response = await apiConnector(
          "GET", 
          analyticsEndpoints.USER_ANALYTICS_API, 
          null, 
          { Authorization: `Bearer ${token}` } // Send token in headers
        );
        
        // Destructure and save to state
        const { tileStats, pieChart, barGraph, heatmap } = response;
        // setDashboardData({ tileStats, pieChart, barGraph, heatmap });
      } catch (error) {
        console.error("Could not fetch analytics dashboard data:", error);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const [dashboardData, setDashboardData] = useState({
  tileStats: {
    total_focus_time: 48600, // 13h 30m
    sessions_completed: 24,
    average_session_time: 2025, // ~34m
    top_subject: "Data Structures"
  },

  pieChart: [
    {
      subject_name: "Data Structures",
      total_duration: 16200 // 4h 30m
    },
    {
      subject_name: "Operating Systems",
      total_duration: 10800 // 3h
    },
    {
      subject_name: "DBMS",
      total_duration: 9000 // 2h 30m
    },
    {
      subject_name: "Computer Networks",
      total_duration: 7200 // 2h
    },
    {
      subject_name: "System Design",
      total_duration: 5400 // 1h 30m
    }
  ],

  barGraph: [
    {
      date: "2026-06-12",
      focus_duration: 7200,
      break_duration: 1200
    },
    {
      date: "2026-06-13",
      focus_duration: 5400,
      break_duration: 900
    },
    {
      date: "2026-06-14",
      focus_duration: 10800,
      break_duration: 1800
    },
    {
      date: "2026-06-15",
      focus_duration: 3600,
      break_duration: 600
    },
    {
      date: "2026-06-16",
      focus_duration: 12600,
      break_duration: 2100
    },
    {
      date: "2026-06-17",
      focus_duration: 9000,
      break_duration: 1500
    },
    {
      date: "2026-06-18",
      focus_duration: 7200,
      break_duration: 1200
    }
  ],

  heatmap: [
    {
      date: "2026-05-20",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-05-21",
      completed_tasks: 3,
      total_tasks: 5
    },
    {
      date: "2026-05-22",
      completed_tasks: 1,
      total_tasks: 4
    },
    {
      date: "2026-05-23",
      completed_tasks: 4,
      total_tasks: 5
    },
    {
      date: "2026-05-24",
      completed_tasks: 0,
      total_tasks: 3
    },
    {
      date: "2026-05-25",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-05-26",
      completed_tasks: 2,
      total_tasks: 4
    },
    {
      date: "2026-05-27",
      completed_tasks: 4,
      total_tasks: 4
    },
    {
      date: "2026-05-28",
      completed_tasks: 3,
      total_tasks: 5
    },
    {
      date: "2026-05-29",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-05-30",
      completed_tasks: 1,
      total_tasks: 4
    },
    {
      date: "2026-05-31",
      completed_tasks: 4,
      total_tasks: 5
    },
    {
      date: "2026-06-01",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-02",
      completed_tasks: 2,
      total_tasks: 4
    },
    {
      date: "2026-06-03",
      completed_tasks: 3,
      total_tasks: 4
    },
    {
      date: "2026-06-04",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-05",
      completed_tasks: 4,
      total_tasks: 5
    },
    {
      date: "2026-06-06",
      completed_tasks: 1,
      total_tasks: 4
    },
    {
      date: "2026-06-07",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-08",
      completed_tasks: 4,
      total_tasks: 5
    },
    {
      date: "2026-06-09",
      completed_tasks: 3,
      total_tasks: 5
    },
    {
      date: "2026-06-10",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-11",
      completed_tasks: 2,
      total_tasks: 4
    },
    {
      date: "2026-06-12",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-13",
      completed_tasks: 4,
      total_tasks: 5
    },
    {
      date: "2026-06-14",
      completed_tasks: 3,
      total_tasks: 4
    },
    {
      date: "2026-06-15",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-16",
      completed_tasks: 4,
      total_tasks: 4
    },
    {
      date: "2026-06-17",
      completed_tasks: 5,
      total_tasks: 5
    },
    {
      date: "2026-06-18",
      completed_tasks: 5,
      total_tasks: 5
    }
  ]
});

  // 4. Fetch Timeline Data when a Bar is Clicked
  const handleDayClick = async (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    setIsTimelineLoading(true);
    
    try {
      // Fetch data for the specific clicked date using query params
      const response = await apiConnector(
        "GET", 
        `${analyticsEndpoints.USER_TIMELINE_API}?date=${date}`, 
        null, 
        { Authorization: `Bearer ${token}` }
      );
      
      setTimelineData(response.data.dailyTimeline || []);
    } catch (error) {
      console.error("Could not fetch daily timeline data:", error);
      setTimelineData([]);
    } finally {
      setIsTimelineLoading(false);
    }
  };

  // 5. Loading State UI
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl font-semibold text-slate-400 animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 relative">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            Analytics Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Understand your study habits and productivity trends.
          </p>
        </div>

        {/* ======================= */}
        {/* Stat Tiles */}
        {/* ======================= */}
        <div className="mb-8">
          <StatTiles data={dashboardData.tileStats} />
        </div>

        {/* ======================= */}
        {/* Heatmap + Pie Chart */}
        {/* ======================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

          {/* Heatmap */}
          {/* <div
            className="
              xl:col-span-8
              bg-slate-900
              border border-slate-800
              rounded-3xl
              p-6
              shadow-lg
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Consistency Heatmap
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Task completion activity during the last 30 days
              </p>
            </div>

            {/* <TodoHeatmap data={dashboardData.heatmap} /> 
            
          </div> */}

        <div
          className="
            xl:col-span-8
              bg-slate-900
              border border-slate-800
              rounded-3xl
              p-6
              shadow-lg
          "
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Daily Activity Analysis
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Click bars to inspect timeline
            </div>

            <p className="text-sm text-slate-400 mt-1">
              Focus vs break time over the last 7 days.
              Click a day to inspect its timeline.
            </p>
          </div>

          <SessionBarGraph
            data={dashboardData.barGraph}
            onDayClick={handleDayClick}
          />
        </div>

          {/* Pie Chart */}
          <div
            className="
              xl:col-span-4
              bg-slate-900
              border border-slate-800
              rounded-3xl
              p-6
              shadow-lg
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Subject Distribution
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Time allocation across subjects
              </p>
            </div>

            <SubjectPieChart data={dashboardData.pieChart} />
          </div>

        </div>

        {/* ======================= */}
        {/* Activity Graph */}
        {/* ======================= */}
        <div
          className="
            bg-slate-900
            border border-slate-800
            rounded-3xl
            p-6
            shadow-lg
          "
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Daily Activity Analysis
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Click bars to inspect timeline
            </div>

            <p className="text-sm text-slate-400 mt-1">
              Focus vs break time over the last 7 days.
              Click a day to inspect its timeline.
            </p>
          </div>

          <SessionBarGraph
            data={dashboardData.barGraph}
            onDayClick={handleDayClick}
          />
        </div>

      </div>
        
        

      {/* 4. The Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl w-11/12 max-w-4xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Daily Timeline
                </h2>
                <p className="text-sm text-slate-400`">
                  Hourly breakdown for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content: Show Spinner if API is still fetching, else show Chart */}
            <div className="w-full h-80">
              {isTimelineLoading ? (
                <div className="flex items-center justify-center h-full text-indigo-500 animate-pulse">
                  Loading timeline data...
                </div>
              ) : timelineData.length > 0 ? (
                 <DailyTimelineGraph data={timelineData} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-800 rounded-xl">
                  No activity recorded for this date.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;