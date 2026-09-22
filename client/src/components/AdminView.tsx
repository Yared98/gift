import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Settings as SettingsIcon,
  RefreshCw,
  Check,
  X,
  Copy,
  Film,
  Music,
  Gamepad2,
  Shirt,
  Gift as GiftIcon,
  HeartHandshake,
  Users,
  LogOut,
  Shield,
  Link as LinkIcon,
  Heart,
  Eye,
  Palette,
  Share2,
  Upload,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';
import type { Gift, ScrapeResponse, InterestCategory, User } from '../types';
import {
  THEME_PRESETS,
  applyTheme,
  parseSlackTheme,
  formatSlackTheme,
  generateHarmonicTheme,
  normalizeHex,
  getThemeDisplayMode,
  setThemeDisplayMode,
  stripThemeDisplayMode,
} from '../themePresets';
import type { SlackThemeTokens, ThemeDisplayMode } from '../themePresets';
import { SuperAdminUsersTab } from './SuperAdminUsersTab';
import { useTheme } from '../context/ThemeContext';

interface AdminViewProps {
  user: User;
  authToken: string;
  onBackToPublic: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
  onUserUpdated: (u: User) => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  authToken,
  onBackToPublic,
  onRefreshData,
  onLogout,
  onUserUpdated,
  onOpenInstallModal,
  isStandalone = false,
}) => {
  const [activeTab, setActiveTab] = useState<'gifts' | 'interests' | 'profile' | 'users'>('gifts');

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  // Form State for Gifts
  const [editingId, setEditingId] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const [title, setTitle] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<string>('');
  const [priority, setPriority] = useState<number>(2);
  const [category, setCategory] = useState('Tech & Games');
  const [customCategory, setCustomCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interests / Inspirações State
  const [interests, setInterests] = useState<InterestCategory[]>([]);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestsSuccess, setInterestsSuccess] = useState('');

  // Profile Settings State
  const { theme: currentThemeMode, setTheme: setGlobalTheme } = useTheme();
  const isDark = currentThemeMode === 'dark';
  const [nameInput, setNameInput] = useState(user.name);
  const [slugInput, setSlugInput] = useState(user.slug);
  const [shareTokenInput, setShareTokenInput] = useState(user.share_token);
  const [listTitleInput, setListTitleInput] = useState(user.title);
  const [listSubtitleInput, setListSubtitleInput] = useState(user.subtitle);
  const [themeInput, setThemeInput] = useState<string>(user.theme || 'salvia');
  const [displayModeInput, setDisplayModeInput] = useState<ThemeDisplayMode>(() => getThemeDisplayMode(user.theme));
  const [themeModeTab, setThemeModeTab] = useState<'presets' | 'custom'>(() => {
    return user.theme?.startsWith('slack:') || user.theme?.startsWith('custom:') || (user.theme && user.theme.includes(','))
      ? 'custom'
      : 'presets';
  });
  const [slackTokens, setSlackTokens] = useState<SlackThemeTokens>(() => {
    const parsed = parseSlackTheme(user.theme);
    if (parsed) return parsed;
    return {
      primary: '#2D5940',
      accent: '#B45309',
      favorite: '#E11D48',
      background: '#FAF7F2',
      gradient: false,
    };
  });
  const [copiedSlackTheme, setCopiedSlackTheme] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importThemeInput, setImportThemeInput] = useState('');
  const [importError, setImportError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    setNameInput(user.name);
    setSlugInput(user.slug);
    setShareTokenInput(user.share_token);
    setListTitleInput(user.title);
    setListSubtitleInput(user.subtitle);
    setThemeInput(user.theme || 'salvia');
    setDisplayModeInput(getThemeDisplayMode(user.theme));
    const parsed = parseSlackTheme(user.theme);
    if (parsed) {
      setSlackTokens(parsed);
      setThemeModeTab('custom');
    }
  }, [user]);

  const standardCategories = [
    'Tech & Games',
    'Livros',
    'Casa & Café',
    'Vestuário',
    'Hobbies',
    'Outros',
  ];

  useEffect(() => {
    loadUserData();
  }, [authToken]);

  const loadUserData = async () => {
    setLoadingGifts(true);
    try {
      const [giftsRes, interestsRes] = await Promise.all([
        fetch('/api/user/gifts', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/user/interests', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (giftsRes.ok) {
        const data = await giftsRes.json();
        setGifts(data.gifts || []);
      }
      if (interestsRes.ok) {
        const ints = await interestsRes.json();
        setInterests(ints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGifts(false);
    }
  };

  // Magic Scraper
  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    setIsScraping(true);
    setScrapeError('');

    try {
      const res = await fetch('/api/user/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        throw new Error('Não foi possível obter dados automáticos deste link.');
      }

      const data: ScrapeResponse = await res.json();
      if (data.title) setTitle(data.title);
      if (data.image_url) setImageUrl(data.image_url);
      if (data.price && data.price > 0) setPrice(data.price.toString());
      setProductUrl(urlInput.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar link';
      setScrapeError(msg);
      setProductUrl(urlInput.trim());
    } finally {
      setIsScraping(false);
    }
  };

  // Save Gift
  const handleSubmitGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const finalCategory = category === 'Outros' && customCategory.trim() ? customCategory.trim() : category;

    const payload = {
      title: title.trim(),
      url: productUrl.trim(),
      image_url: imageUrl.trim(),
      price: parseFloat(price) || 0.0,
      priority,
      category: finalCategory,
      notes: notes.trim(),
    };

    try {
      const url = editingId ? `/api/user/gifts/${editingId}` : '/api/user/gifts';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        loadUserData();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (gift: Gift) => {
    setEditingId(gift.id);
    setTitle(gift.title);
    setProductUrl(gift.url);
    setImageUrl(gift.image_url);
    setPrice(gift.price > 0 ? gift.price.toString() : '');
    setPriority(gift.priority);
    setNotes(gift.notes);
    if (standardCategories.includes(gift.category)) {
      setCategory(gift.category);
    } else {
      setCategory('Outros');
      setCustomCategory(gift.category);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este presente?')) return;
    try {
      const res = await fetch(`/api/user/gifts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setGifts((prev) => prev.filter((g) => g.id !== id));
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setUrlInput('');
    setTitle('');
    setProductUrl('');
    setImageUrl('');
    setPrice('');
    setPriority(2);
    setCategory('Tech & Games');
    setCustomCategory('');
    setNotes('');
    setScrapeError('');
  };

  // Interests / Tags Management
  const handleAddTag = (catId: string) => {
    const raw = tagInputs[catId] || '';
    if (!raw.trim()) return;

    setInterests((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return { ...c, tags: [...c.tags, raw.trim()] };
        }
        return c;
      })
    );
    setTagInputs((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleRemoveTag = (catId: string, tagIndex: number) => {
    setInterests((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          const newTags = [...c.tags];
          newTags.splice(tagIndex, 1);
          return { ...c, tags: newTags };
        }
        return c;
      })
    );
  };

  const handleUpdateNotes = (catId: string, newNotes: string) => {
    setInterests((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return { ...c, notes: newNotes };
        }
        return c;
      })
    );
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    setInterestsSuccess('');
    try {
      const res = await fetch('/api/user/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ interests }),
      });
      if (res.ok) {
        setInterestsSuccess('Gostos e inspirações salvos com sucesso!');
        onRefreshData();
        setTimeout(() => setInterestsSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInterests(false);
    }
  };

  // Slack Custom Theme Handlers
  const handleUpdateSlackToken = (key: keyof SlackThemeTokens, value: any) => {
    const next = { ...slackTokens, [key]: value };
    setSlackTokens(next);
    const formatted = formatSlackTheme(next);
    setThemeInput(formatted);
    applyTheme(formatted);
  };

  const handleSurpriseMe = () => {
    const surprise = generateHarmonicTheme();
    setSlackTokens(surprise);
    const formatted = formatSlackTheme(surprise);
    setThemeInput(formatted);
    applyTheme(formatted);
  };

  const handleShareSlackTheme = () => {
    const rawCodes = `${slackTokens.primary},${slackTokens.accent},${slackTokens.favorite},${slackTokens.background}`;
    navigator.clipboard.writeText(rawCodes);
    setCopiedSlackTheme(true);
    setTimeout(() => setCopiedSlackTheme(false), 2500);
  };

  const handleImportSlackTheme = () => {
    setImportError('');
    const parsed = parseSlackTheme(importThemeInput);
    if (!parsed) {
      setImportError('Formato inválido. Use 4 códigos hexadecimais separados por vírgula (ex: #2D5940,#B45309,#E11D48,#FAF7F2).');
      return;
    }
    setSlackTokens(parsed);
    const formatted = formatSlackTheme(parsed);
    setThemeInput(formatted);
    applyTheme(formatted);
    setImportModalOpen(false);
    setImportThemeInput('');
  };

  // Save Profile & Slug
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: nameInput.trim(),
          slug: slugInput.trim(),
          share_token: shareTokenInput.trim(),
          title: listTitleInput.trim(),
          subtitle: listSubtitleInput.trim(),
          theme: themeInput,
        }),
      });

      if (res.ok) {
        const updatedUser: User = await res.json();
        onUserUpdated(updatedUser);
        setProfileSuccess('Perfil e configurações do link atualizados!');
        onRefreshData();
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const copyShareUrl = () => {
    const fullUrl = `${window.location.origin}/u/${user.slug}?token=${user.share_token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const getInterestIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'film':
        return <Film className="w-5 h-5 text-primary" />;
      case 'music':
        return <Music className="w-5 h-5 text-primary" />;
      case 'gamepad2':
      case 'games':
        return <Gamepad2 className="w-5 h-5 text-primary" />;
      case 'shirt':
      case 'sizes':
        return <Shirt className="w-5 h-5 text-primary" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-8">
      {/* Top Header Row */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-paper flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-serif text-lg font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">
                Olá, {user.name}
              </h2>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary text-white">
                  <Shield className="w-3 h-3" />
                  Super-Admin
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
              {user.email} • <span className="text-primary font-semibold">/u/{user.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-low border border-border text-on-surface text-xs sm:text-sm font-medium hover:bg-surface-container transition-all"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>Ver Minha Lista</span>
          </button>

          <button
            onClick={copyShareUrl}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover shadow-sm transition-all"
          >
            {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Link</span>
          </button>

          <button
            onClick={onLogout}
            title="Sair da conta"
            className="p-2 rounded-xl border border-border text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-sm max-w-2xl">
        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'gifts'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
          }`}
        >
          <GiftIcon className="w-4 h-4" />
          <span>Meus Presentes ({gifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('interests')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'interests'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Gostos & Inspirações</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Meu Link & Perfil</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários & Convites</span>
          </button>
        )}
      </div>

      {/* TAB 1: GIFTS MANAGEMENT */}
      {activeTab === 'gifts' && (
        <>
          {/* Add / Edit Gift Section with Link Scraper */}
          <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface flex items-center gap-2">
                {editingId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                <span>{editingId ? 'Editar Presente' : 'Adicionar Novo Presente'}</span>
              </h3>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar Edição</span>
                </button>
              )}
            </div>

            {/* Magic Scraper Bar */}
            <div className="p-4 rounded-xl bg-surface-low border border-border space-y-2">
              <label className="block text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-amber" />
                <span>Preenchimento Automático via Link</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Cole o link do produto (Amazon, Mercado Livre, Zara, etc.)..."
                  className="flex-1 h-11 px-4 bg-surface border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={isScraping || !urlInput.trim()}
                  className="px-5 h-11 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-accent-amber" />
                      <span>Buscar Dados</span>
                    </>
                  )}
                </button>
              </div>
              {scrapeError && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ {scrapeError} Preencha os campos manualmente abaixo.
                </p>
              )}
            </div>

            {/* Gift Form */}
            <form onSubmit={handleSubmitGift} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Preview / Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase">
                    Foto do Produto
                  </label>
                  <div className="aspect-square rounded-xl bg-white dark:bg-zinc-900/60 border border-border p-3 overflow-hidden flex items-center justify-center relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={() => {}}
                      />
                    ) : (
                      <span className="text-xs text-on-surface-variant/50">Sem imagem</span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL da Imagem..."
                    className="w-full h-9 px-3 bg-surface-low border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Title & Product URL */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Título / Nome do Presente *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Moedor de Café Manual em Inox"
                      className="w-full h-11 px-4 bg-surface-low border border-border rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Link de Compra
                    </label>
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-11 px-4 bg-surface-low border border-border rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                        Preço Estimado (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                        Destaque Especial
                      </label>
                      <button
                        type="button"
                        onClick={() => setPriority(priority === 1 ? 2 : 1)}
                        className={`w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between border ${
                          priority === 1
                            ? 'bg-favorite-subtle border-favorite-border text-favorite dark:bg-favorite-subtle dark:border-favorite/40 dark:text-favorite shadow-sm'
                            : 'bg-surface-low border-border text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Heart
                            className={`w-4 h-4 transition-transform ${
                              priority === 1 ? 'fill-favorite text-favorite scale-110' : 'text-on-surface-variant'
                            }`}
                          />
                          <span>{priority === 1 ? 'Marcado como Favorito' : 'Marcar como Favorito'}</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            priority === 1
                              ? 'bg-favorite border-favorite text-white font-bold'
                              : 'border-border text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category & Custom Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {standardCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {category === 'Outros' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Especifique a categoria..."
                      className="w-full h-10 px-3 mt-2 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                    Observações Personalizadas (Tamanho, Cor, Edição)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Tamanho M, Cor Grafite ou Preto"
                    className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm text-on-surface-variant hover:bg-surface-container"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingId
                    ? 'Atualizar Presente'
                    : 'Salvar Presente'}
                </button>
              </div>
            </form>
          </section>

          {/* Gifts List / Management Table */}
          <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface">
                Meus Presentes Cadastrados ({gifts.length})
              </h3>
              <button
                onClick={loadUserData}
                className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar lista</span>
              </button>
            </div>

            {loadingGifts ? (
              <div className="py-12 text-center text-on-surface-variant text-sm">Carregando itens...</div>
            ) : gifts.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant text-sm">
                Nenhum presente cadastrado ainda. Use o formulário acima para adicionar o primeiro item à sua lista!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {gifts.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-surface-low/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-white dark:bg-zinc-900/60 border border-border p-1 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant/40">
                            Foto
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-semibold text-on-surface line-clamp-1">
                            {item.title}
                          </h4>
                          {item.priority === 1 && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-favorite-subtle border border-favorite-border text-favorite dark:bg-favorite-subtle dark:border-favorite/30 dark:text-favorite shrink-0"
                              title="Marcado como Favorito"
                            >
                              <Heart className="w-3 h-3 fill-favorite text-favorite" />
                              <span>Favorito</span>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant mt-1">
                          <span className="font-medium text-primary">
                            {item.price > 0
                              ? new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(item.price)
                              : 'Sob consulta'}
                          </span>
                          <span>•</span>
                          <span>{item.category}</span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-on-surface-variant/80">
                                {item.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container"
                          title="Ver na loja"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container"
                        title="Editar presente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 rounded-lg hover:bg-red-500/10"
                        title="Excluir presente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* TAB 2: INTERESTS & INSPIRATIONS MANAGEMENT */}
      {activeTab === 'interests' && (
        <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <span>Meus Gostos & Inspirações</span>
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Adicione suas sagas, bandas, jogos e tamanhos para inspirar seus amigos que preferem dar lembranças temáticas fora da lista.
              </p>
            </div>

            <button
              onClick={handleSaveInterests}
              disabled={savingInterests}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
            >
              {savingInterests ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{savingInterests ? 'Salvando...' : 'Salvar Gostos'}</span>
            </button>
          </div>

          {interestsSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{interestsSuccess}</span>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interests.map((cat) => (
              <div
                key={cat.id}
                className="p-5 sm:p-6 rounded-2xl bg-surface-low border border-border space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/70">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    {getInterestIcon(cat.icon)}
                  </div>
                  <h4 className="font-serif text-base font-semibold text-on-surface">
                    {cat.title.replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\s]+/u, '').trim()}
                  </h4>
                </div>

                {/* Current Tags */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase">
                    Tags Atuais ({cat.tags.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                    {cat.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface border border-border text-on-surface shadow-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(cat.id, idx)}
                          className="text-on-surface-variant hover:text-red-500 rounded-full"
                          title="Remover tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInputs[cat.id] || ''}
                    onChange={(e) =>
                      setTagInputs({ ...tagInputs, [cat.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(cat.id);
                      }
                    }}
                    placeholder="Adicionar novo item..."
                    className="flex-1 h-9 px-3 bg-surface border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(cat.id)}
                    className="px-3 h-9 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Category Notes */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase">
                    Observações & Dicas para Convidados
                  </label>
                  <textarea
                    rows={2}
                    value={cat.notes}
                    onChange={(e) => handleUpdateNotes(cat.id, e.target.value)}
                    placeholder="Ex: Prefiro em tamanho M, cores escuras..."
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: PROFILE & LINK SETTINGS */}
      {activeTab === 'profile' && (
        <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-paper space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              <span>Configurações do Meu Link & Perfil</span>
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Personalize seu link público amigável, seu nome e as mensagens da sua página.
            </p>
          </div>

          {profileSuccess && (
            <div className="max-w-2xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Install Mobile PWA Banner */}
          {!isStandalone && onOpenInstallModal && (
            <div className="max-w-2xl p-4 rounded-2xl bg-surface-low border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-on-surface">Instalar Aplicativo no Celular</h4>
                  <p className="text-[11px] text-on-surface-variant">Compartilhe produtos direto da Amazon e Mercado Livre para sua lista com 1 toque.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Slug da URL Pública
                </label>
                <div className="flex items-center">
                  <span className="px-3 h-10 bg-surface-low border border-r-0 border-border rounded-l-xl text-xs text-on-surface-variant flex items-center font-mono">
                    /u/
                  </span>
                  <input
                    type="text"
                    required
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    className="flex-1 h-10 px-3 bg-surface-low border border-border rounded-r-xl text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Título da Sua Lista
              </label>
              <input
                type="text"
                required
                value={listTitleInput}
                onChange={(e) => setListTitleInput(e.target.value)}
                placeholder="Ex: Minha Lista de Presentes"
                className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Mensagem de Boas-Vindas
              </label>
              <textarea
                rows={2}
                value={listSubtitleInput}
                onChange={(e) => setListSubtitleInput(e.target.value)}
                placeholder="Ex: Ideias de presentes que eu adoraria ganhar..."
                className="w-full p-3 bg-surface-low border border-border rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Theme & Visual Identity Selection */}
            <div className="space-y-4 pt-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Palette className="w-4 h-4 text-primary" />
                    <span>Identidade Visual & Cores da Lista</span>
                  </label>
                  <p className="text-xs text-on-surface-variant">
                    Escolha uma das 12 paletas prontas ou crie sua combinação personalizada no estilo Slack.
                  </p>
                </div>

                {/* Tab Switcher: Paletas Prontas vs Tema Personalizado */}
                <div className="flex items-center gap-1 p-1 bg-surface-low border border-border rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setThemeModeTab('presets');
                      if (themeInput.startsWith('slack:') || themeInput.startsWith('custom:')) {
                        const defaultId = 'salvia';
                        setThemeInput(defaultId);
                        applyTheme(defaultId);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      themeModeTab === 'presets'
                        ? 'bg-surface text-on-surface shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Paletas Prontas (12)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setThemeModeTab('custom');
                      const formatted = formatSlackTheme(slackTokens);
                      setThemeInput(formatted);
                      applyTheme(formatted);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      themeModeTab === 'custom'
                        ? 'bg-surface text-on-surface shadow-xs font-semibold text-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Tema Personalizado</span>
                  </button>
                </div>
              </div>

              {/* Modo de Exibição da Lista Pública: Auto, Claro, Escuro */}
              <div className="p-3.5 bg-surface-low border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-primary" />
                    <span>Modo de Exibição da Lista Pública</span>
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Escolha como seus convidados verão sua lista ao abrir o link.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-surface border border-border p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDisplayModeInput('auto');
                      const next = setThemeDisplayMode(themeInput, 'auto');
                      setThemeInput(next);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      displayModeInput === 'auto'
                        ? 'bg-primary text-white shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Segue a preferência do dispositivo ou navegador do convidado"
                  >
                    🌓 Automático
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDisplayModeInput('light');
                      const next = setThemeDisplayMode(themeInput, 'light');
                      setThemeInput(next);
                      setGlobalTheme('light');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      displayModeInput === 'light'
                        ? 'bg-primary text-white shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Sempre abre no modo claro para os visitantes"
                  >
                    <Sun className="w-3 h-3" />
                    <span>Fixar Claro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDisplayModeInput('dark');
                      const next = setThemeDisplayMode(themeInput, 'dark');
                      setThemeInput(next);
                      setGlobalTheme('dark');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      displayModeInput === 'dark'
                        ? 'bg-primary text-white shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Sempre abre no modo escuro para os visitantes"
                  >
                    <Moon className="w-3 h-3" />
                    <span>Fixar Escuro</span>
                  </button>
                </div>
              </div>

              {themeModeTab === 'presets' ? (
                /* PRESETS GRID (12 Paletas) */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const cleanCurrentTheme = stripThemeDisplayMode(themeInput);
                    const isSelected = cleanCurrentTheme === preset.id;
                    const cardBg = isSelected
                      ? (isDark ? 'rgba(82, 194, 126, 0.2)' : 'rgba(45, 89, 64, 0.1)')
                      : (isDark ? preset.dark.bg : preset.previewBg);
                    const cardBorder = isSelected
                      ? 'var(--color-primary)'
                      : (isDark ? preset.dark.border || '#28382F' : preset.light.border || '#D1DDD2');

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          const next = setThemeDisplayMode(preset.id, displayModeInput);
                          setThemeInput(next);
                          applyTheme(next);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'ring-2 ring-primary/40 shadow-sm'
                            : 'hover:border-primary/50'
                        }`}
                        style={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-on-surface line-clamp-1">{preset.name}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          {/* Light preview swatch */}
                          <div
                            className="w-5 h-5 rounded-full border border-white/60 shadow-xs flex items-center justify-center text-[8px] text-white font-bold shrink-0"
                            style={{ backgroundColor: preset.previewLight }}
                            title="Cor no Modo Claro"
                          >
                            ☀
                          </div>
                          {/* Dark preview swatch */}
                          <div
                            className="w-5 h-5 rounded-full border border-black/40 shadow-xs flex items-center justify-center text-[8px] text-white font-bold shrink-0"
                            style={{ backgroundColor: preset.previewDark }}
                            title="Cor no Modo Escuro"
                          >
                            ☾
                          </div>
                          {/* Paper tint swatch */}
                          <div
                            className="w-5 h-5 rounded-full border border-black/20 shadow-xs flex items-center justify-center text-[8px] text-on-surface/70 font-bold shrink-0"
                            style={{ backgroundColor: isDark ? preset.dark.bg : preset.previewBg }}
                            title="Tom de Fundo / Papel da Lista"
                          >
                            📄
                          </div>
                          <span className="text-[10px] text-on-surface-variant truncate ml-0.5">
                            {preset.id === 'salvia' ? 'Padrão' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* SLACK-STYLE CUSTOM THEME EDITOR */
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-low border border-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                        <span>Cores de tema</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                          Estilo Slack
                        </span>
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Configure as 4 cores de visual da sua lista de forma livre ou gere uma harmonia cromática.
                      </p>
                    </div>

                    {/* Action Buttons: Compartilhar, Importar, Surpreenda-me */}
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleShareSlackTheme}
                        className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-on-surface hover:border-primary hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
                        title="Copiar sequência de hexadecimais para compartilhar"
                      >
                        {copiedSlackTheme ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Compartilhar</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImportError('');
                          setImportModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-on-surface hover:border-primary hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
                        title="Importar tema colando sequência de hexadecimais"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importar</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSurpriseMe}
                        className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-xs"
                        title="Sortear uma combinação harmônica surpresa"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                        <span>Surpreenda-me</span>
                      </button>
                    </div>
                  </div>

                  {/* Import Modal Dialog / Drawer */}
                  {importModalOpen && (
                    <div className="p-3.5 rounded-xl bg-surface border border-primary/30 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          Colar Código de Tema (Estilo Slack)
                        </span>
                        <button
                          type="button"
                          onClick={() => setImportModalOpen(false)}
                          className="text-on-surface-variant hover:text-on-surface text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={importThemeInput}
                          onChange={(e) => {
                            setImportThemeInput(e.target.value);
                            setImportError('');
                          }}
                          placeholder="Ex: #2D5940,#B45309,#E11D48,#FAF7F2"
                          className="flex-1 h-9 px-3 bg-surface-low border border-border rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={handleImportSlackTheme}
                          className="px-4 h-9 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover shadow-xs"
                        >
                          Aplicar
                        </button>
                      </div>
                      {importError && (
                        <p className="text-[11px] text-red-500 font-medium">{importError}</p>
                      )}
                    </div>
                  )}

                  {/* 4 Slack Color Slots Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Slot 1: Navegação do sistema (Primária) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface">
                        Navegação do sistema (Primária)
                      </label>
                      <div className="relative group flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl shadow-xs hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: slackTokens.primary }}
                          />
                          <span className="text-xs font-mono font-semibold text-on-surface uppercase">
                            {slackTokens.primary}
                          </span>
                        </div>
                        <Edit2 className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                        <input
                          type="color"
                          value={slackTokens.primary}
                          onChange={(e) => handleUpdateSlackToken('primary', normalizeHex(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Escolher cor primária"
                        />
                      </div>
                    </div>

                    {/* Slot 2: Itens selecionados & Destaques (Acento) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface">
                        Itens selecionados (Destaque)
                      </label>
                      <div className="relative group flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl shadow-xs hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: slackTokens.accent }}
                          />
                          <span className="text-xs font-mono font-semibold text-on-surface uppercase">
                            {slackTokens.accent}
                          </span>
                        </div>
                        <Edit2 className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                        <input
                          type="color"
                          value={slackTokens.accent}
                          onChange={(e) => handleUpdateSlackToken('accent', normalizeHex(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Escolher cor de destaque"
                        />
                      </div>
                    </div>

                    {/* Slot 3: Indicação de presença & Favoritos */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface">
                        Indicação de favoritos & Afeto
                      </label>
                      <div className="relative group flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl shadow-xs hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: slackTokens.favorite }}
                          />
                          <span className="text-xs font-mono font-semibold text-on-surface uppercase">
                            {slackTokens.favorite}
                          </span>
                        </div>
                        <Edit2 className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                        <input
                          type="color"
                          value={slackTokens.favorite}
                          onChange={(e) => handleUpdateSlackToken('favorite', normalizeHex(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Escolher cor de favoritos"
                        />
                      </div>
                    </div>

                    {/* Slot 4: Notificações & Plano de fundo */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface">
                        Plano de fundo da página (Papel)
                      </label>
                      <div className="relative group flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-xl shadow-xs hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: slackTokens.background }}
                          />
                          <span className="text-xs font-mono font-semibold text-on-surface uppercase">
                            {slackTokens.background}
                          </span>
                        </div>
                        <Edit2 className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                        <input
                          type="color"
                          value={slackTokens.background}
                          onChange={(e) => handleUpdateSlackToken('background', normalizeHex(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Escolher cor de fundo"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkbox: Gradiente da Janela */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(slackTokens.gradient)}
                        onChange={(e) => handleUpdateSlackToken('gradient', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <div>
                        <span className="text-xs font-medium text-on-surface block">
                          Gradiente da janela
                        </span>
                        <span className="text-[11px] text-on-surface-variant leading-tight block">
                          Misture as cores do plano de fundo da janela e dos itens de destaque no topo da lista.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Token de Acesso dos Convidados
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={shareTokenInput}
                  onChange={(e) => setShareTokenInput(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-low border border-border rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const rand = Math.random().toString(36).substring(2, 10);
                    setShareTokenInput(rand);
                  }}
                  className="px-3 bg-surface-low border border-border rounded-xl text-xs hover:bg-surface-container"
                >
                  Gerar
                </button>
              </div>
            </div>

            {/* Current Full Shareable URL Preview */}
            <div className="p-4 rounded-xl bg-surface-low border border-border space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Seu Link Completo para Enviar aos Amigos:
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border font-mono text-xs text-on-surface break-all">
                <span>{`${window.location.origin}/u/${slugInput}?token=${shareTokenInput}`}</span>
                <button
                  type="button"
                  onClick={copyShareUrl}
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-md shrink-0"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
              >
                {savingProfile ? 'Salvando...' : 'Salvar Alterações do Perfil'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 4: SUPER ADMIN USERS & WHITELIST MANAGEMENT */}
      {activeTab === 'users' && isSuperAdmin && (
        <SuperAdminUsersTab authToken={authToken} />
      )}
    </div>
  );
};
