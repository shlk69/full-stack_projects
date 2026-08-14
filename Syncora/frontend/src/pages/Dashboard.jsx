import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { api } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Project Form
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/projects', { name: newName, description: newDesc });
            setProjects([res.data, ...projects]);
            setShowForm(false);
            setNewName('');
            setNewDesc('');
            toast.success('Project created!');
        } catch (err) {
            toast.error('G failed to create project');
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
            toast.success('Project deleted');
        } catch (err) {
            toast.error('Failed to delete project');
        }
    };

    if (loading) return <div className="container mt-10 text-center">Loading your workspace...</div>;

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
                        <input type="text" className="input-field" value={newName} onChange={e => setNewName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <input type="text" className="input-field" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary">Create</button>
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
                            key={project._id}
                        >
                            <Link to={`/project/${project._id}`} className="glass-panel block p-6 h-full transition-all hover:bg-[var(--bg-tertiary)]" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                            <FolderKanban size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold" style={{ wordBreak: 'break-word' }}>{project.name}</h3>
                                    </div>
                                    <button onClick={(e) => handleDelete(project._id, e)} className="text-muted hover:text-danger" style={{ background: 'none' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-muted text-sm flex-1">{project.description || 'No description provided.'}</p>
                                <div className="text-xs text-muted mt-4">
                                    Created {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
