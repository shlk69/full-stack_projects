import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Layout } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '100vh', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
            >
                <div className="flex flex-col items-center mb-8">
                    <Layout style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} size={48} />
                    <h1 className="text-2xl font-bold text-gradient mb-2">Welcome to Syncora</h1>
                    <p className="text-muted text-sm">Sign in to sync your workflow</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary mt-4" style={{ padding: '12px' }}>
                        Sign In
                    </button>
                </form>

                <p className="text-center text-sm mt-6 text-muted">
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
