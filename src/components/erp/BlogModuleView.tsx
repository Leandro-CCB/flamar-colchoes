import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { BlogPost } from '../../types/database';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Calendar,
  User,
  Clock,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export const BlogModuleView: React.FC = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useFlamar();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Guia de Compra');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAuthor, setFormAuthor] = useState('Especialista Flamar');
  const [formReadTime, setFormReadTime] = useState(5);
  const [formPublished, setFormPublished] = useState(true);

  const abrirNovoPost = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormCategory('Guia de Compra');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80');
    setFormAuthor('Especialista Flamar');
    setFormReadTime(5);
    setFormPublished(true);
    setModalOpen(true);
  };

  const abrirEditarPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormSummary(post.summary);
    setFormContent(post.content);
    setFormImageUrl(post.imageUrl);
    setFormAuthor(post.author);
    setFormReadTime(post.readTimeMinutes);
    setFormPublished(post.published);
    setModalOpen(true);
  };

  const salvarPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingPost) {
      updateBlogPost({
        ...editingPost,
        title: formTitle,
        slug,
        category: formCategory,
        summary: formSummary,
        content: formContent,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        author: formAuthor,
        readTimeMinutes: formReadTime,
        published: formPublished,
      });
    } else {
      addBlogPost({
        title: formTitle,
        slug,
        category: formCategory,
        summary: formSummary,
        content: formContent,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        author: formAuthor,
        readTimeMinutes: formReadTime,
        published: formPublished,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-[#82260E] text-xs font-bold mb-2">
            <BookOpen size={13} />
            <span>GESTÃO DE CONTEÚDO E SEO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
            Blog do Sono & Guia de Colchões
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Crie e edite artigos educativos para atrair clientes do Google, tirar dúvidas sobre densidade (D33/D45) e impulsionar as vendas da Flamar.
          </p>
        </div>

        <button
          onClick={abrirNovoPost}
          className="px-4 py-2.5 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
        >
          <Plus size={16} />
          <span>Escrever Novo Artigo</span>
        </button>
      </div>

      {/* Lista de Artigos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase">
                    {post.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    post.published ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.publishedAt}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readTimeMinutes} min de leitura</span>
                </div>
                <h3 className="font-serif font-bold text-gray-900 text-base line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {post.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between mt-3">
              <span className="text-[11px] font-semibold text-gray-500">
                Por: {post.author}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => abrirEditarPost(post)}
                  className="p-2 rounded-xl text-gray-500 hover:text-[#82260E] hover:bg-brand-50"
                  title="Editar Artigo"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir o artigo "${post.title}"?`)) {
                      deleteBlogPost(post.id);
                    }
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                  title="Excluir Artigo"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar / Editar Artigo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAF7F4] border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#82260E]" />
                <h3 className="font-serif font-bold text-gray-900 text-lg">
                  {editingPost ? 'Editar Artigo do Blog' : 'Novo Artigo do Blog'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvarPost} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Título do Artigo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como Escolher o Colchão Certo para Coluna"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#82260E] text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Guia de Compra">Guia de Compra</option>
                    <option value="Tecnologia do Sono">Tecnologia do Sono</option>
                    <option value="Saúde & Bem-Estar">Saúde & Bem-Estar</option>
                    <option value="Dicas de Limpeza">Dicas de Limpeza</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tempo Leitura (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL da Imagem de Capa</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Resumo / Chamada (Aparece no card) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Breve resumo atraente para o leitor..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Conteúdo Completo do Artigo *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Escreva aqui todo o conteúdo educativo sobre colchões..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="rounded text-[#82260E]"
                />
                <label htmlFor="pubCheck" className="font-bold text-gray-700 cursor-pointer">
                  Publicar imediatamente no site
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold"
                >
                  {editingPost ? 'Salvar Alterações' : 'Publicar Artigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
