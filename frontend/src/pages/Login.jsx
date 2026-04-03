import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);
                const { data } = await api.post('/auth/login', formData);
                localStorage.setItem('token', data.access_token);
                navigate('/dashboard');
            } else {
                await api.post('/auth/register', { email, password });
                setIsLogin(true);
                setError('Registration successful. Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-stark">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-obsidian"></div>
            <div className="absolute top-12 left-12 w-32 h-32 border border-obsidian/10 rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-12 card-luxury"
            >
                <div className="mb-12">
                    <h1 className="heading-editorial text-4xl mb-4">
                        {isLogin ? 'Sign In' : 'Register'}
                    </h1>
                    <p className="text-obsidian/60 font-medium">
                        Access your intelligent resume analysis portal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    {error && <p className="text-accent text-sm font-medium">{error}</p>}

                    <button type="submit" className="btn-primary w-full group">
                        <span className="relative z-10">{isLogin ? 'Enter Portal' : 'Create Account'}</span>
                        <div className="absolute inset-0 h-full w-full bg-accent scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-obsidian/10 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium uppercase tracking-wide hover:text-accent transition-colors"
                    >
                        {isLogin ? 'Create an account instead' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
