import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, register } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { user, loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let res;
            if (isLogin) {
                res = await login({ email: formData.email, password: formData.password });
            } else {
                res = await register(formData);
            }
            if (res.success) {
                loginUser(res.user, res.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md space-y-8 p-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to ScaleAI' : 'Create your account'}
                    </h2>
                </div>

                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <Input
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        )}
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full flex justify-center">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AuthPage;
