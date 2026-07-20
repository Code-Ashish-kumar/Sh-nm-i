import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DemoTimer from "../components/timer/DemoTimer";
import { useSelector } from "react-redux";

import { FiClock, FiBarChart2, FiShield } from "react-icons/fi";

// Feature icons as inline SVGs
const ClockIcon = () => <FiClock size={28} className="stroke-[1.5]" />;
const ChartIcon = () => <FiBarChart2 size={28} className="stroke-[1.5]" />;
const ShieldIcon = () => <FiShield size={28} className="stroke-[1.5]" />;

const FEATURES = [
    {
        tag: "01",
        title: "Pomodoro Timer",
        desc: "Session-based deep work. Lock in, block out, get it done.",
        icon: <ClockIcon />,
    },
    {
        tag: "02",
        title: "Subject Analytics",
        desc: "See exactly where your hours go — by subject, by day, by week.",
        icon: <ChartIcon />,
    },
    {
        tag: "03",
        title: "Accountability",
        desc: "Share your progress. Stay honest. Show up consistently.",
        icon: <ShieldIcon />,
    },
];

export default function Home() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* ── Hero Section (Two-column) ────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                {/* Left column: copy + CTAs */}
                <div className="flex-1 max-w-xl">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#1a1a1a]/40 mb-4 font-medium">
                        focus / track / commit
                    </p>

                    <h1 className="text-5xl lg:text-6xl font-extrabold text-[#1a1a1a] leading-[1.05] tracking-tight mb-6">
                        Your time,<br />
                        <span className="text-[#1a1a1a]">accounted for.</span>
                    </h1>

                    <p className="text-base text-[#1a1a1a]/55 leading-relaxed mb-8 max-w-md">
                        A pomodoro timer that doesn't let you lie to yourself.
                        Track subjects, measure output, and stay accountable —
                        every session, every day.
                    </p>

                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-6 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-6">
                            <Link
                                to="/register"
                                className="px-6 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
                            >
                                Start Tracking
                            </Link>
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors cursor-pointer border-b border-transparent hover:border-[#1a1a1a]/30"
                            >
                                Sign In →
                            </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: live demo timer */}
                <div className="flex-shrink-0">
                    <DemoTimer />
                </div>
            </section>

            {/* ── Features Section ─────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {FEATURES.map((f) => (
                        <div
                            key={f.tag}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] rounded-xl p-6 flex flex-col gap-4"
                        >
                            {/* Icon */}
                            <div className="text-[#1a1a1a]/70">
                                {f.icon}
                            </div>

                            {/* Tag */}
                            <span className="text-[10px] uppercase tracking-[0.12em] text-[#1a1a1a]/35 font-medium">
                                {f.tag}
                            </span>

                            {/* Title */}
                            <h3 className="text-base font-semibold text-[#1a1a1a]">
                                {f.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-[#1a1a1a]/55 leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Bottom CTA ───────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#EAEAEA] pt-10">
                    <p className="text-sm text-[#1a1a1a]/50">
                        Ready to stop guessing where your time goes?
                    </p>
                    <Link
                        to="/register"
                        className="px-6 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>
        </div>
    );
}
