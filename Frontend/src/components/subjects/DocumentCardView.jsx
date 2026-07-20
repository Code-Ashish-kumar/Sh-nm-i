import React from "react";
import { FiFileText, FiImage, FiFile, FiTrash2, FiEye } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { motion } from "framer-motion";

const FileIcon = ({ type }) => {
    if (type === "application/pdf") {
        return <FiFileText size={22} />;
    }
    if (type?.startsWith("image/")) {
        return <FiImage size={22} />;
    }
    return <FiFile size={22} />;
};

const StatusBadge = ({ status }) => {
    const colors = {
        completed: "bg-green-500/15 text-green-400 border-green-500/20",
        processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        failed: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || colors.processing}`}>
            {status}
        </span>
    );
};

export default function DocumentCardView({ documents, theme, onPreview, onFlashcard, onDelete, deletingId }) {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {documents.map((doc) => {
                const isCompleted = doc.status === "completed";
                const isProcessing = doc.status === "processing";

                return (
                    <motion.div
                        key={doc.id}
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group"
                        style={{ 
                            backgroundColor: theme.surface || "#151515", 
                            borderColor: theme.border || "rgba(255,255,255,0.1)" 
                        }}
                    >
                        {/* Content */}
                        <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div 
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                                    style={{ 
                                        backgroundColor: `${theme.accent}0a`, 
                                        borderColor: `${theme.accent}15`,
                                        color: theme.accent 
                                    }}
                                >
                                    <FileIcon type={doc.file_type} />
                                </div>
                                <StatusBadge status={doc.status} />
                            </div>

                            <h3 
                                className="text-sm font-semibold truncate mb-1"
                                style={{ color: theme.text_primary }}
                                title={doc.title}
                            >
                                {doc.title}
                            </h3>
                            <p className="text-xs" style={{ color: theme.text_muted }}>
                                {formatDate(doc.created_at)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div 
                            className="flex items-center justify-end gap-2 border-t pt-3 mt-3"
                            style={{ borderColor: theme.border_subtle || "rgba(255,255,255,0.05)" }}
                        >
                            {isCompleted && (
                                <>
                                    <button
                                        onClick={() => onFlashcard(doc)}
                                        className="p-1.5 rounded-lg hover:opacity-80 transition-colors flex items-center justify-center border cursor-pointer text-xs font-medium gap-1 px-2.5"
                                        style={{ 
                                            borderColor: `${theme.accent}40`, 
                                            color: theme.accent, 
                                            backgroundColor: `${theme.accent}12` 
                                        }}
                                        title="Generate flashcards from this document"
                                    >
                                        <HiSparkles size={13} />
                                        <span>Flashcards</span>
                                    </button>
                                    <button
                                        onClick={() => onPreview(doc)}
                                        className="p-1.5 rounded-lg hover:opacity-80 transition-colors flex items-center justify-center border cursor-pointer text-xs font-medium gap-1.5 px-2.5"
                                        style={{ 
                                            borderColor: theme.border, 
                                            color: theme.text_primary, 
                                            backgroundColor: theme.surface_raised 
                                        }}
                                    >
                                        <FiEye size={13} />
                                        <span>Preview</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => onDelete(doc.id)}
                                disabled={deletingId === doc.id || isProcessing}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
                                title="Delete document"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
