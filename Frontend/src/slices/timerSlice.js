import { createSlice } from "@reduxjs/toolkit";

// mode: "idle" | "focus" | "break" | "paused_focus" | "paused_break"
const initialState = {
    mode: "idle",

    // Config (user-customizable)
    focusDuration: 25 * 60,   // seconds
    breakDuration: 5 * 60,    // seconds

    // Countdown
    remainingSeconds: 25 * 60,

    // Active session tracking
    sessionId: null,        // current phase's backend session_id
    subjectId: null,
    subjectName: null,

    // Elapsed seconds for the CURRENT phase only (resets each phase)
    elapsedPhaseSeconds: 0,

    // Total accumulated focus time across all phases (for display)
    totalFocusSeconds: 0,

    // Internal: timestamp when current interval started (ms), null if paused/idle
    intervalStartedAt: null,
};

const timerSlice = createSlice({
    name: "timer",
    initialState,
    reducers: {
        // Called when user configures and clicks "Start Session"
        sessionStarted(state, action) {
            const { sessionId, subjectId, subjectName, focusDuration, breakDuration } = action.payload;
            state.sessionId = sessionId;
            state.subjectId = subjectId;
            state.subjectName = subjectName;
            state.focusDuration = focusDuration;
            state.breakDuration = breakDuration;
            state.remainingSeconds = focusDuration;
            state.elapsedPhaseSeconds = 0;
            state.totalFocusSeconds = 0;
            state.mode = "focus";
            state.intervalStartedAt = Date.now();
        },

        // Called when a new phase starts (break after focus, or focus after break)
        phaseStarted(state, action) {
            const { sessionId } = action.payload;
            state.sessionId = sessionId;
            state.elapsedPhaseSeconds = 0;
            state.intervalStartedAt = Date.now();
        },

        // Tick every second
        tick(state) {
            state.elapsedPhaseSeconds += 1;

            if (state.mode === "focus") {
                state.totalFocusSeconds += 1;
            }

            if (state.remainingSeconds > 0) {
                state.remainingSeconds -= 1;
            }
        },

        // Focus interval ended naturally → set up break but PAUSED (awaiting user input)
        focusEnded(state) {
            state.mode = "paused_break";
            state.remainingSeconds = state.breakDuration;
            state.intervalStartedAt = null;
            state.elapsedPhaseSeconds = 0; // Reset for next phase
            state.sessionId = null; // Clear — new session will be created on resume
        },

        // Break interval ended naturally → set up focus but PAUSED (awaiting user input)
        breakEnded(state) {
            state.mode = "paused_focus";
            state.remainingSeconds = state.focusDuration;
            state.intervalStartedAt = null;
            state.elapsedPhaseSeconds = 0; // Reset for next phase
            state.sessionId = null; // Clear — new session will be created on resume
        },

        // Play/Pause toggle
        paused(state) {
            if (state.mode === "focus") {
                state.mode = "paused_focus";
                state.intervalStartedAt = null;
            } else if (state.mode === "break") {
                state.mode = "paused_break";
                state.intervalStartedAt = null;
            }
        },

        resumed(state) {
            if (state.mode === "paused_focus") {
                state.mode = "focus";
                state.intervalStartedAt = Date.now();
            } else if (state.mode === "paused_break") {
                state.mode = "break";
                state.intervalStartedAt = Date.now();
            }
        },

        // Stop — resets everything
        sessionStopped() {
            return { ...initialState };
        },

        // Update config from the customize modal (only while idle)
        configUpdated(state, action) {
            const { focusDuration, breakDuration } = action.payload;
            state.focusDuration = focusDuration;
            state.breakDuration = breakDuration;
            state.remainingSeconds = focusDuration;
        },
    },
});

export const {
    sessionStarted,
    phaseStarted,
    tick,
    focusEnded,
    breakEnded,
    paused,
    resumed,
    sessionStopped,
    configUpdated,
} = timerSlice.actions;

export default timerSlice.reducer;
