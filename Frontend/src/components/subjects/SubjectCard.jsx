import React from "react";
import { FiBookOpen, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SubjectCard({ subject, theme }) {
    const navigate = useNavigate();

    const formatDate = (dateStr) => {
        if (!dateStr) return "Recent";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <motion.div
            onClick={() => navigate(`/subjects/${subject.subject_id}`)}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="border rounded-xs p-5 relative overflow-hidden transition-all duration-300 group cursor-pointer"
            style={{ 
                backgroundColor: theme.surface || "#151515", 
                borderColor: theme.border || "rgba(255,255,255,0.1)" 
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${theme.accent}66`;
                e.currentTarget.style.boxShadow = `0 0 25px ${theme.accent}15`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border || "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {/* Hover Glow Effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to bottom right, ${theme.accent}0a, transparent)` }}
            />

            <div className="relative flex items-start gap-4">
                {/* Icon Container */}
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300"
                    style={{ 
                        backgroundColor: `${theme.accent}10`, 
                        borderColor: `${theme.accent}20`,
                        color: theme.accent 
                    }}
                >
                    <FiBookOpen size={22} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 
                        className="text-lg font-semibold truncate transition-colors duration-200"
                        style={{ color: theme.text_primary }}
                    >
                        {subject.subject_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: theme.text_muted || theme.text_secondary }}>
                        <FiCalendar size={13} />
                        <span>Created {formatDate(subject.created_at)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
