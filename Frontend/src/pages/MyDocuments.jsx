import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserDocuments, deleteDocumentById } from "../services/Operations/documentAPI";
import FlashcardViewer from "../components/FlashcardViewer";
import { colorThemes } from "../utils/colorTheme";

import { 
    FiFolder, 
    FiFileText, 
    FiImage, 
    FiFile, 
    FiTrash2, 
    FiExternalLink, 
    FiArrowLeft 
} from "react-icons/fi";

// Icons
const FolderIcon = () => <FiFolder size={20} />;

const FileIcon = ({ type }) => {
    if (type === "application/pdf") {
        return <FiFileText size={18} />;
    }
    if (type?.startsWith("image/")) {
        return <FiImage size={18} />;
    }
    return <FiFile size={18} />;
};

const TrashIcon = () => <FiTrash2 size={16} />;

const ExternalLinkIcon = () => <FiExternalLink size={14} />;

const BackIcon = () => <FiArrowLeft size={20} />;

const StatusBadge = ({ status }) => {
    const colors = {
        completed: "bg-green-500/15 text-green-400 border-green-500/20",
        processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        failed: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[status] || colors.processing}`}>
            {status}
        </span>
    );
};

export default function MyDocuments() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [flashcardSubjectId, setFlashcardSubjectId] = useState(null);

    const themeId = useSelector((state) => state.theme.theme_id);
    const theme = colorThemes.find((t) => t.color_grp === themeId) || colorThemes[0];

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        let interval;
        const hasProcessing = subjects.some(s => s.documents.some(d => d.status === 'processing'));
        if (hasProcessing) {
            interval = setInterval(() => {
                fetchDocuments(true);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [subjects]);

    const fetchDocuments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await getUserDocuments();
            setSubjects(data || []);
            if (!silent) {
                const expanded = {};
                (data || []).forEach((s) => { expanded[s.subject_id] = true; });
                setExpandedSubjects(expanded);
            }
        } catch (err) {
            console.error(err);
            setError("Couldn't load your documents. Make sure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectId) => {
        setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Delete this document? Its embeddings will also be removed.")) return;
        setDeletingId(docId);
        try {
            await deleteDocumentById(docId);
            setSubjects((prev) =>
                prev.map((s) => ({
                    ...s,
                    documents: s.documents.filter((d) => d.id !== docId),
                })).filter((s) => s.documents.length > 0)
            );
        } catch (err) {
            console.error(err);
            alert("Failed to delete document.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    const totalDocs = subjects.reduce((sum, s) => sum + s.documents.length, 0);

    return (
        <div
            className="ml-16 min-h-screen transition-colors duration-700"
            style={{ backgroundColor: theme.page_bg }}
        >
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/dashboard"
                        className="p-2 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: theme.text_muted }}
                    >
                        <BackIcon />
                    </Link>
                    <div>
                        <h1
                            className="text-2xl font-semibold"
                            style={{ color: theme.text_primary }}
                        >
                            My Documents
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: theme.text_muted }}>
                            {totalDocs} {totalDocs === 1 ? "file" : "files"} across {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: theme.accent, borderTopColor: "transparent" }}
                        />
                    </div>
                )}

                {error && (
                    <div
                        className="rounded-xl p-5 text-sm border"
                        style={{ backgroundColor: theme.surface_raised, borderColor: theme.border, color: theme.text_muted }}
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && subjects.length === 0 && (
                    <div
                        className="rounded-xl p-10 text-center border"
                        style={{ backgroundColor: theme.surface_raised, borderColor: theme.border }}
                    >
                        <p className="text-lg mb-2" style={{ color: theme.text_primary }}>
                            No documents yet
                        </p>
                        <p className="text-sm" style={{ color: theme.text_muted }}>
                            Start a Pomodoro session and upload notes through the Study Buddy chat.
                        </p>
                    </div>
                )}

                {!loading && !error && subjects.length > 0 && (
                    <div className="space-y-4">
                        {subjects.map((subject) => (
                            <div
                                key={subject.subject_id}
                                className="rounded-xl border overflow-hidden transition-colors duration-500"
                                style={{ backgroundColor: theme.surface_raised, borderColor: theme.border }}
                            >
                                {/* Subject folder header */}
                                <button
                                    onClick={() => toggleSubject(subject.subject_id)}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:opacity-90 cursor-pointer"
                                    style={{ color: theme.text_primary }}
                                >
                                    <span style={{ color: theme.accent }}><FolderIcon /></span>
                                    <span className="font-medium flex-1">{subject.subject_name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: theme.text_muted, backgroundColor: `${theme.accent}1A` }}>
                                        {subject.documents.length} {subject.documents.length === 1 ? "file" : "files"}
                                    </span>
                                    {subject.documents.some(d => d.status === 'completed') && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFlashcardSubjectId(subject.subject_id); }}
                                            className="ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border hover:opacity-80"
                                            style={{ borderColor: theme.accent, color: theme.accent, backgroundColor: `${theme.accent}1A` }}
                                            title="Generate flashcards from these notes"
                                        >
                                            ✨ Flashcards
                                        </button>
                                    )}
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className={`transition-transform duration-200 ml-2 ${expandedSubjects[subject.subject_id] ? "rotate-180" : ""}`}
                                        style={{ color: theme.text_muted }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {/* Document list */}
                                {expandedSubjects[subject.subject_id] && (
                                    <div className="border-t" style={{ borderColor: theme.border_subtle }}>
                                        {subject.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center gap-3 px-5 py-3 transition-colors hover:opacity-90 group"
                                                style={{ borderBottom: `1px solid ${theme.border_subtle}` }}
                                            >
                                                <span style={{ color: theme.text_muted }}>
                                                    <FileIcon type={doc.file_type} />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-sm font-medium truncate"
                                                        style={{ color: theme.text_primary }}
                                                        title={doc.title}
                                                    >
                                                        {doc.title}
                                                    </p>
                                                    <p className="text-xs mt-0.5" style={{ color: theme.text_muted }}>
                                                        {formatDate(doc.created_at)}
                                                    </p>
                                                </div>
                                                <StatusBadge status={doc.status} />
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5"
                                                    style={{ color: theme.text_muted }}
                                                    title="Open file"
                                                >
                                                    <ExternalLinkIcon />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={deletingId === doc.id}
                                                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-400 disabled:opacity-50 cursor-pointer"
                                                    title="Delete document"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Flashcards Modal */}
            {flashcardSubjectId && (
                <FlashcardViewer 
                    subjectId={flashcardSubjectId} 
                    onClose={() => setFlashcardSubjectId(null)}
                    theme={theme}
                />
            )}
        </div>
    );
}
