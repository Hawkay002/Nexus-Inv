import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl shadow-premium-900/5 border border-premium-100 animate-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-premium-900">Welcome Back</h1>
          <p className="text-premium-700 mt-2">Sign in to Nexus Invoicing</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-premium-900 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-400" size={20} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12" 
                placeholder="admin@nexus.com" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-medium text-premium-900">Password</label>
               <Link to="/forgot-password" className="text-sm font-semibold text-accent-600 hover:text-accent-500 transition-colors">
                 Forgot password?
               </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 pr-12" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-premium-400 hover:text-premium-700 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
