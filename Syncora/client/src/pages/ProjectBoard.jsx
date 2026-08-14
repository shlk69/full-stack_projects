import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';
import {
    DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    DONE: 'Done'
};

const SortableTask = ({ task, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id || task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel p-4 mb-3 flex flex-col gap-2 relative group"
        >
            <div className="flex justify-between items-start cursor-pointer">
                <div {...attributes} {...listeners} className="mt-1 text-muted hover:text-white cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </div>
                <p className="font-medium flex-1 ml-2 text-sm">{task.title}</p>
                <button
                    onClick={() => onDelete(task._id || task.id)}
                    className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            {task.priority && (
                <div className="flex justify-between items-center ml-6 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded flex w-max items-center justify-center font-semibold 
                        ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {task.priority}
                    </span>
                </div>
            )}
        </div>
    );
};

const ProjectBoard = () => {
    const { id: projectId } = useParams();
    const { api } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const socket = useSocket(projectId);

    const [activeTask, setActiveTask] = useState(null);
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskCol, setNewTaskCol] = useState('TODO');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => (await api.get(`/projects/${projectId}`)).data.data.project
    });

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['issues', projectId],
        queryFn: async () => (await api.get(`/projects/${projectId}/issues?limit=100`)).data.data.items
    });

    // Local optimistic state for drag and drop
    const [boardData, setBoardData] = useState({ TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] });

    useEffect(() => {
        if (tasksData) {
            const org = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
            tasksData.forEach(t => {
                if (org[t.status]) {
                    org[t.status].push(t);
                } else {
                    org.TODO.push(t); // fallback
                }
            });
            Object.keys(org).forEach(k => org[k].sort((a, b) => a.order - b.order));
            setBoardData(org);
        }
    }, [tasksData]);

    useEffect(() => {
        if (!socket) return;
        socket.on('issue:created', () => {
            queryClient.invalidateQueries(['issues', projectId]);
        });
        socket.on('issue:updated', () => {
            queryClient.invalidateQueries(['issues', projectId]);
        });
        socket.on('issue:deleted', () => {
            queryClient.invalidateQueries(['issues', projectId]);
        });
        return () => {
            socket.off('issue:created');
            socket.off('issue:updated');
            socket.off('issue:deleted');
        };
    }, [socket, projectId, queryClient]);

    const createTask = useMutation({
        mutationFn: async (newTask) => {
            return (await api.post(`/projects/${projectId}/issues`, newTask)).data.data.issue;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issues', projectId]);
            setShowNewTask(false);
            setNewTaskTitle('');
        }
    });

    const updateTaskOrder = useMutation({
        mutationFn: async ({ taskId, updates }) => {
            await api.patch(`/projects/${projectId}/issues/${taskId}/order`, updates);
        },
        onError: () => {
            toast.error("Failed to move issue");
            queryClient.invalidateQueries(['issues', projectId]);
        }
    });

    const deleteTask = useMutation({
        mutationFn: async (taskId) => {
            await api.delete(`/projects/${projectId}/issues/${taskId}`);
        },
        onSuccess: () => { queryClient.invalidateQueries(['issues', projectId]); }
    });

    const handleDragStart = (event) => {
        const { active } = event;
        const allTasks = Object.values(boardData).flat();
        setActiveTask(allTasks.find(t => (t._id || t.id) === active.id));
    };

    const handleDragEnd = (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find source & dest containers
        let sourceCol, destCol;
        for (const key of Object.keys(boardData)) {
            if (active.data.current?.sortable.containerId === key || boardData[key].find(t => (t.id || t._id) === activeId)) sourceCol = key;
            if (over.data.current?.sortable.containerId === key || boardData[key].find(t => (t.id || t._id) === overId) || overId === key) destCol = key;
        }

        if (!sourceCol || !destCol) return;

        if (sourceCol === destCol) {
            const items = boardData[sourceCol];
            const oldIndex = items.findIndex(t => (t.id || t._id) === activeId);
            const newIndex = items.findIndex(t => (t.id || t._id) === overId);
            if (oldIndex !== newIndex) {
                const newItems = arrayMove(items, oldIndex, newIndex);
                setBoardData({ ...boardData, [sourceCol]: newItems });
                updateTaskOrder.mutate({ taskId: activeId, updates: { status: destCol, order: newIndex } });
            }
        } else {
            const sItems = [...boardData[sourceCol]];
            const dItems = [...boardData[destCol]];
            const activeItem = sItems.find(t => (t.id || t._id) === activeId);
            sItems.splice(sItems.indexOf(activeItem), 1);

            const overIndex = dItems.findIndex(t => (t.id || t._id) === overId);
            const insertIndex = overIndex >= 0 ? overIndex : dItems.length;
            dItems.splice(insertIndex, 0, { ...activeItem, status: destCol });

            setBoardData({ ...boardData, [sourceCol]: sItems, [destCol]: dItems });
            updateTaskOrder.mutate({ taskId: activeId, updates: { status: destCol, order: insertIndex } });
        }
    };

    if (isLoading || !project) return <div className="container mt-10">Loading board...</div>;

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex items-center gap-4 mb-8 mt-5">
                <Link to="/" className="btn-secondary" style={{ padding: '8px' }}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-muted text-sm">{project.description}</p>
                </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', gap: '20px', flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
                    {Object.entries(COLUMNS).map(([status, label]) => (
                        <div key={status} className="glass-panel" style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <h3 className="font-bold">{label} <span className="text-muted font-normal ml-2">({boardData[status].length})</span></h3>
                                <button onClick={() => { setNewTaskCol(status); setShowNewTask(true); }} className="text-muted hover:text-[var(--accent-primary)]">
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="p-2 flex-1 overflow-y-auto">
                                <SortableContext id={status} items={boardData[status].map(t => t.id || t._id)} strategy={verticalListSortingStrategy}>
                                    <div style={{ minHeight: '150px' }}>
                                        {boardData[status].map((task) => (
                                            <SortableTask key={task.id || task._id} task={task} onDelete={(id) => deleteTask.mutate(id)} />
                                        ))}
                                        {boardData[status].length === 0 && (
                                            <div className="text-center text-muted text-sm mt-4 italic">No issues here</div>
                                        )}
                                    </div>
                                </SortableContext>

                                {showNewTask && newTaskCol === status && (
                                    <form onSubmit={(e) => { e.preventDefault(); createTask.mutate({ title: newTaskTitle, status, priority: 'MEDIUM' }); }} className="mt-3">
                                        <input
                                            autoFocus
                                            className="input-field mb-2"
                                            placeholder="What needs to be done?"
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Add Issue</button>
                                            <button type="button" onClick={() => setShowNewTask(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div className="glass-panel p-4 flex flex-col gap-2" style={{ width: '300px', transform: 'scale(1.05)', boxShadow: 'var(--shadow-glow)' }}>
                            <p className="font-medium text-sm">{activeTask.title}</p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default ProjectBoard;
