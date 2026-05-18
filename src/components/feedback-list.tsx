'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Search,
  Download,
  AlertCircle,
  Clock,
  PhoneCall,
  User,
  Mail,
  Calendar,
  Frown,
  ChevronDown,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';

interface Feedback {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  rating: string;
  comments: string;
  status: string;
  createdAt: string;
}

interface FeedbackListProps {
  initialFeedbacks: Feedback[];
}

export default function FeedbackList({ initialFeedbacks }: FeedbackListProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  
  // States de filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  
  // Visualização de modal detalhado
  const [selectedFb, setSelectedFb] = useState<Feedback | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Atualizar status no servidor
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const response = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        // Atualiza estado local
        setFeedbacks((prev) =>
          prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb))
        );
        if (selectedFb && selectedFb.id === id) {
          setSelectedFb({ ...selectedFb, status: newStatus });
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Exportar feedbacks para CSV
  const handleExportCSV = () => {
    if (feedbacks.length === 0) return;

    const headers = ['Nome', 'Email', 'Telefone', 'Nota', 'Comentario', 'Status', 'Data'];
    const rows = feedbacks.map((fb) => [
      fb.customerName,
      fb.customerEmail || 'Não informado',
      fb.customerPhone || 'Não informado',
      fb.rating,
      fb.comments.replace(/"/g, '""'), // Escapa aspas para CSV
      fb.status,
      new Date(fb.createdAt).toLocaleString('pt-BR'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + // Adiciona BOM para caracteres especiais do Português no Excel
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedbacks-ouvidoria-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtra feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.customerName.toLowerCase().includes(search.toLowerCase()) ||
      fb.comments.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'TODOS' || fb.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ouvidoria Privada</h1>
          <p className="text-muted-foreground text-sm">Gerencie insatisfações retidas antes de chegarem ao Google Reviews.</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={feedbacks.length === 0}
          className="flex items-center gap-1.5 font-bold text-xs border border-border hover:bg-foreground/5 py-3 px-4 rounded-xl transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Exportar Planilha (CSV)
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* BUSCA */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou comentário..."
            className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all"
          />
        </div>

        {/* STATUS TABS */}
        <div className="flex rounded-xl bg-foreground/5 p-1 border border-border shrink-0 text-xs font-bold gap-1 self-start md:self-auto">
          {['TODOS', 'PENDENTE', 'EM_CONTATO', 'RESOLVIDO'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : status === 'EM_CONTATO' ? 'Em Contato' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* COMPLAINTS GRID / LIST */}
      {filteredFeedbacks.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg">Nenhum feedback encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">Não há críticas correspondentes aos filtros selecionados no momento.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-foreground/5 border-b border-border/80 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Cliente</th>
                  <th className="p-4">Grau de Insatisfação</th>
                  <th className="p-4">Mensagem de Reclamação</th>
                  <th className="p-4">Status de Tratativa</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-foreground/2 transition-colors">
                    
                    {/* CLIENT INFO */}
                    <td className="p-4 pl-6">
                      <div className="font-bold text-foreground text-sm">{fb.customerName}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(fb.createdAt).toLocaleDateString('pt-BR')} às {new Date(fb.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* RATING */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        fb.rating === 'PESSIMA' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        <span>{fb.rating === 'PESSIMA' ? '😡 Péssima' : '😕 Ruim'}</span>
                      </span>
                    </td>

                    {/* COMMENT SLUG */}
                    <td className="p-4 max-w-xs md:max-w-sm truncate text-muted-foreground italic">
                      "{fb.comments}"
                    </td>

                    {/* STATUS SELECT */}
                    <td className="p-4">
                      <div className="relative inline-block text-left">
                        <select
                          value={fb.status}
                          onChange={(e) => handleUpdateStatus(fb.id, e.target.value)}
                          disabled={updatingId === fb.id}
                          className={`font-bold text-xs py-1.5 pl-3 pr-8 rounded-full border outline-none appearance-none cursor-pointer transition-all ${
                            fb.status === 'RESOLVIDO'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : fb.status === 'EM_CONTATO'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}
                        >
                          <option value="PENDENTE">🔴 Pendente</option>
                          <option value="EM_CONTATO">🟡 Em Contato</option>
                          <option value="RESOLVIDO">🟢 Resolvido</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-current absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </td>

                    {/* VIEW BTN */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedFb(fb)}
                        className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all outline-none"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DO FEEDBACK */}
      {selectedFb && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full flex flex-col bg-background p-8 rounded-3xl border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-foreground/5"
              onClick={() => setSelectedFb(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-extrabold mb-6 tracking-tight flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare className="w-5 h-5 text-primary" /> Detalhes do Feedback
            </h3>

            {/* Campos de contato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-3">
                <User className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Cliente</div>
                  <div className="font-bold text-sm truncate">{selectedFb.customerName}</div>
                </div>
              </div>

              <div className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Data</div>
                  <div className="font-bold text-sm">
                    {new Date(selectedFb.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">E-mail</div>
                  <div className="font-bold text-sm truncate">
                    {selectedFb.customerEmail || 'Não informado'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Telefone</div>
                  {selectedFb.customerPhone ? (
                    <a
                      href={`tel:${selectedFb.customerPhone}`}
                      className="font-bold text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedFb.customerPhone} <PhoneCall className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="font-bold text-sm text-muted-foreground">Não informado</div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensagem e avaliação */}
            <div className="space-y-4 flex-grow">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedFb.rating === 'PESSIMA' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <span>Nota: {selectedFb.rating === 'PESSIMA' ? '😡 Péssima' : '😕 Ruim'}</span>
                </span>
              </div>

              <div className="p-5 bg-background border border-border rounded-2xl italic leading-relaxed text-sm text-foreground">
                "{selectedFb.comments}"
              </div>
            </div>

            {/* Ações de Tratativa */}
            <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Dropdown Rápido */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Alterar Status:</span>
                <div className="relative inline-block text-left">
                  <select
                    value={selectedFb.status}
                    onChange={(e) => handleUpdateStatus(selectedFb.id, e.target.value)}
                    disabled={updatingId === selectedFb.id}
                    className="font-bold text-xs py-1.5 pl-3 pr-8 rounded-full border outline-none bg-background cursor-pointer"
                  >
                    <option value="PENDENTE">🔴 Pendente</option>
                    <option value="EM_CONTATO">🟡 Em Contato</option>
                    <option value="RESOLVIDO">🟢 Resolvido</option>
                  </select>
                </div>
              </div>

              <button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
                onClick={() => setSelectedFb(null)}
              >
                Concluir Visualização
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
