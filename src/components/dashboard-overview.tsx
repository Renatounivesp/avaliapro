'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MousePointerClick,
  Percent,
  MessageSquare,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Laptop,
  Tablet,
  AlertCircle
} from 'lucide-react';

interface ChartDataItem {
  day: string;
  visits: number;
  clicks: number;
}

interface FeedbackItem {
  id: string;
  customerName: string;
  comments: string;
  rating: string;
  status: string;
  createdAt: string;
}

interface DashboardOverviewProps {
  user: any;
  stats: {
    visits: number;
    clicks: number;
    conversion: number;
    feedbacks: number;
  };
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  chartData: ChartDataItem[];
  recentFeedbacks: FeedbackItem[];
}

export default function DashboardOverview({
  user,
  stats,
  deviceStats,
  chartData,
  recentFeedbacks
}: DashboardOverviewProps) {
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${user.company?.slug}`
    : `https://avaliapro.com.br/p/${user.company?.slug || 'slug'}`;

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/company/simulate-traffic', { method: 'POST' });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSimulating(false), 800);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- CONTAS E FÓRMULAS PARA O GRÁFICO SVG NATIVO ---
  const chartHeight = 220;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 20;

  // Encontra o máximo das estatísticas para escala do gráfico
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.visits, d.clicks)),
    10 // Evita divisão por zero ou escala muito pequena se vazio
  );

  // Gera pontos X e Y do SVG
  const pointsVisits = chartData.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
    const y = chartHeight - paddingY - (d.visits * (chartHeight - 2 * paddingY)) / maxVal;
    return { x, y };
  });

  const pointsClicks = chartData.map((d, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
    const y = chartHeight - paddingY - (d.clicks * (chartHeight - 2 * paddingY)) / maxVal;
    return { x, y };
  });

  // Converte pontos em coordenadas de path
  const pathVisits = pointsVisits.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const pathClicks = pointsClicks.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Paths preenchidos (área abaixo da linha)
  const areaVisits = pointsVisits.length > 0
    ? `${pathVisits} L ${pointsVisits[pointsVisits.length - 1].x} ${chartHeight - paddingY} L ${pointsVisits[0].x} ${chartHeight - paddingY} Z`
    : '';

  const areaClicks = pointsClicks.length > 0
    ? `${pathClicks} L ${pointsClicks[pointsClicks.length - 1].x} ${chartHeight - paddingY} L ${pointsClicks[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Dispositivos totais para porcentagem
  const totalDevices = deviceStats.mobile + deviceStats.desktop + deviceStats.tablet || 1;
  const getDevicePct = (val: number) => Math.round((val / totalDevices) * 100);

  return (
    <div className="space-y-8">
      {/* SEÇÃO BOAS VINDAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bem-vindo, {user.name}!</h1>
          <p className="text-muted-foreground text-sm">Este é o painel de crescimento do seu estabelecimento.</p>
        </div>

        {/* CONTROLE MOCK DO TRAFEGO */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-2 font-bold text-xs bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/10 text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Gerando Dados...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Simular Tráfego de Teste
            </>
          )}
        </button>
      </div>

      {/* BANNER AVISO SE VAZIO */}
      {stats.visits === 0 && (
        <div className="p-5 bg-primary/10 border border-primary/20 text-foreground rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Seu Painel está Pronto!</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Você ainda não tem acessos reais registrados. Clique em "Simular Tráfego de Teste" acima para popular o gráfico ou comece a compartilhar seu link público.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 KPIS PRINCIPAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total de Acessos</div>
          <div className="text-3xl font-extrabold tracking-tight">{stats.visits}</div>
          <div className="absolute right-4 bottom-4 text-primary/10"><Users className="w-10 h-10" /></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Cliques no Google</div>
          <div className="text-3xl font-extrabold tracking-tight">{stats.clicks}</div>
          <div className="absolute right-4 bottom-4 text-secondary/10"><MousePointerClick className="w-10 h-10" /></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Taxa de Conversão</div>
          <div className="text-3xl font-extrabold tracking-tight">{stats.conversion.toFixed(1)}%</div>
          <div className="absolute right-4 bottom-4 text-emerald-500/10"><Percent className="w-10 h-10" /></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden font-sans">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Críticas Ouvidoria</div>
          <div className="text-3xl font-extrabold tracking-tight">{stats.feedbacks}</div>
          <div className="absolute right-4 bottom-4 text-rose-500/10"><MessageSquare className="w-10 h-10" /></div>
        </div>
      </div>

      {/* SEÇÃO DO GRÁFICO E DISPOSITIVOS */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO SVG NATIVO */}
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-lg">Histórico de Performance</h3>
              <p className="text-xs text-muted-foreground">Volume de acessos comparado a cliques no Google nos últimos 7 dias</p>
            </div>
            {/* Legenda */}
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-primary rounded-full"></span> Visitas</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-secondary rounded-full"></span> Cliques</span>
            </div>
          </div>

          {/* ÁREA DO GRÁFICO */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              <defs>
                <linearGradient id="gradient-visits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient-clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade Traseiras */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(156,163,175,0.06)" strokeWidth={1} />
              <line x1={paddingX} y1={(chartHeight - 2 * paddingY) / 2 + paddingY} x2={chartWidth - paddingX} y2={(chartHeight - 2 * paddingY) / 2 + paddingY} stroke="rgba(156,163,175,0.06)" strokeWidth={1} />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(156,163,175,0.15)" strokeWidth={1} />

              {/* Desenho das Áreas Translucidas */}
              {stats.visits > 0 && <path d={areaVisits} fill="url(#gradient-visits)" />}
              {stats.clicks > 0 && <path d={areaClicks} fill="url(#gradient-clicks)" />}

              {/* Linhas Principais de Desenho */}
              {stats.visits > 0 && (
                <path
                  d={pathVisits}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {stats.clicks > 0 && (
                <path
                  d={pathClicks}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Círculos indicativos de Pontos */}
              {stats.visits > 0 && pointsVisits.map((p, idx) => (
                <circle
                  key={`v-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              ))}

              {stats.clicks > 0 && pointsClicks.map((p, idx) => (
                <circle
                  key={`c-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={1.5}
                />
              ))}

              {/* Rótulos dos Dias da Semana */}
              {chartData.map((d, i) => {
                const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
                return (
                  <text
                    key={i}
                    x={x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[10px] text-muted-foreground font-bold"
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* RELATÓRIO DE DISPOSITIVOS */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg mb-1">Dispositivos Utilizados</h3>
            <p className="text-xs text-muted-foreground mb-6">Canal onde os clientes abriram a página de avaliação</p>
          </div>

          <div className="space-y-5">
            {/* MOBILE */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-primary" /> Smartphone</span>
                <span>{getDevicePct(deviceStats.mobile)}% ({deviceStats.mobile})</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${getDevicePct(deviceStats.mobile)}%` }}></div>
              </div>
            </div>

            {/* DESKTOP */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5"><Laptop className="w-4 h-4 text-secondary" /> Desktop</span>
                <span>{getDevicePct(deviceStats.desktop)}% ({deviceStats.desktop})</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${getDevicePct(deviceStats.desktop)}%` }}></div>
              </div>
            </div>

            {/* TABLET */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5"><Tablet className="w-4 h-4 text-muted-foreground" /> Tablet</span>
                <span>{getDevicePct(deviceStats.tablet)}% ({deviceStats.tablet})</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/30 rounded-full transition-all duration-500" style={{ width: `${getDevicePct(deviceStats.tablet)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-muted-foreground text-center leading-relaxed">
            * 90% das leituras ocorrem fisicamente através da digitalização do QR Code impresso no seu estabelecimento.
          </div>
        </div>

      </div>

      {/* COMPARATIVOS DE COMPARTILHAMENTO E OUVIDORIA RAPIDA */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* CARD DO LINK PÚBLICO */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg mb-1">Seu Link Compartilhável</h3>
            <p className="text-xs text-muted-foreground mb-4">Envie pelo WhatsApp ou configure no Instagram do seu negócio</p>
          </div>

          <div className="bg-background/80 p-3.5 rounded-2xl border border-border flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold truncate text-primary/80">{publicUrl}</span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all shrink-0 outline-none"
            >
              {copied ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard/page-builder"
              className="w-1/2 font-bold text-xs border border-border hover:bg-foreground/5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Personalizar Design
            </Link>
            <a
              href={`/p/${user.company?.slug}`}
              target="_blank"
              className="w-1/2 font-bold text-xs bg-primary hover:bg-primary/95 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Testar Página <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* FEEDBACKS NEGATIVOS RECENTES */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-lg">Reclamações na Ouvidoria</h3>
              <p className="text-xs text-muted-foreground">Críticas construtivas retidas privadamente antes do Google</p>
            </div>
            <Link href="/dashboard/feedbacks" className="text-xs font-bold text-primary hover:underline">
              Ver Todos
            </Link>
          </div>

          <div className="space-y-3">
            {recentFeedbacks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground font-semibold">
                Nenhum feedback negativo recebido. Excelente sinal! 🎉
              </div>
            ) : (
              recentFeedbacks.map((fb) => (
                <div key={fb.id} className="p-3 bg-foreground/5 border border-border/50 rounded-2xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{fb.customerName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      fb.status === 'RESOLVIDO'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : fb.status === 'EM_CONTATO'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {fb.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1 italic">"{fb.comments}"</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
