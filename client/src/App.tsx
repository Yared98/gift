import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import type { PriceFilter, SortOption } from './components/FilterBar';
import { GiftCard } from './components/GiftCard';
import { AdminView } from './components/AdminView';
import { ShareTokenGate } from './components/ShareTokenGate';
import { InspirationsSection } from './components/InspirationsSection';
import { AuthModal } from './components/AuthModal';
import { PendingApprovalView } from './components/PendingApprovalView';
import { LandingPage } from './components/LandingPage';
import { QuickAddModal } from './components/QuickAddModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import type { Gift, PublicSettings, User } from './types';
import { ShieldCheck } from 'lucide-react';
import { applyTheme, getThemeDisplayMode } from './themePresets';

export function AppContent() {
  const { setTheme } = useTheme();
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });

  // Web Share Target & Quick Add State
  const [rawSharedText, setRawSharedText] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Authentication State
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem('wishlist_auth_token') || '';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Helper to extract slug from URL pathname or ?u=
  const getSlugFromLocation = () => {
    const path = window.location.pathname;
    if (path.startsWith('/u/')) {
      const parts = path.split('/u/')[1].split('/');
      return parts[0] || '';
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('u') || '';
  };

  // Reactive slug state
  const [currentSlug, setCurrentSlug] = useState<string>(getSlugFromLocation);

  // Detect token from query ?token=...
  const [token, setToken] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      sessionStorage.setItem('wishlist_share_token', urlToken);
      return urlToken;
    }
    return sessionStorage.getItem('wishlist_share_token') || '';
  });

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({
    title: 'Minha Lista de Presentes',
    subtitle: '',
    owner_name: '',
    total_items: 0,
    valid_token: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Verify current user auth
  const fetchCurrentUser = useCallback(async (activeToken: string) => {
    if (!activeToken) {
      setCurrentUser(null);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        // Se acessou a raiz (/) e está logado, abre direto o seu painel de controle
        if (!getSlugFromLocation()) {
          setIsAdminView(true);
        }
      } else {
        localStorage.removeItem('wishlist_auth_token');
        setAuthToken('');
        setCurrentUser(null);
      }
    } catch {
      // Network error
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchCurrentUser(authToken);
    }
  }, [authToken, fetchCurrentUser]);

  // Fetch public wishlist data
  const fetchPublicData = useCallback(async (activeToken: string, activeSlug: string) => {
    if (!activeSlug) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = `/api/public/u/${encodeURIComponent(activeSlug)}?token=${encodeURIComponent(activeToken)}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const userObj = data.user || data;
        setGifts(data.gifts || []);
        setSettings({
          title: userObj.title || 'Minha Lista de Presentes',
          subtitle: userObj.subtitle || '',
          owner_name: userObj.name || userObj.owner_name || '',
          slug: userObj.slug || activeSlug,
          total_items: data.gifts ? data.gifts.length : 0,
          valid_token: true,
          theme: userObj.theme || 'salvia',
          interests: data.interests || [],
        });
      } else {
        setSettings((prev) => ({ ...prev, valid_token: false }));
      }
    } catch {
      setSettings((prev) => ({ ...prev, valid_token: false }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentSlug) {
      fetchPublicData(token, currentSlug);
    } else {
      setIsLoading(false);
    }
  }, [token, currentSlug, fetchPublicData]);

  // Apply visual theme dynamically based on view and profile
  useEffect(() => {
    const activeTheme = currentSlug ? (settings.theme || currentUser?.theme || 'salvia') : (currentUser?.theme || 'salvia');
    applyTheme(activeTheme);

    // If viewing a public list, enforce the list owner's display mode (dark / light / auto)
    if (currentSlug && !isAdminView) {
      const mode = getThemeDisplayMode(activeTheme);
      if (mode === 'dark') {
        setTheme('dark');
      } else if (mode === 'light') {
        setTheme('light');
      }
    }
  }, [isAdminView, currentSlug, settings.theme, currentUser?.theme, setTheme]);

  // Browser Back / Forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      const slug = getSlugFromLocation();
      setCurrentSlug(slug);

      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || sessionStorage.getItem('wishlist_share_token') || '';
      setToken(urlToken);

      if (slug) {
        setIsAdminView(false);
        fetchPublicData(urlToken, slug);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchPublicData]);

  // Dynamic Categories from available gifts (case-insensitive deduplication, canonical title casing)
  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    gifts.forEach((g) => {
      const trimmed = (g.category || '').trim();
      if (trimmed) {
        const lower = trimmed.toLowerCase();
        if (!catMap.has(lower)) {
          catMap.set(lower, trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
        }
      }
    });
    return Array.from(catMap.values());
  }, [gifts]);

  // Filtered & Sorted Gifts
  const filteredGifts = useMemo(() => {
    return gifts
      .filter((gift) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = gift.title.toLowerCase().includes(q);
          const matchCat = gift.category.toLowerCase().includes(q);
          const matchNotes = gift.notes.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchNotes) return false;
        }

        if (category !== 'all' && gift.category.trim().toLowerCase() !== category.trim().toLowerCase()) return false;
        if (priceFilter === 'under-50' && gift.price > 50) return false;
        if (priceFilter === '50-150' && (gift.price < 50 || gift.price > 150)) return false;
        if (priceFilter === '150-300' && (gift.price < 150 || gift.price > 300)) return false;
        if (priceFilter === 'over-300' && gift.price < 300) return false;

        if (onlyFavorites && gift.priority !== 1) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortOption === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortOption === 'priority') {
          const aFav = a.priority === 1 ? 0 : 1;
          const bFav = b.priority === 1 ? 0 : 1;
          if (aFav !== bFav) return aFav - bFav;
          return (b.id || 0) - (a.id || 0);
        }
        return (b.id || 0) - (a.id || 0);
      });
  }, [gifts, search, category, priceFilter, onlyFavorites, sortOption]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setPriceFilter('all');
    setOnlyFavorites(false);
    setSortOption('recent');
  };

  const handleApplyToken = (newToken: string) => {
    setToken(newToken);
    sessionStorage.setItem('wishlist_share_token', newToken);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('token', newToken);
    window.history.replaceState({}, '', newUrl.toString());
    if (currentSlug) {
      fetchPublicData(newToken, currentSlug);
    }
  };

  // Listen for PWA beforeinstallprompt & standalone display mode
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const mql = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || (window.navigator as any).standalone === true);
    };
    mql.addEventListener('change', handleDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      mql.removeEventListener('change', handleDisplayChange);
    };
  }, []);

  // Listen for Web Share Target query params (?url=... or ?text=... or ?title=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrlParam = params.get('url');
    const sharedTextParam = params.get('text');
    const sharedTitleParam = params.get('title');

    const combinedText = [sharedUrlParam, sharedTextParam, sharedTitleParam]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (combinedText) {
      setRawSharedText(combinedText);
      setIsQuickAddOpen(true);

      // Clean query params from URL so refresh doesn't reopen modal
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('url');
      newUrl.searchParams.delete('text');
      newUrl.searchParams.delete('title');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // Check if there was a pending quick add from previous unauthenticated share
      const pendingShare = sessionStorage.getItem('pending_quick_add');
      if (pendingShare && authToken) {
        setRawSharedText(pendingShare);
        setIsQuickAddOpen(true);
      }
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem('wishlist_auth_token');
    setAuthToken('');
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const handleAuthSuccess = (loggedUser: User, newAuthToken: string) => {
    setCurrentUser(loggedUser);
    setAuthToken(newAuthToken);
    setIsAdminView(true);

    // If there was a pending quick add item waiting for authentication:
    const pendingShare = sessionStorage.getItem('pending_quick_add');
    if (pendingShare) {
      setRawSharedText(pendingShare);
      setIsQuickAddOpen(true);
    }
  };

  const handleViewMyList = useCallback((targetUser?: User | null) => {
    const u = targetUser || currentUser;
    if (!u) return;
    const targetSlug = u.slug;
    const targetToken = u.share_token;
    setCurrentSlug(targetSlug);
    setToken(targetToken);
    sessionStorage.setItem('wishlist_share_token', targetToken);
    window.history.pushState({}, '', `/u/${targetSlug}?token=${targetToken}`);
    fetchPublicData(targetToken, targetSlug);
    setIsAdminView(false);
  }, [currentUser, fetchPublicData]);

  const isLandingPage = !currentSlug && !isAdminView;

  const shareUrl = settings.slug
    ? `${window.location.origin}/u/${settings.slug}?token=${token}`
    : `${window.location.origin}/?token=${token}`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors duration-200">
      <Navbar
        title={isLandingPage ? 'Minha Lista de Presentes' : settings.title}
        isAdmin={isAdminView}
        isLandingPage={isLandingPage}
        currentUser={currentUser}
        onToggleAdmin={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            if (isAdminView) {
              handleViewMyList(currentUser);
            } else {
              setIsAdminView(true);
            }
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        shareUrl={shareUrl}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
      />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-3.5 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12">
        {isAdminView ? (
          !currentUser ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-sm text-on-surface-variant">Faça login para acessar o painel administrativo.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-sm"
              >
                Entrar com Google
              </button>
            </div>
          ) : currentUser.status === 'PENDING' || currentUser.status === 'REJECTED' ? (
            <PendingApprovalView
              user={currentUser}
              onRefresh={() => fetchCurrentUser(authToken)}
              onLogout={handleLogout}
            />
          ) : (
            <AdminView
              user={currentUser}
              authToken={authToken}
              onBackToPublic={() => handleViewMyList(currentUser)}
              onRefreshData={() => {
                fetchCurrentUser(authToken);
                if (currentSlug || currentUser.slug) {
                  fetchPublicData(token || currentUser.share_token, currentSlug || currentUser.slug);
                }
              }}
              onLogout={handleLogout}
              onUserUpdated={(updatedUser) => {
                setCurrentUser(updatedUser);
              }}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              isStandalone={isStandalone}
            />
          )
        ) : isLandingPage ? (
          <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />
        ) : !settings.valid_token ? (
          <ShareTokenGate
            onApplyToken={handleApplyToken}
            onOpenAdmin={() => {
              if (currentUser) {
                setIsAdminView(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        ) : (
          <>
            {/* Welcoming Hero Banner */}
            <Hero
              title={settings.title}
              subtitle={settings.subtitle}
              ownerName={settings.owner_name}
              totalItems={gifts.length}
            />

            {/* Filter Bar */}
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              selectedCategory={category}
              onCategoryChange={setCategory}
              categories={categories}
              selectedPrice={priceFilter}
              onPriceChange={setPriceFilter}
              onlyFavorites={onlyFavorites}
              onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
              sortOption={sortOption}
              onSortChange={setSortOption}
              totalFiltered={filteredGifts.length}
              onReset={handleResetFilters}
            />

            {/* Gifts Card Grid */}
            <section id="presentes" className="scroll-mt-24">
              {isLoading ? (
                <div className="py-24 text-center text-on-surface-variant font-serif text-lg">
                  Carregando lista de desejos...
                </div>
              ) : filteredGifts.length === 0 ? (
                <div className="py-20 text-center bg-surface rounded-2xl border border-border p-8 space-y-3">
                  <p className="font-serif text-xl text-on-surface">Nenhum presente encontrado com estes filtros.</p>
                  <p className="text-xs sm:text-sm text-on-surface-variant">Tente remover filtros para ver mais opções.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 bg-surface-low border border-border rounded-xl text-xs font-medium text-primary hover:bg-surface-container"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredGifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} />
                  ))}
                </div>
              )}
            </section>

            {/* Inspirations & Personal Universe Section */}
            <InspirationsSection interests={settings.interests || []} />
          </>
        )}
      </main>

      {/* Auth Modal for Login / Registration Request */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* PWA Quick Add Modal (Web Share Target) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        rawSharedText={rawSharedText}
        currentUser={currentUser}
        authToken={authToken}
        availableCategories={categories}
        onClose={() => setIsQuickAddOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onGiftAdded={() => {
          fetchCurrentUser(authToken);
          if (currentSlug || currentUser?.slug) {
            fetchPublicData(token || currentUser?.share_token || '', currentSlug || currentUser?.slug || '');
          }
        }}
      />

      {/* PWA Install Instructions & Native Prompt Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Discreet Footer */}
      <footer className="border-t border-border bg-surface/50 py-8 px-4 text-center text-xs text-on-surface-variant transition-colors duration-200">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-serif">
            {isLandingPage ? 'Minha Lista de Presentes' : settings.title} · Curadoria pessoal privada. Não indexado para motores de busca.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentUser) {
                  if (isAdminView) {
                    handleViewMyList(currentUser);
                  } else {
                    setIsAdminView(true);
                  }
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentUser
                  ? isAdminView
                    ? 'Ver Minha Lista'
                    : 'Meu Painel'
                  : 'Entrar / Criar Lista'}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
