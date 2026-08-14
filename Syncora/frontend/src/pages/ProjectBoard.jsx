import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, ArrowLeft, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLUMNS = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done'
};

const ProjectBoard = () => {
    const { id } = useParams();
    const { api } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
    const [loading, setLoading] = useState(true);

    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskCol, setNewTaskCol] = useState('TODO');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`)
            ]);
            setProject(projRes.data);

            const organizedTasks = { TODO: [], IN_PROGRESS: [], DONE: [] };
            tasksRes.data.forEach(task => {
                if (organizedTasks[task.status]) organizedTasks[task.status].push(task);
            });
            // Sort each column by order
            Object.keys(organizedTasks).forEach(key => {
                organizedTasks[key].sort((a, b) => a.order - b.order);
            });
            setTasks(organizedTasks);
        } catch (err) {
            toast.error('Failed to load board');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = [...tasks[source.droppableId]];
        const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]];
        const [movedTask] = sourceCol.splice(source.index, 1);
        movedTask.status = destination.droppableId;
        destCol.splice(destination.index, 0, movedTask);

        const newTasks = { ...tasks, [source.droppableId]: sourceCol };
        if (source.droppableId !== destination.droppableId) {
            newTasks[destination.droppableId] = destCol;
        }
        setTasks(newTasks);

        // Reorder API call (simplified: updating just the moved task status, in a real prod app we'd update 'order' for all affected tasks)
        try {
            await api.put(`/tasks/${movedTask._id}`, { status: movedTask.status, order: destination.index });
        } catch (err) {
            toast.error('Failed to update task');
            fetchData(); // Revert on failure
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const res = await api.post('/tasks', {
                title: newTaskTitle,
                status: newTaskCol,
                projectId: id
            });
            const newTasks = { ...tasks };
            newTasks[newTaskCol].push(res.data);
            setTasks(newTasks);
            setNewTaskTitle('');
            setShowNewTask(false);
        } catch (err) {
            toast.error('Failed to create task');
        }
    };

    const handleDeleteTask = async (taskId, col) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            const newTasks = { ...tasks };
            newTasks[col] = newTasks[col].filter(t => t._id !== taskId);
            setTasks(newTasks);
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    if (loading) return <div className="container mt-10">Loading board...</div>;
    if (!project) return <div className="container mt-10">Project not found</div>;

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <div className="flex items-center gap-4 mb-8">
                <Link to="/" className="btn-secondary" style={{ padding: '8px' }}>
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-muted text-sm">{project.description}</p>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', gap: '20px', flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
                    {Object.entries(COLUMNS).map(([status, label]) => (
                        <div key={status} className="glass-panel" style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <h3 className="font-bold">{label}  <span className="text-muted font-normal ml-2">({tasks[status].length})</span></h3>
                                <button onClick={() => { setNewTaskCol(status); setShowNewTask(true); }} className="text-muted hover:text-[var(--accent-primary)]">
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="p-2" style={{ flex: 1, overflowY: 'auto' }}>
                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                minHeight: '150px',
                                                padding: '8px',
                                                background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                        >
                                            {tasks[status].map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                userSelect: 'none',
                                                                padding: '16px',
                                                                margin: '0 0 12px 0',
                                                                background: 'var(--bg-secondary)',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '1px solid var(--border-color)',
                                                                boxShadow: snapshot.isDragging ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-medium text-sm">{task.title}</p>
                                                                <button onClick={() => handleDeleteTask(task._id, status)} className="text-muted hover:text-danger opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: snapshot.isDragging ? 0 : 0.5 }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                {showNewTask && newTaskCol === status && (
                                    <form onSubmit={handleCreateTask} className="p-2">
                                        <input
                                            autoFocus
                                            className="input-field mb-2"
                                            placeholder="What needs to be done?"
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Add Task</button>
                                            <button type="button" onClick={() => setShowNewTask(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default ProjectBoard;
