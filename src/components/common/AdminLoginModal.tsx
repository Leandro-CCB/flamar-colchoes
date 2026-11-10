import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { FlamarLogo } from './FlamarLogo';
import {
  Lock,
  User,
  KeyRound,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  X
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginUser, users } = useFlamar();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = loginUser(username, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Falha ao autenticar.');
    }
  }

  function handleQuickFill(uName: string, pass: string) {
    setUsername(uName);
    setPassword(pass);
    setErrorMessage('');
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#1C110E] to-[#2B1813] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/50 relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-3 pb-2">
          <div className="flex justify-center">
            <FlamarLogo variant="light" size="md" showTagline={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#82260E]/60 border border-[#D4AF37]/50 text-[#FBF1D6] text-xs font-bold uppercase tracking-wider">
            <Lock size={12} className="text-[#D4AF37]" />
            <span>Área Restrita do Administrador</span>
          </div>
          <p className="text-xs text-gray-300">
            Informe suas credenciais para gerenciar estoque, leads, clientes e permissões da Flamar Colchões.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: master ou admin"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#82260E] to-[#B83918] hover:from-[#9B2E11] hover:to-[#DF6442] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg border border-[#D4AF37]/60 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogIn size={15} className="text-[#D4AF37]" />
            <span>{loading ? 'Validando...' : 'Acessar Painel'}</span>
          </button>
        </form>

        {/* Sugestões de Teste com Logins Padrões Cadastrados */}
        {users.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2 text-center">
              Acesso rápido com os usuários configurados:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 2).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFill(u.username, u.password || '123')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-[#FBF1D6]">
                    {u.role === 'master' ? '👑 Master' : '🛡️ Admin'}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    @{u.username} • Senha: {u.password || '123'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
