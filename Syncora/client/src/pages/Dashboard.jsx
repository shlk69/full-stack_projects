import React, { useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { api } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get('/projects');
            return res.data.data.items;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newProject) => {
            const res = await api.post('/projects', newProject);
            return res.data.data.project;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            setShowForm(false);
            setNewName('');
            setNewDesc('');
            toast.success('Project created!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to create project');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            toast.success('Project deleted');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete project');
        }
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate({ name: newName, description: newDesc });
    };

    const handleDelete = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteMutation.mutate(id);
    };

    if (isLoading) return <div className="container mt-10 text-center">Loading your workspace...</div>;

    const projects = data || [];

    return (
        <div className="container animate-fade-in" style={{ marginTop: '20px' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Projects</h1>
                    <p className="text-muted">Manage your workspaces and boards</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> New Project
                </button>
            </div>

            {showForm && (
                <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreate}
                    className="glass-panel mb-8 p-6 grid gap-4"
                    style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr) auto', alignItems: 'end' }}
                >
                    <div>
                        <label className="text-sm font-medium mb-2 block">Project Name *</label>
                        <input type="text" className="input-field" value={newName} onChange={e => setNewName(e.target.value)} required disabled={createMutation.isPending} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <input type="text" className="input-field" value={newDesc} onChange={e => setNewDesc(e.target.value)} disabled={createMutation.isPending} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                </motion.form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {projects.length === 0 ? (
                    <div className="glass-panel p-8 text-center" style={{ gridColumn: '1 / -1' }}>
                        <FolderKanban size={48} className="text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                        <p className="text-muted mb-4">Create your first project to get started</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
                            <Plus size={20} /> Create Project
                        </button>
                    </div>
                ) : (
                    projects.map((project, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={project.id || project._id}
                        >
                            <RouterLink to={`/project/${project.id || project._id}`} className="glass-panel block p-6 h-full transition-all hover:bg-[var(--bg-tertiary)]" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                            <FolderKanban size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold" style={{ wordBreak: 'break-word' }}>{project.name}</h3>
                                    </div>
                                    <button onClick={(e) => handleDelete(project.id || project._id, e)} className="text-muted hover:text-danger" style={{ background: 'none' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-muted text-sm flex-1">{project.description || 'No description provided.'}</p>
                                <div className="text-xs text-muted mt-4 flex justify-between">
                                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                    <span>{project.membersCount || 1} Member(s)</span>
                                </div>
                            </RouterLink>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
