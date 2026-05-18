'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  Save,
  Loader2,
  Trash2,
  Smile,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface PageBuilderFormProps {
  initialCompany: {
    name: string;
    slug: string;
    logoUrl: string | null;
    googleReviewUrl: string;
    customPhrase: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    bgColor: string;
    satisfactionFilter: boolean;
  };
}

const THEME_PRESETS = [
  {
    name: 'Original Light',
    primary: '#4F46E5', // Indigo
    secondary: '#06B6D4', // Cyan
    bg: '#F9FAFB', // Slate 50
    text: '#1F2937', // Slate 800
  },
  {
    name: 'Original Dark',
    primary: '#6366F1', // Indigo Light
    secondary: '#22D3EE', // Cyan Light
    bg: '#0F172A', // Slate 900
    text: '#F8FAFC', // Slate 50
  },
  {
    name: 'Menta & Esmeralda',
    primary: '#10B981', // Emerald
    secondary: '#3B82F6', // Blue
    bg: '#ECFDF5', // Emerald 50
    text: '#064E3B', // Emerald 900
  },
  {
    name: 'Púrpura Premium',
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    bg: '#FAF5FF', // Purple 50
    text: '#3B0764', // Purple 950
  },
  {
    name: 'Sunset Café',
    primary: '#F97316', // Orange
    secondary: '#EF4444', // Red
    bg: '#FFF7ED', // Orange 50
    text: '#431407', // Orange 950
  }
];

