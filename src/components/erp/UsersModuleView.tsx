import React, { useState } from 'react';
import { useFlamar, ALL_ERP_SECTIONS } from '../../context/FlamarContext';
import { UserAccount, UserRole, ErpSection } from '../../types/database';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const UsersModuleView: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useFlamar();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('administrador');
  const [allowedSections, setAllowedSections] = useState<ErpSection[]>([
    'inventory',
    'leads',
    'customers',
    'analytics',
    'blog'
  ]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const isCurrentMaster = currentUser?.role === 'master';

  function handleOpenNew() {
    setEditingUserId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('administrador');
    setAllowedSections(['inventory', 'leads', 'customers', 'analytics', 'blog']);
    setIsActive(true);
    setFormError('');
    setModalOpen(true);
  }

  function handleOpenEdit(user: UserAccount) {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '');
    setRole(user.role);
    setAllowedSections(user.allowed_sections || []);
    setIsActive(user.is_active);
    setFormError('');
    setModalOpen(true);
  }

  function handleToggleSection(sectionId: ErpSection) {
    if (role === 'master') return; // Master tem acesso a todas as abas
    setAllowedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  }

  function handleSelectAllSections() {
    setAllowedSections(ALL_ERP_SECTIONS.map((s) => s.id));
  }

  function handleClearSections() {
    setAllowedSections([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Informe o nome do colaborador.');
      return;
    }
    if (!username.trim()) {
      setFormError('Informe o login de acesso.');
      return;
    }
    if (!password.trim()) {
      setFormError('Defina uma senha para o usuário.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.id !== editingUserId
    );
    if (existing) {
      setFormError('Já existe um usuário com este login.');
      return;
    }

    // Se for master, garante todas as abas
    const finalSections: ErpSection[] =
      role === 'master'
        ? (ALL_ERP_SECTIONS.map((s) => s.id) as ErpSection[])
        : allowedSections.length > 0
        ? allowedSections
        : ['inventory'];

    if (editingUserId) {
      const userToUpdate = users.find((u) => u.id === editingUserId);
      if (userToUpdate) {
        updateUser({
          ...userToUpdate,
          name: name.trim(),
          username: cleanUsername,
          password: password.trim(),
          role,
          allowed_sections: finalSections,
          is_active: isActive
        });
        setFeedbackSuccess(`Usuário "${cleanUsername}" atualizado com sucesso!`);
      }
    } else {
      addUser({
        name: name.trim(),
        username: cleanUsername,
        password: password.trim(),
        role,
        allowed_sections: finalSections,
        is_active: isActive
      });
      setFeedbackSuccess(`Usuário "${cleanUsername}" cadastrado com sucesso!`);
    }

    setModalOpen(false);
    setTimeout(() => setFeedbackSuccess(''), 4000);
  }

  function handleDelete(user: UserAccount) {
    if (user.role === 'master' && users.filter((u) => u.role === 'master').length <= 1) {
      alert('Não é possível excluir o único usuário com perfil Master.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}" (@${user.username})?`)) {
      deleteUser(user.id);
      setFeedbackSuccess(`Usuário ${user.username} excluído.`);
      setTimeout(() => setFeedbackSuccess(''), 3000);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── CABEÇALHO DO MÓDULO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-[#82260E]/10 text-[#82260E]">
              <Users className="w-6 h-6 text-[#82260E]" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Gestão de Usuários & Níveis de Acesso
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Cadastre os logins e senhas da equipe e configure exatamente quais abas cada operador ou administrador pode visualizar.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#82260E] to-[#B83918] hover:from-[#9B2E11] hover:to-[#DF6442] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#D4AF37]/50 shadow transition-all cursor-pointer"
        >
          <UserPlus size={16} className="text-[#D4AF37]" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {feedbackSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* ── CARD RESUMO DE NÍVEIS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C110E] to-[#2B1813] text-white border border-[#D4AF37]/40 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#D4AF37]">
                Nível Master
              </span>
              <span className="text-[10px] bg-[#D4AF37] text-[#1C110E] font-black px-2 py-0.5 rounded-full">
                Acesso Total
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Tem acesso irrestrito a todas as 7 abas do ERP, incluindo parametrização de configurações gerais e este cadastro de usuários.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-800">
                Nível Administrador
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Permissões Personalizadas
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Acessa estritamente as abas marcadas pelo Master (ex: apenas Estoque e Leads Comercial, ou apenas Clientes e Blog).
            </p>
          </div>
        </div>
      </div>

      {/* ── TABELA DE USUÁRIOS ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span>Usuários Cadastrados</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 font-bold">
              {users.length}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#FAF7F4] text-gray-600 uppercase font-bold text-[11px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5">Colaborador / Nome</th>
                <th className="px-4 py-3.5">Login</th>
                <th className="px-4 py-3.5">Nível de Acesso</th>
                <th className="px-4 py-3.5">Senha</th>
                <th className="px-4 py-3.5">Abas Liberadas</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isMaster = u.role === 'master';
                const abasCount = isMaster
                  ? ALL_ERP_SECTIONS.length
                  : (u.allowed_sections || []).length;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#82260E] to-[#B83918] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {u.name.slice(0, 1)}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (Você está usando esta conta)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-gray-800 font-bold">
                      @{u.username}
                    </td>

                    <td className="px-4 py-3.5">
                      {isMaster ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FBF1D6] text-[#82260E] border border-[#D4AF37]/60">
                          👑 Master
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          🛡️ Administrador
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold">
                        {u.password || '••••••'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {isMaster ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Todas as 7 abas
                          </span>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold text-[10px]">
                              {abasCount} aba(s)
                            </span>
                            <span className="text-[10px] text-gray-400">
                              (
                              {ALL_ERP_SECTIONS.filter((s) =>
                                (u.allowed_sections || []).includes(s.id)
                              )
                                .map((s) => s.label.split(' ')[0])
                                .slice(0, 3)
                                .join(', ')}
                              {abasCount > 3 ? '...' : ''})
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                          <XCircle size={12} />
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Editar permissões e senha"
                          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          title="Excluir usuário"
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CRIAR OU EDITAR USUÁRIO ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#82260E]/10 text-[#82260E]">
                  <KeyRound size={18} />
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {editingUserId ? 'Editar Usuário & Permissões' : 'Cadastrar Novo Usuário'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nome Completo do Colaborador *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Login / Usuário de Acesso *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: carlossilva"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ex: 123456"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nível de Acesso
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                        role === 'master'
                          ? 'bg-[#FAF7F4] border-[#82260E] text-[#82260E] ring-1 ring-[#82260E]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="master"
                        checked={role === 'master'}
                        onChange={() => setRole('master')}
                        className="accent-[#82260E]"
                      />
                      <span>👑 Master</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-bold transition-all ${
                        role === 'administrador'
                          ? 'bg-blue-50/70 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="administrador"
                        checked={role === 'administrador'}
                        onChange={() => setRole('administrador')}
                        className="accent-blue-700"
                      />
                      <span>🛡️ Admin</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Ativo/Inativo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#82260E] focus:ring-[#82260E] w-4 h-4"
                />
                <label htmlFor="userActiveCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Usuário Ativo (Pode fazer login no sistema)
                </label>
              </div>

              {/* Definição de Abas Permitidas */}
              <div className="pt-3 border-t border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-[#82260E]" />
                    <span className="font-bold text-gray-900">
                      Permissões de Abas do ERP
                    </span>
                  </div>

                  {role !== 'master' && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllSections}
                        className="text-[#82260E] hover:underline font-bold"
                      >
                        Marcar Todas
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearSections}
                        className="text-gray-500 hover:underline"
                      >
                        Desmarcar
                      </button>
                    </div>
                  )}
                </div>

                {role === 'master' ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    ✨ Usuários com perfil <strong>Master</strong> possuem acesso completo e irrestrito a todas as abas por padrão (incluindo Usuários e Configurações).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {ALL_ERP_SECTIONS.map((sec) => {
                      const checked = allowedSections.includes(sec.id);
                      return (
                        <label
                          key={sec.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? 'bg-[#FFF7F4] border-[#82260E]/50 text-gray-900 shadow-xs'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSection(sec.id)}
                            className="mt-0.5 rounded text-[#82260E] focus:ring-[#82260E] w-3.5 h-3.5"
                          />
                          <div>
                            <div className="font-bold text-xs">{sec.label}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                              {sec.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#82260E] hover:bg-[#9B2E11] text-white font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>{editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
