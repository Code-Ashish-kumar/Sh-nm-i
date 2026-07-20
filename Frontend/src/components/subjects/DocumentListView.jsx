import React from "react";
import { FiFileText, FiImage, FiFile, FiTrash2, FiEye } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const FileIcon = ({ type }) => {
    if (type === "application/pdf") {
        return <FiFileText size={18} className="shrink-0" />;
    }
    if (type?.startsWith("image/")) {
        return <FiImage size={18} className="shrink-0" />;
    }
    return <FiFile size={18} className="shrink-0" />;
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

export default function DocumentListView({ documents, theme, onPreview, onFlashcard, onDelete, deletingId }) {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <div 
            className="border rounded-xl overflow-hidden"
            style={{ backgroundColor: theme.surface || "#151515", borderColor: theme.border || "rgba(255,255,255,0.1)" }}
        >
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr 
                        className="border-b text-xs uppercase tracking-wider font-semibold"
                        style={{ borderColor: theme.border_subtle || "rgba(255,255,255,0.05)", color: theme.text_muted }}
                    >
                        <th className="px-5 py-3.5 w-12 text-center">Type</th>
                        <th className="px-5 py-3.5">Title</th>
                        <th className="px-5 py-3.5 hidden sm:table-cell">Uploaded</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right w-36">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => {
                        const isCompleted = doc.status === "completed";
                        const isProcessing = doc.status === "processing";

                        return (
                            <tr 
                                key={doc.id}
                                className="border-b transition-colors hover:bg-black/5"
                                style={{ borderColor: theme.border_subtle || "rgba(255,255,255,0.05)" }}
                            >
                                <td className="px-5 py-4 text-center">
                                    <div 
                                        className="flex items-center justify-center"
                                        style={{ color: theme.accent }}
                                    >
                                        <FileIcon type={doc.file_type} />
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <p 
                                        className="text-sm font-semibold truncate max-w-xs sm:max-w-md"
                                        style={{ color: theme.text_primary }}
                                        title={doc.title}
                                    >
                                        {doc.title}
                                    </p>
                                </td>
                                <td className="px-5 py-4 text-sm hidden sm:table-cell" style={{ color: theme.text_muted }}>
                                    {formatDate(doc.created_at)}
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={doc.status} />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {isCompleted && (
                                            <>
                                                <button
                                                    onClick={() => onFlashcard(doc)}
                                                    className="p-1.5 rounded-lg border hover:opacity-80 transition-colors flex items-center justify-center cursor-pointer gap-1 pr-2"
                                                    style={{ 
                                                        borderColor: `${theme.accent}40`, 
                                                        color: theme.accent, 
                                                        backgroundColor: `${theme.accent}12` 
                                                    }}
                                                    title="Generate flashcards from this document"
                                                >
                                                    <HiSparkles size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onPreview(doc)}
                                                    className="p-1.5 rounded-lg border hover:opacity-80 transition-colors flex items-center justify-center cursor-pointer"
                                                    style={{ 
                                                        borderColor: theme.border, 
                                                        color: theme.text_primary, 
                                                        backgroundColor: theme.surface_raised 
                                                    }}
                                                    title="Preview document"
                                                >
                                                    <FiEye size={14} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            disabled={deletingId === doc.id || isProcessing}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
                                            title="Delete document"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