export default function PageBuilderForm({ initialCompany }: PageBuilderFormProps) {
  // Form states
  const [name, setName] = useState(initialCompany.name);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialCompany.googleReviewUrl);
  const [customPhrase, setCustomPhrase] = useState(initialCompany.customPhrase);
  const [primaryColor, setPrimaryColor] = useState(initialCompany.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialCompany.secondaryColor);
  const [textColor, setTextColor] = useState(initialCompany.textColor);
  const [bgColor, setBgColor] = useState(initialCompany.bgColor);
  const [satisfactionFilter, setSatisfactionFilter] = useState(initialCompany.satisfactionFilter);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialCompany.logoUrl);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${initialCompany.slug}`
    : `https://avaliapro.com.br/p/${initialCompany.slug}`;

  // 1. Gera código QR dinâmico quando a página monta
  useEffect(() => {
    QRCode.toDataURL(
      publicUrl,
      { width: 350, margin: 2 },
      (err, url) => {
        if (!err) setQrCodeDataUrl(url);
      }
    );
  }, [publicUrl]);

  // 2. Aplica tema de cores padrão
  const applyTheme = (theme: typeof THEME_PRESETS[0]) => {
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setBgColor(theme.bg);
    setTextColor(theme.text);
  };

  // 3. Trata upload de imagem de logo local e converte em Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem do logotipo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 4. Copiar link
  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5. Salva dados da empresa no servidor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          googleReviewUrl,
          customPhrase,
          primaryColor,
          secondaryColor,
          textColor,
          bgColor,
          satisfactionFilter,
          logoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao salvar as alterações.');
      }

      setSuccess('Sua página de avaliação foi personalizada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Personalizar Minha Página</h1>
        <p className="text-muted-foreground text-sm">Defina a identidade visual, logo e o link da sua empresa.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA (FORMULÁRIO CONSTRUTOR) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* CONTEÚDO */}
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <h3 className="font-extrabold text-lg border-b border-border pb-3">1. Informações Básicas</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Nome da Empresa</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Café Central"
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Link de Avaliação do Google</label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/30 text-primary"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                * Este é o link oficial que leva direto para a caixa de escrita da sua empresa no Google.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Chamada Personalizada</label>
              <textarea
                value={customPhrase}
                onChange={(e) => setCustomPhrase(e.target.value)}
                placeholder="Como foi sua experiência conosco?"
                rows={2}
                className="w-full bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* DESIGN SYSTEM / IDENTIDADE VISUAL */}
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <h3 className="font-extrabold text-lg border-b border-border pb-3">2. Identidade Visual</h3>
            
            {/* Logo upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Logotipo da Empresa</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-grow space-y-1.5">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      id="logo-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-input"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-foreground/5 hover:bg-foreground/10 px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-border"
                    >
                      <Upload className="w-3.5 h-3.5" /> Escolher Logotipo
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground">JPEG ou PNG. Máximo 2MB.</p>
                </div>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="p-2.5 rounded-xl border border-border text-rose-500 hover:bg-rose-500/5 transition-all outline-none shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Presets Temas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 text-muted-foreground">Paletas Rápidas (Temas)</label>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map((theme, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTheme(theme)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-foreground/5 hover:bg-foreground/10 px-3 py-2 rounded-xl transition-all border border-border"
                  >
                    <span className="w-3 h-3 rounded-full flex overflow-hidden border border-white/20">
                      <span className="w-1/2 h-full" style={{ backgroundColor: theme.primary }}></span>
                      <span className="w-1/2 h-full" style={{ backgroundColor: theme.bg }}></span>
                    </span>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-border"
                  />
                  <span className="text-xs font-semibold uppercase">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-border"
                  />
                  <span className="text-xs font-semibold uppercase">{secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Cor de Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-border"
                  />
                  <span className="text-xs font-semibold uppercase">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Cor do Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-border"
                  />
                  <span className="text-xs font-semibold uppercase">{textColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FILTRO INTELIGENTE SWITCH */}
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm">Filtro de Satisfação Ativo</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Quando ativado, avaliações baixas (1, 2 ou 3 estrelas) caem na ouvidoria interna ao invés de irem para o Google.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setSatisfactionFilter(!satisfactionFilter)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 outline-none ${
                satisfactionFilter ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                satisfactionFilter ? 'left-7' : 'left-1'
              }`}></span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-2.5 text-sm animate-in fade-in slide-in-from-bottom duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-start gap-2.5 text-sm animate-in fade-in slide-in-from-bottom duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold bg-primary hover:bg-primary/95 text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg glow-hover transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Salvar Personalização
              </>
            )}
          </button>
        </form>

        {/* COLUNA DIREITA (SIMULADOR MOBILE & QR CODE) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col items-center lg:items-stretch">
          
          {/* SIMULADOR MOBILE LIVE */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5 self-center">
              <Smartphone className="w-4 h-4" /> Live Mobile Simulator
            </div>
            
            {/* CELULAR DE VIDRO MOCKUP */}
            <div className="phone-mockup">
              {/* Tela Interna */}
              <div
                className="w-full h-full flex flex-col justify-between p-6 pt-12 overflow-y-auto"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {/* Logo e nome da empresa */}
                <div className="flex flex-col items-center text-center mt-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 shadow-md border border-white/10 flex items-center justify-center overflow-hidden mb-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="font-extrabold text-2xl opacity-60" style={{ color: textColor }}>
                        {name ? name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                  </div>
                  <h4 className="font-extrabold text-lg truncate w-full px-2" style={{ color: textColor }}>
                    {name || 'Minha Empresa'}
                  </h4>
                </div>

                {/* Bloco Central de Estrelas do Google e G Logo */}
                <div className="my-auto text-center py-6 flex flex-col items-center">
                  {/* Google G Logo */}
                  <div className="w-11 h-11 bg-white rounded-xl shadow-md flex items-center justify-center mb-4 border border-white/20 p-2">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>

                  <p className="text-xs font-bold mb-4 max-w-[200px]" style={{ color: textColor }}>
                    {customPhrase || 'Como foi sua experiência conosco?'}
                  </p>
                  
                  {/* Mock 5-Star Row */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        viewBox="0 0 24 24"
                        className="w-6 h-6 fill-amber-500 text-amber-500 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.3)]"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[9px] opacity-75 font-semibold">Toque nas estrelas para avaliar</span>
                </div>

                {/* Rodapé do celular */}
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-1 text-[8px] font-bold py-1.5 px-3 rounded-full bg-white/10 border border-white/10"
                    style={{ color: textColor }}
                  >
                    AvaliaPro Certificado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COMPARTILHAMENTO & QR CODE CARD */}
          <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
            <h3 className="font-extrabold text-md mb-1.5">Compartilhar Página</h3>
            <p className="text-xs text-muted-foreground mb-4">Gere e baixe seu código QR físico de forma gratuita</p>

            {/* Imagem do QR Code gerada */}
            <div className="w-44 h-44 rounded-2xl bg-white border border-border p-2.5 flex items-center justify-center shadow-inner mb-4 overflow-hidden">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              )}
            </div>

            {/* Ações */}
            <div className="w-full space-y-2">
              <button
                onClick={handleCopy}
                className="w-full font-bold text-xs bg-foreground/5 hover:bg-foreground/10 border border-border py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar Link Amigável
                  </>
                )}
              </button>
              
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`qrcode-${initialCompany.slug}.png`}
                  className="w-full font-bold text-xs bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Baixar QR Code (PNG)
                </a>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
