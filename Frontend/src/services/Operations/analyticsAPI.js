import { apiConnector } from "../apiConnector";
import { analyticsEndpoints } from "../api";
import { setStreak } from "../../slices/streakSlice";

const { USER_ANALYTICS_API, USER_TIMELINE_API, USER_CURRENT_STREAK_API } = analyticsEndpoints;

export async function fetchAnalyticsDashboard() {
    try {
        const data = await apiConnector("GET", USER_ANALYTICS_API);
        return data;
    } catch (error) {
        console.error("FETCH ANALYTICS DASHBOARD ERROR:", error);
        throw error;
    }
}

export async function fetchDailyTimeline(date) {
    try {
        const data = await apiConnector("GET", `${USER_TIMELINE_API}?date=${date}`);
        return data;
    } catch (error) {
        console.error("FETCH DAILY TIMELINE ERROR:", error);
        throw error;
    }
}

export async function fetchCurrentStreak(dispatch) {
    try {
        const data = await apiConnector("GET", analyticsEndpoints.USER_CURRENT_STREAK_API);
        
        // console.log("FETCH CURRENT STREAK RESPONSE:", data);
        dispatch(setStreak(data.current_streak || 0));
    } catch (error) {
        console.error("FETCH CURRENT STREAK ERROR:", error);
        throw error;
    }
};