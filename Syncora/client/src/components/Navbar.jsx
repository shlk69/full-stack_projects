import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel"
            style={{
                position: 'sticky', top: 0, zIndex: 50,
                padding: '16px 32px', margin: '20px auto',
                maxWidth: '1200px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
            }}
        >
            <Link to="/" className="flex items-center gap-2">
                <Layout className="text-secondary" style={{ color: 'var(--accent-primary)' }} size={28} />
                <span className="text-xl font-bold text-gradient">Syncora</span>
            </Link>

            <div className="flex items-center gap-4">
                <span className="text-muted text-sm">Welcome back, {user?.name}</span>
                <button onClick={logout} className="btn-secondary flex items-center gap-2 text-sm">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
