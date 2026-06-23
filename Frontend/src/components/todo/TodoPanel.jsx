import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getUserTodos, createTodo, completeTodo } from "../../services/Operations/todoAPI";
import { fetchCurrentStreak } from "../../services/Operations/analyticsAPI";

// Circle checkbox icon
const CheckCircle = ({ checked, onClick }) => (
    <button
        onClick={onClick}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 ${
            checked
                ? "bg-[#2D1B4E] border-[#2D1B4E]"
                : "border-[#2D1B4E]/30 hover:border-[#2D1B4E]/60 hover:bg-[#2D1B4E]/5"
        }`}
    >
        {checked && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        )}
    </button>
);

// Vertical ellipsis
const MoreIcon = () => (
    <button className="text-[#2D1B4E]/30 hover:text-[#2D1B4E]/60 transition-colors cursor-pointer p-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
        </svg>
    </button>
);

export default function TodoPanel() {
    const [incompleteTodos, setIncompleteTodos] = useState([]);
    const [sessionCompletedTodos, setSessionCompletedTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInput, setShowInput] = useState(false);
    const [newTask, setNewTask] = useState("");
    const [creating, setCreating] = useState(false);

    const dispatch = useDispatch();

    // Fetch todos on mount — only show incomplete ones
    useEffect(() => {
        (async () => {
            try {
                const todos = await getUserTodos();
                const incomplete = todos.filter((t) => !t.status);
                setIncompleteTodos(incomplete);
            } catch {
                // Silently fail — panel just shows empty state
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Create a new todo
    const handleCreate = async () => {
        const trimmed = newTask.trim();
        if (!trimmed) return;

        setCreating(true);
        try {
            const today = new Date().toISOString().split("T")[0];
            const todo = await createTodo(trimmed, today);
            setIncompleteTodos((prev) => [todo, ...prev]);
            setNewTask("");
            setShowInput(false);
        } catch {
            // Could show error toast here
        } finally {
            setCreating(false);
        }
    };

    // Complete a todo
    const handleComplete = async (todoId) => {
        try {
            const completed = await completeTodo(todoId);

            await fetchCurrentStreak(dispatch);

            setIncompleteTodos((prev) => prev.filter((t) => t.todo_id !== todoId));
            setSessionCompletedTodos((prev) => [completed, ...prev]);
        } catch(error) {
            // Silently fail
            console.error("Error completing todo:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <p className="text-xs text-[#4A3B69]">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <p className="text-xs text-[#2D1B4E] uppercase tracking-widest mb-3 font-medium">
                Todo
            </p>

            {/* Incomplete tasks */}
            <div className="flex flex-col gap-1.5 mb-3">
                {incompleteTodos.length === 0 && !showInput && (
                    <p className="text-xs text-[#4A3B69]/60 py-2">No tasks yet. Add one below.</p>
                )}

                {incompleteTodos.map((todo) => (
                    <div
                        key={todo.todo_id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/[0.08] border border-[#2D1B4E]/5 transition-all duration-200"
                    >
                        <CheckCircle
                            checked={false}
                            onClick={() => handleComplete(todo.todo_id)}
                        />
                        <span className="flex-1 text-sm text-[#2D1B4E] truncate">
                            {todo.task}
                        </span>
                        <MoreIcon />
                    </div>
                ))}
            </div>

            {/* Add task */}
            {showInput ? (
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="What needs doing?"
                        autoFocus
                        className="flex-1 bg-black/[0.06] border border-[#2D1B4E]/10 rounded-lg px-3 py-2 text-sm text-[#2D1B4E] placeholder-[#4A3B69]/40 focus:outline-none focus:border-[#2D1B4E]/30 transition-colors cursor-text"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !newTask.trim()}
                        className="px-3 py-2 bg-[#2D1B4E] text-white text-xs rounded-lg disabled:opacity-40 hover:bg-[#3d2866] transition-colors cursor-pointer"
                    >
                        {creating ? "..." : "Add"}
                    </button>
                    <button
                        onClick={() => { setShowInput(false); setNewTask(""); }}
                        className="px-2 py-2 text-[#4A3B69] text-xs hover:text-[#2D1B4E] transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowInput(true)}
                    className="w-full py-2.5 border border-dashed border-[#2D1B4E]/20 rounded-lg text-xs text-[#4A3B69] hover:text-[#2D1B4E] hover:border-[#2D1B4E]/40 hover:bg-[#2D1B4E]/5 transition-all cursor-pointer mb-3"
                >
                    + Add Task
                </button>
            )}

            {/* Session completed tasks */}
            {sessionCompletedTodos.length > 0 && (
                <div className="border-t border-[#2D1B4E]/10 pt-3 mt-auto">
                    <p className="text-[10px] text-[#4A3B69]/50 uppercase tracking-widest mb-2">
                        Completed this session
                    </p>
                    <div className="flex flex-col gap-1">
                        {sessionCompletedTodos.map((todo) => (
                            <div
                                key={todo.todo_id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50"
                            >
                                <CheckCircle checked={true} onClick={() => {}} />
                                <span className="flex-1 text-sm text-[#2D1B4E] line-through truncate">
                                    {todo.task}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
