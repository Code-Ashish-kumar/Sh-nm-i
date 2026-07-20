import React, { useState, useEffect } from "react";
import { FiX, FiDownload, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentPreviewModal({ document: doc, onClose, theme }) {
    if (!doc) return null;

    const isPdf = doc.file_type === "application/pdf" || doc.title?.toLowerCase().endsWith(".pdf");
    const isImage = doc.file_type?.startsWith("image/") || doc.title?.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/);
    const isTxt = doc.file_type === "text/plain" || doc.title?.toLowerCase().endsWith(".txt");

    const [txtContent, setTxtContent] = useState("");
    const [loadingText, setLoadingText] = useState(false);

    useEffect(() => {
        if (isTxt) {
            setLoadingText(true);
            fetch(doc.file_url)
                .then((res) => res.text())
                .then((text) => {
                    setTxtContent(text);
                    setLoadingText(false);
                })
                .catch((err) => {
                    console.error(err);
                    setTxtContent("Failed to load text content.");
                    setLoadingText(false);
                });
        }
    }, [doc, isTxt]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-5xl rounded-2xl p-6 shadow-2xl flex flex-col h-[85vh]"
                    style={{ backgroundColor: theme.surface_raised, border: `1px solid ${theme.border}` }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.border_subtle }}>
                        <div className="min-w-0 pr-4">
                            <h2 className="text-lg font-bold truncate" style={{ color: theme.text_primary }} title={doc.title}>
                                {doc.title}
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: theme.text_muted }}>
                                {doc.file_type}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg border hover:opacity-80 transition-colors flex items-center justify-center cursor-pointer"
                                style={{ 
                                    borderColor: theme.border, 
                                    color: theme.text_primary,
                                    backgroundColor: theme.surface 
                                }}
                                title="Open in new tab"
                            >
                                <FiExternalLink size={18} />
                            </a>
                            <a
                                href={doc.file_url}
                                download
                                className="p-2 rounded-lg border hover:opacity-80 transition-colors flex items-center justify-center cursor-pointer"
                                style={{ 
                                    borderColor: theme.border, 
                                    color: theme.text_primary,
                                    backgroundColor: theme.surface 
                                }}
                                title="Download file"
                            >
                                <FiDownload size={18} />
                            </a>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
                                style={{ color: theme.text_muted }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 w-full h-full overflow-hidden rounded-lg bg-black/10 p-2">
                        {isImage ? (
                            <div className="w-full h-full flex items-center justify-center p-2">
                                <img 
                                    src={doc.file_url} 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-md" 
                                    alt={doc.title} 
                                />
                            </div>
                        ) : isPdf ? (
                            <div className="w-full h-full rounded-lg overflow-hidden">
                                <iframe 
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.file_url)}&embedded=true`}
                                    className="w-full h-full border-0" 
                                    title={doc.title}
                                    loading="lazy"
                                />
                            </div>
                        ) : isTxt ? (
                            loadingText ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div 
                                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
                                        style={{ borderColor: theme.accent, borderTopColor: "transparent" }} 
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="w-full h-full overflow-auto p-6 rounded-lg text-left font-mono text-sm leading-relaxed border" 
                                    style={{ backgroundColor: theme.surface, color: theme.text_primary, borderColor: theme.border }}
                                >
                                    <pre className="whitespace-pre-wrap">{txtContent}</pre>
                                </div>
                            )
                        ) : (
                            <div className="text-center p-10 max-w-md mx-auto h-full flex flex-col items-center justify-center">
                                <p className="text-sm mb-4" style={{ color: theme.text_secondary }}>
                                    No live preview available for this file type.
                                </p>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                                    style={{ backgroundColor: theme.accent, color: theme.bg || "#fff" }}
                                >
                                    <FiExternalLink size={16} />
                                    <span>Open Document</span>
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
