import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { signIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingRedirect, setAwaitingRedirect] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!awaitingRedirect) return;
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    } else if (!loading) {
      // Auth settled but user doesn't have admin role
      setAwaitingRedirect(false);
      setAccessDenied(true);
    }
  }, [isAdmin, loading, awaitingRedirect, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error('Email ou mot de passe incorrect');
      } else {
        toast.success('Connexion réussie');
        setAwaitingRedirect(true); // navigate once isAdmin becomes true
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-100 flex items-center justify-center p-4" dir="ltr">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo card header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-leather-500 shadow-lg mb-4">
            <span className="text-white font-bold text-2xl font-display">C</span>
          </div>
          <h1 className="text-2xl font-bold text-leather-800 font-display tracking-wide">CUIR</h1>
          <p className="text-leather-500 text-sm mt-1">Administration</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-leather-100 p-8">
          <h2 className="text-xl font-semibold text-leather-800 mb-6">Connexion</h2>

          {accessDenied && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
              Accès refusé — ce compte n'a pas les droits administrateur.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-leather-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@cuir.ma"
                  className={[
                    'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-leather-800 placeholder-leather-300',
                    'focus:outline-none focus:ring-2 focus:ring-leather-400 focus:border-transparent transition-colors',
                    errors.email ? 'border-red-400 bg-red-50' : 'border-leather-200 bg-white',
                  ].join(' ')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-leather-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={[
                    'w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-leather-800 placeholder-leather-300',
                    'focus:outline-none focus:ring-2 focus:ring-leather-400 focus:border-transparent transition-colors',
                    errors.password ? 'border-red-400 bg-red-50' : 'border-leather-200 bg-white',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-leather-400 hover:text-leather-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={[
                'w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200',
                'bg-leather-500 hover:bg-leather-600 active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-leather-400 focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2',
              ].join(' ')}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-leather-400 mt-6">
          Cuir Maroc &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
