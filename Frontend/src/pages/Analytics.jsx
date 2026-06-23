import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { apiConnector } from '../services/apiConnector';
import { analyticsEndpoints } from '../services/api';
import { fetchAnalyticsDashboard } from '../services/Operations/analyticsAPI';
import { logout } from '../services/Operations/authAPI';
import { clearAuth } from '../slices/authSlice';

import SideNav from '../components/layout/SideNav';
import StatTiles from '../components/core/Analytics/StatTiles';
import SubjectPieChart from '../components/core/Analytics/SubjectPieChart';
import SessionBarGraph from '../components/core/Analytics/SessionBarGraph';
import TodoHeatmap from '../components/core/Analytics/TodoHeatmap';
import DailyTimelineGraph from '../components/core/Analytics/DailyTimelineGraph';

const displayFont = { fontFamily: "'Fraunces', Georgia, serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState({
    tileStats: null,
    pieChart: [],
    barGraph: [],
    heatmap: []
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const isIdle = false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  // const token = useSelector((state) => state.auth.token);

  const fillLast7Days = (barGraphData) => {
    const map = new Map();

    barGraphData.forEach((item) => {
      const date = new Date(item.date).toISOString().split("T")[0];
      map.set(date, item);
    });

    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      result.push(
        map.get(dateStr) || {
          date: dateStr,
          focus_duration: 0,
          break_duration: 0,
        }
      );
    }

    return result;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsDashboardLoading(true);
        // const response = await apiConnector(
        //   "GET",
        //   analyticsEndpoints.USER_ANALYTICS_API,
        //   null
        // );

        const { tileStats, pieChart, barGraph, heatmap } = await fetchAnalyticsDashboard();
        setDashboardData({
          tileStats,
          pieChart,
          barGraph: fillLast7Days(barGraph),
          heatmap,
        });
      } catch (error) {
        console.error("Could not fetch analytics dashboard data:", error);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch { /* ignore */ }

    dispatch(clearAuth());
    navigate("/");
  };

  const handleDayClick = async (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    setIsTimelineLoading(true);

    try {
      const response = await apiConnector(
        "GET",
        `${analyticsEndpoints.USER_TIMELINE_API}?date=${date}`,
        null,
      );

      console.log("Daily timeline API response:", response);

      setTimelineData(response.dailyTimeline || []);
    } catch (error) {
      console.error("Could not fetch daily timeline data:", error);
      setTimelineData([]);
    } finally {
      setIsTimelineLoading(false);
    }
  };

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-[#15120F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2A241E] border-t-[#E8553D] rounded-full animate-spin" />
          <p className="text-sm text-[#A89F94]" style={monoFont}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15120F] flex">
      <SideNav
        userName={user?.name}
        onLogout={handleLogout}
        darkMode={!isIdle}
      />

      <main className="flex-1 relative ml-16 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-[0.2em] text-[#E8553D] mb-2"
              style={monoFont}
            >
              Study Analytics
            </p>
            <h1 className="text-4xl text-[#F2EAE0]" style={displayFont}>
              Your focus, mapped
            </h1>
            <p className="text-[#A89F94] mt-2">
              Understand your study habits and productivity trends.
            </p>
          </div>

          {/* Stat Tiles */}
          <div className="mb-8">
            <StatTiles data={dashboardData.tileStats} />
          </div>

          {/* Activity Graph + Subject Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">

            <div className="xl:col-span-8 bg-[#1F1A16] border border-[#2A241E] rounded-md p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl text-[#F2EAE0]" style={displayFont}>
                    Daily Activity
                  </h2>
                  <p className="text-sm text-[#A89F94] mt-1">
                    Focus vs. break time over the last 7 days
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#A89F94] shrink-0 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8553D]" />
                  Click a bar to inspect
                </div>
              </div>

              <SessionBarGraph
                data={dashboardData.barGraph}
                onDayClick={handleDayClick}
              />
            </div>

            <div className="xl:col-span-4 bg-[#1F1A16] border border-[#2A241E] rounded-md p-6">
              <div className="mb-8 lg:mb-14">
                <h2 className="text-xl text-[#F2EAE0]" style={displayFont}>
                  Subject Distribution
                </h2>
                <p className="text-sm text-[#A89F94] mt-1">
                  Time allocation across subjects
                </p>
              </div>

              <SubjectPieChart data={dashboardData.pieChart} />
            </div>

          </div>

          {/* Consistency Heatmap
          <div className="bg-[#1F1A16] border border-[#2A241E] rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-xl text-[#F2EAE0]" style={displayFont}>
                Consistency
              </h2>
              <p className="text-sm text-[#A89F94] mt-1">
                Task completion activity over the last 30 days
              </p>
            </div>

            <TodoHeatmap data={dashboardData.heatmap} />
          </div> */}

        </div>

        {/* Timeline Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1F1A16] border border-[#2A241E] p-6 rounded-3xl shadow-2xl w-11/12 max-w-4xl relative">
              <div className="absolute top-0 left-6 right-6 h-[3px] bg-[#E8553D] rounded-b-full" />

              <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                  <h2 className="text-2xl text-[#F2EAE0]" style={displayFont}>
                    Daily Timeline
                  </h2>
                  <p className="text-sm text-[#A89F94] mt-1">
                    Hourly breakdown for{" "}
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#A89F94] hover:text-[#F2EAE0] bg-[#15120F] hover:bg-[#2A241E] border border-[#2A241E] rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="w-full h-80">
                {isTimelineLoading ? (
                  <div className="flex items-center justify-center h-full text-[#E8553D] text-sm" style={monoFont}>
                    Loading timeline data…
                  </div>
                ) : timelineData.length > 0 ? (
                  <DailyTimelineGraph data={timelineData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#A89F94] bg-[#15120F] border border-[#2A241E] rounded-xl">
                    No activity recorded for this date.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;