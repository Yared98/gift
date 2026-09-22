export interface ThemeColorTokens {
  primary: string;
  primaryHover: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  accentAmber: string;
  accentAmberSubtle?: string;
  favorite?: string;
  favoriteSubtle?: string;
  favoriteBorder?: string;
  bg?: string;
  surfaceLow?: string;
  surfaceContainer?: string;
  surface?: string;
  border?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  previewLight: string; // Swatch primary light
  previewDark: string;  // Swatch primary dark
  previewBg: string;    // Swatch tom de papel / fundo
  light: ThemeColorTokens;
  dark: ThemeColorTokens;
}

export interface SlackThemeTokens {
  primary: string;     // Slot 1: Navegação & Ações Principais
  accent: string;      // Slot 2: Destaques & Prioridade
  favorite: string;    // Slot 3: Favoritos & Ícone de Coração
  background: string;  // Slot 4: Fundo da Página (Modo Claro)
  gradient?: boolean;  // Checkbox opcional de gradiente suave
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'salvia',
    name: 'Sálvia & Floresta',
    description: 'Verde botânico natural e acolhedor (Padrão)',
    previewLight: '#2D5940',
    previewDark: '#52C27E',
    previewBg: '#F2F7F3',
    light: {
      primary: '#2D5940',
      primaryHover: '#22452F',
      primaryContainer: '#EDF5EE',
      onPrimaryContainer: '#1A3D26',
      accentAmber: '#B45309',
      bg: '#F2F7F3',
      surfaceLow: '#E7EFE8',
      surfaceContainer: '#DEE8DF',
      surface: '#FFFFFF',
      border: '#D1DDD2',
    },
    dark: {
      primary: '#52C27E',
      primaryHover: '#45B36F',
      primaryContainer: '#1B3320',
      onPrimaryContainer: '#A8EFCA',
      accentAmber: '#F59E0B',
      bg: '#0F1612',
      surfaceLow: '#151E19',
      surfaceContainer: '#1B2620',
      surface: '#18221D',
      border: '#28382F',
    },
  },
  {
    id: 'terracota',
    name: 'Terracota & Argila',
    description: 'Tons quentes de cerâmica, canela e aconchego',
    previewLight: '#9C4124',
    previewDark: '#E07A5F',
    previewBg: '#FAF2ED',
    light: {
      primary: '#9C4124',
      primaryHover: '#7F321A',
      primaryContainer: '#FAEDE8',
      onPrimaryContainer: '#5C200E',
      accentAmber: '#D97706',
      bg: '#FAF2ED',
      surfaceLow: '#F4E5DC',
      surfaceContainer: '#EDD8CC',
      surface: '#FFFFFF',
      border: '#E2C7B7',
    },
    dark: {
      primary: '#E07A5F',
      primaryHover: '#CC674C',
      primaryContainer: '#3A1E16',
      onPrimaryContainer: '#FAD9CF',
      accentAmber: '#FBBF24',
      bg: '#18110D',
      surfaceLow: '#201612',
      surfaceContainer: '#291C17',
      surface: '#241914',
      border: '#3D2A22',
    },
  },
  {
    id: 'lavanda',
    name: 'Lavanda & Ameixa',
    description: 'Roxo aveludado, sereno e artístico',
    previewLight: '#6D3B7A',
    previewDark: '#B87BCC',
    previewBg: '#F7F2FA',
    light: {
      primary: '#6D3B7A',
      primaryHover: '#572C63',
      primaryContainer: '#F5ECF7',
      onPrimaryContainer: '#431C4D',
      accentAmber: '#B45309',
      bg: '#F7F2FA',
      surfaceLow: '#EFE5F5',
      surfaceContainer: '#E5D6EC',
      surface: '#FFFFFF',
      border: '#D8C3E2',
    },
    dark: {
      primary: '#B87BCC',
      primaryHover: '#A467B8',
      primaryContainer: '#301A36',
      onPrimaryContainer: '#F0D5FA',
      accentAmber: '#F59E0B',
      bg: '#150E1A',
      surfaceLow: '#1C0E22',
      surfaceContainer: '#25192E',
      surface: '#201528',
      border: '#392647',
    },
  },
  {
    id: 'oceano',
    name: 'Azul Petróleo & Marinho',
    description: 'Azul profundo e elegante como o oceano',
    previewLight: '#1B4965',
    previewDark: '#5FA8D3',
    previewBg: '#EFF5F9',
    light: {
      primary: '#1B4965',
      primaryHover: '#13384F',
      primaryContainer: '#EAF2F7',
      onPrimaryContainer: '#0C2B3D',
      accentAmber: '#D97706',
      bg: '#EFF5F9',
      surfaceLow: '#E0EDF4',
      surfaceContainer: '#D1E3ED',
      surface: '#FFFFFF',
      border: '#BDD4E2',
    },
    dark: {
      primary: '#5FA8D3',
      primaryHover: '#4E94BE',
      primaryContainer: '#142733',
      onPrimaryContainer: '#CAE9F7',
      accentAmber: '#FBBF24',
      bg: '#0C131A',
      surfaceLow: '#121A22',
      surfaceContainer: '#19232E',
      surface: '#151E28',
      border: '#243343',
    },
  },
  {
    id: 'blush',
    name: 'Rosa Antigo & Carmim',
    description: 'Rosa empoeirado, romântico e delicado',
    previewLight: '#9E3B5A',
    previewDark: '#E27396',
    previewBg: '#FCF1F4',
    light: {
      primary: '#9E3B5A',
      primaryHover: '#822B45',
      primaryContainer: '#FAECF0',
      onPrimaryContainer: '#5C1B2E',
      accentAmber: '#B45309',
      bg: '#FCF1F4',
      surfaceLow: '#F8E3E9',
      surfaceContainer: '#F2D3DC',
      surface: '#FFFFFF',
      border: '#E8BCC8',
    },
    dark: {
      primary: '#E27396',
      primaryHover: '#D15E83',
      primaryContainer: '#3A1923',
      onPrimaryContainer: '#FCD7E3',
      accentAmber: '#F59E0B',
      bg: '#180E13',
      surfaceLow: '#21131A',
      surfaceContainer: '#2B1922',
      surface: '#25151D',
      border: '#3D2230',
    },
  },
  {
    id: 'cafe',
    name: 'Café & Caramelo',
    description: 'Tons acolhedores de café, livros e baunilha',
    previewLight: '#6B4A2F',
    previewDark: '#D4A373',
    previewBg: '#F8F3ED',
    light: {
      primary: '#6B4A2F',
      primaryHover: '#543820',
      primaryContainer: '#F7EFE9',
      onPrimaryContainer: '#3E2714',
      accentAmber: '#D97706',
      bg: '#F8F3ED',
      surfaceLow: '#EFE4D8',
      surfaceContainer: '#E5D5C4',
      surface: '#FFFFFF',
      border: '#D6C0AB',
    },
    dark: {
      primary: '#D4A373',
      primaryHover: '#C29060',
      primaryContainer: '#332316',
      onPrimaryContainer: '#F5DEC9',
      accentAmber: '#FBBF24',
      bg: '#17120D',
      surfaceLow: '#1E1712',
      surfaceContainer: '#281F18',
      surface: '#221A14',
      border: '#3B2D23',
    },
  },
  {
    id: 'esmeralda',
    name: 'Esmeralda & Jade',
    description: 'Luxo botânico refinado, sofisticação e frescor vivo',
    previewLight: '#065F46',
    previewDark: '#34D399',
    previewBg: '#ECF7F2',
    light: {
      primary: '#065F46',
      primaryHover: '#044E3A',
      primaryContainer: '#E6F4EA',
      onPrimaryContainer: '#022C22',
      accentAmber: '#D97706',
      bg: '#ECF7F2',
      surfaceLow: '#DEEFE6',
      surfaceContainer: '#CDE5DA',
      surface: '#FFFFFF',
      border: '#B6D7C8',
    },
    dark: {
      primary: '#34D399',
      primaryHover: '#10B981',
      primaryContainer: '#063D2E',
      onPrimaryContainer: '#A7F3D0',
      accentAmber: '#FBBF24',
      bg: '#081510',
      surfaceLow: '#0E1E17',
      surfaceContainer: '#152920',
      surface: '#11221A',
      border: '#1F3C2F',
    },
  },
  {
    id: 'ocre',
    name: 'Ocre Solar & Mostarda',
    description: 'Calor do sol, criatividade radiante e otimismo',
    previewLight: '#B45309',
    previewDark: '#FBBF24',
    previewBg: '#FCF7E8',
    light: {
      primary: '#B45309',
      primaryHover: '#92400E',
      primaryContainer: '#FEF3C7',
      onPrimaryContainer: '#78350F',
      accentAmber: '#0284C7',
      bg: '#FCF7E8',
      surfaceLow: '#F7EDD0',
      surfaceContainer: '#EFE0B6',
      surface: '#FFFFFF',
      border: '#DEC896',
    },
    dark: {
      primary: '#FBBF24',
      primaryHover: '#F59E0B',
      primaryContainer: '#451A03',
      onPrimaryContainer: '#FDE68A',
      accentAmber: '#38BDF8',
      bg: '#171206',
      surfaceLow: '#211A0B',
      surfaceContainer: '#2B220F',
      surface: '#251D0D',
      border: '#3D3117',
    },
  },
  {
    id: 'menta',
    name: 'Menta Fresca & Alecrim',
    description: 'Jovialidade límpida, frescor herbáceo e renovação',
    previewLight: '#15803D',
    previewDark: '#4ADE80',
    previewBg: '#EBF9F0',
    light: {
      primary: '#15803D',
      primaryHover: '#166534',
      primaryContainer: '#DCFCE7',
      onPrimaryContainer: '#14532D',
      accentAmber: '#EA580C',
      bg: '#EBF9F0',
      surfaceLow: '#DCF3E3',
      surfaceContainer: '#CAEBD4',
      surface: '#FFFFFF',
      border: '#B2DFC0',
    },
    dark: {
      primary: '#4ADE80',
      primaryHover: '#22C55E',
      primaryContainer: '#144222',
      onPrimaryContainer: '#BBF7D0',
      accentAmber: '#FB923C',
      bg: '#08170D',
      surfaceLow: '#0E2013',
      surfaceContainer: '#152B1B',
      surface: '#112417',
      border: '#1F3F28',
    },
  },
  {
    id: 'ameixa',
    name: 'Ameixa Noturna & Violeta',
    description: 'Mistério poético, nobreza profunda e presença teatral',
    previewLight: '#581C87',
    previewDark: '#C084FC',
    previewBg: '#F7F0FA',
    light: {
      primary: '#581C87',
      primaryHover: '#4A1476',
      primaryContainer: '#F3E8FF',
      onPrimaryContainer: '#3B0764',
      accentAmber: '#D97706',
      bg: '#F7F0FA',
      surfaceLow: '#EFE0F6',
      surfaceContainer: '#E3CCEF',
      surface: '#FFFFFF',
      border: '#D0B2E2',
    },
    dark: {
      primary: '#C084FC',
      primaryHover: '#A855F7',
      primaryContainer: '#2E1065',
      onPrimaryContainer: '#E9D5FF',
      accentAmber: '#FBBF24',
      bg: '#14081A',
      surfaceLow: '#1C0D24',
      surfaceContainer: '#261330',
      surface: '#200F29',
      border: '#381C48',
    },
  },
  {
    id: 'sakura',
    name: 'Sakura & Cerejeira',
    description: 'Ternura e celebração, inspirada nas flores de primavera',
    previewLight: '#BE185D',
    previewDark: '#F472B6',
    previewBg: '#FCF0F6',
    light: {
      primary: '#BE185D',
      primaryHover: '#9D174D',
      primaryContainer: '#FCE7F3',
      onPrimaryContainer: '#831843',
      accentAmber: '#B45309',
      bg: '#FCF0F6',
      surfaceLow: '#F8E0EE',
      surfaceContainer: '#F2CDE3',
      surface: '#FFFFFF',
      border: '#E7B4D2',
    },
    dark: {
      primary: '#F472B6',
      primaryHover: '#EC4899',
      primaryContainer: '#500724',
      onPrimaryContainer: '#FBCFE8',
      accentAmber: '#F59E0B',
      bg: '#180812',
      surfaceLow: '#220D1B',
      surfaceContainer: '#2D1224',
      surface: '#260F1E',
      border: '#3E1932',
    },
  },
  {
    id: 'grafite',
    name: 'Grafite & Minimalista',
    description: 'Estética nórdica contemporânea, equilíbrio neutro e foco',
    previewLight: '#334155',
    previewDark: '#94A3B8',
    previewBg: '#F1F5F9',
    light: {
      primary: '#334155',
      primaryHover: '#1E293B',
      primaryContainer: '#F1F5F9',
      onPrimaryContainer: '#0F172A',
      accentAmber: '#D97706',
      bg: '#F1F5F9',
      surfaceLow: '#E2E8F0',
      surfaceContainer: '#CBD5E1',
      surface: '#FFFFFF',
      border: '#94A3B8',
    },
    dark: {
      primary: '#94A3B8',
      primaryHover: '#CBD5E1',
      primaryContainer: '#1E293B',
      onPrimaryContainer: '#F8FAFC',
      accentAmber: '#FBBF24',
      bg: '#0F172A',
      surfaceLow: '#152033',
      surfaceContainer: '#1E293B',
      surface: '#1A2436',
      border: '#334155',
    },
  },
];

// Hex to HSL color calculation
export function hexToHsl(hex: string): [number, number, number] {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Normalizes 3 or 6 digit hex to #RRGGBB uppercase
export function normalizeHex(raw: string, fallback = '#2D5940'): string {
  let clean = raw.trim().replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean)) {
    return fallback.toUpperCase();
  }
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  return ('#' + clean).toUpperCase();
}

// Format Slack string: "slack:#HEX1,#HEX2,#HEX3,#HEX4" (with optional :grad)
export function formatSlackTheme(tokens: SlackThemeTokens): string {
  const p = normalizeHex(tokens.primary, '#2D5940');
  const a = normalizeHex(tokens.accent, '#B45309');
  const f = normalizeHex(tokens.favorite, '#E11D48');
  const b = normalizeHex(tokens.background, '#FAF7F2');
  return `slack:${p},${a},${f},${b}${tokens.gradient ? ':grad' : ''}`;
}

// Parses string like "slack:#2D5940,#B45309,#E11D48,#FAF7F2" or raw "#2D5940,#B45309,#E11D48,#FAF7F2"
export function parseSlackTheme(themeStr?: string): SlackThemeTokens | null {
  if (!themeStr) return null;
  const hasGrad = themeStr.includes(':grad');
  let clean = themeStr.replace(/^slack:/, '').replace(/:grad$/, '').trim();

  // Support comma or space separation
  const parts = clean.split(/[,|\s]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 4) {
    return {
      primary: normalizeHex(parts[0], '#2D5940'),
      accent: normalizeHex(parts[1], '#B45309'),
      favorite: normalizeHex(parts[2], '#E11D48'),
      background: normalizeHex(parts[3], '#FAF7F2'),
      gradient: hasGrad,
    };
  }
  if (parts.length === 1 && /^#?[0-9A-Fa-f]{6}$/.test(parts[0])) {
    // Single hex legacy
    const p = normalizeHex(parts[0]);
    return {
      primary: p,
      accent: '#B45309',
      favorite: '#E11D48',
      background: '#FAF7F2',
      gradient: hasGrad,
    };
  }
  return null;
}

// Derives a complete ThemePreset from 4 Slack tokens
export function generateSlackCustomTheme(tokens: SlackThemeTokens): ThemePreset {
  const [ph, ps, pl] = hexToHsl(tokens.primary);
  const [ah, as] = hexToHsl(tokens.accent);
  const [fh, fs] = hexToHsl(tokens.favorite);
  const [bh, bs] = hexToHsl(tokens.background);

  const formattedId = formatSlackTheme(tokens);

  // Derive dark background with same hue temperature but dark slate/charcoal luminance
  const darkBg = hslToHex(bh, Math.min(bs * 0.5, 20), 8);
  const darkSurfaceLow = hslToHex(bh, Math.min(bs * 0.5, 20), 10);
  const darkSurface = hslToHex(bh, Math.min(bs * 0.5, 20), 12);
  const darkSurfaceContainer = hslToHex(bh, Math.min(bs * 0.5, 20), 15);

  return {
    id: formattedId,
    name: 'Tema Personalizado',
    description: `Personalizado (${tokens.primary}, ${tokens.accent})`,
    previewLight: tokens.primary,
    previewDark: hslToHex(ph, Math.min(ps, 75), 65),
    previewBg: tokens.background,
    light: {
      primary: tokens.primary,
      primaryHover: hslToHex(ph, Math.min(ps + 5, 100), Math.max(pl - 10, 15)),
      primaryContainer: hslToHex(ph, Math.min(ps * 0.4, 30), 94),
      onPrimaryContainer: hslToHex(ph, Math.min(ps + 10, 80), 20),
      accentAmber: tokens.accent,
      accentAmberSubtle: hslToHex(ah, Math.min(as * 0.3, 40), 95),
      favorite: tokens.favorite,
      favoriteSubtle: hslToHex(fh, Math.min(fs * 0.3, 30), 96),
      favoriteBorder: hslToHex(fh, Math.min(fs * 0.5, 50), 88),
      bg: tokens.background,
      surfaceLow: hslToHex(bh, Math.min(bs * 0.4, 25), 96),
      surface: '#FFFFFF',
      surfaceContainer: hslToHex(bh, Math.min(bs * 0.4, 30), 93),
    },
    dark: {
      primary: hslToHex(ph, Math.min(ps, 75), 65),
      primaryHover: hslToHex(ph, Math.min(ps, 80), 58),
      primaryContainer: hslToHex(ph, Math.min(ps * 0.6, 40), 18),
      onPrimaryContainer: hslToHex(ph, Math.min(ps * 0.5, 30), 88),
      accentAmber: hslToHex(ah, Math.min(as, 85), 62),
      accentAmberSubtle: hslToHex(ah, Math.min(as * 0.5, 40), 20),
      favorite: hslToHex(fh, Math.min(fs, 85), 68),
      favoriteSubtle: hslToHex(fh, Math.min(fs * 0.4, 30), 18),
      favoriteBorder: hslToHex(fh, Math.min(fs * 0.6, 50), 32),
      bg: darkBg,
      surfaceLow: darkSurfaceLow,
      surface: darkSurface,
      surfaceContainer: darkSurfaceContainer,
    },
  };
}

// Single-hex backward compatibility generator
export function generateCustomTheme(hex: string): ThemePreset {
  return generateSlackCustomTheme({
    primary: hex,
    accent: '#B45309',
    favorite: '#E11D48',
    background: '#FAF7F2',
    gradient: false,
  });
}

// Curated harmonic palettes for "✨ Surpreenda-me"
const HARMONIC_PALETTES: SlackThemeTokens[] = [
  { primary: '#2D5940', accent: '#D97706', favorite: '#E11D48', background: '#FAF7F2', gradient: false },
  { primary: '#065F46', accent: '#F59E0B', favorite: '#EC4899', background: '#F0FDF4', gradient: true },
  { primary: '#0284C7', accent: '#F59E0B', favorite: '#F43F5E', background: '#F0F9FF', gradient: true },
  { primary: '#6D28D9', accent: '#D97706', favorite: '#F43F5E', background: '#F5F3FF', gradient: false },
  { primary: '#BE185D', accent: '#D97706', favorite: '#E11D48', background: '#FDF2F8', gradient: true },
  { primary: '#9C4124', accent: '#D97706', favorite: '#E11D48', background: '#FAF5F0', gradient: true },
  { primary: '#5A3E2B', accent: '#D97706', favorite: '#BE185D', background: '#FAF7F4', gradient: false },
  { primary: '#0D9488', accent: '#EA580C', favorite: '#E11D48', background: '#F0FDFA', gradient: true },
  { primary: '#B45309', accent: '#0284C7', favorite: '#E11D48', background: '#FFFBEB', gradient: false },
  { primary: '#166534', accent: '#CA8A04', favorite: '#DC2626', background: '#F2F8F4', gradient: true },
  { primary: '#4A044E', accent: '#D97706', favorite: '#F43F5E', background: '#FDF4FF', gradient: false },
  { primary: '#334155', accent: '#D97706', favorite: '#E11D48', background: '#F8FAFC', gradient: true },
  { primary: '#3730A3', accent: '#EA580C', favorite: '#E11D48', background: '#EEF2FF', gradient: true },
  { primary: '#1E3A8A', accent: '#F59E0B', favorite: '#F43F5E', background: '#EFF6FF', gradient: false },
  { primary: '#854D0E', accent: '#0284C7', favorite: '#E11D48', background: '#FEFCE8', gradient: true },
];

// Generates a surprise harmonious palette
export function generateHarmonicTheme(): SlackThemeTokens {
  const randomIndex = Math.floor(Math.random() * HARMONIC_PALETTES.length);
  return { ...HARMONIC_PALETTES[randomIndex] };
}

// Display mode preference: 'auto' (visitor OS), 'dark' (fixed dark), 'light' (fixed light)
export type ThemeDisplayMode = 'auto' | 'dark' | 'light';

export function getThemeDisplayMode(themeStr?: string): ThemeDisplayMode {
  if (!themeStr) return 'auto';
  if (themeStr.includes(':mode-dark')) return 'dark';
  if (themeStr.includes(':mode-light')) return 'light';
  return 'auto';
}

export function setThemeDisplayMode(themeStr: string, mode: ThemeDisplayMode): string {
  const stripped = stripThemeDisplayMode(themeStr);
  if (mode === 'dark') return `${stripped}:mode-dark`;
  if (mode === 'light') return `${stripped}:mode-light`;
  return stripped;
}

export function stripThemeDisplayMode(themeStr?: string): string {
  if (!themeStr) return 'salvia';
  return themeStr
    .replace(/:mode-dark/g, '')
    .replace(/:mode-light/g, '')
    .replace(/:mode-auto/g, '');
}

export function getThemePreset(themeIdOrCustom?: string): ThemePreset {
  if (!themeIdOrCustom) {
    return THEME_PRESETS[0];
  }
  const cleanId = stripThemeDisplayMode(themeIdOrCustom);

  // Slack format: slack:#HEX1,#HEX2,#HEX3,#HEX4 or raw comma-separated hex list
  const slackTokens = parseSlackTheme(cleanId);
  if (slackTokens) {
    return generateSlackCustomTheme(slackTokens);
  }

  // Single hex legacy (custom:#HEX)
  if (cleanId.startsWith('custom:') || cleanId.startsWith('#')) {
    const hex = cleanId.replace(/^custom:/, '');
    if (/^#[0-9A-Fa-f]{3,6}$/.test(hex)) {
      return generateCustomTheme(hex);
    }
  }

  const found = THEME_PRESETS.find((p) => p.id === cleanId);
  return found || THEME_PRESETS[0];
}

// Injects dynamic CSS variables into document.documentElement based on active theme
export function applyTheme(themeIdOrCustom?: string) {
  const preset = getThemePreset(themeIdOrCustom);

  let styleEl = document.getElementById('dynamic-theme-vars') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-vars';
    document.head.appendChild(styleEl);
  }

  const hasGradient = Boolean(themeIdOrCustom && themeIdOrCustom.includes(':grad'));

  styleEl.textContent = `
    :root {
      --color-primary: ${preset.light.primary};
      --color-primary-hover: ${preset.light.primaryHover};
      --color-primary-container: ${preset.light.primaryContainer};
      --color-on-primary-container: ${preset.light.onPrimaryContainer};
      --color-accent-amber: ${preset.light.accentAmber};
      ${preset.light.accentAmberSubtle ? `--color-accent-amber-subtle: ${preset.light.accentAmberSubtle};` : ''}
      ${preset.light.favorite ? `--color-favorite: ${preset.light.favorite};` : ''}
      ${preset.light.favoriteSubtle ? `--color-favorite-subtle: ${preset.light.favoriteSubtle};` : ''}
      ${preset.light.favoriteBorder ? `--color-favorite-border: ${preset.light.favoriteBorder};` : ''}
      ${preset.light.bg ? `--color-bg: ${preset.light.bg};` : ''}
      ${preset.light.surfaceLow ? `--color-surface-low: ${preset.light.surfaceLow};` : ''}
      ${preset.light.surfaceContainer ? `--color-surface-container: ${preset.light.surfaceContainer};` : ''}
      ${preset.light.surface ? `--color-surface: ${preset.light.surface};` : ''}
      ${preset.light.border ? `--color-border: ${preset.light.border};` : ''}
    }
    .dark {
      --color-primary: ${preset.dark.primary};
      --color-primary-hover: ${preset.dark.primaryHover};
      --color-primary-container: ${preset.dark.primaryContainer};
      --color-on-primary-container: ${preset.dark.onPrimaryContainer};
      --color-accent-amber: ${preset.dark.accentAmber};
      ${preset.dark.accentAmberSubtle ? `--color-accent-amber-subtle: ${preset.dark.accentAmberSubtle};` : ''}
      ${preset.dark.favorite ? `--color-favorite: ${preset.dark.favorite};` : ''}
      ${preset.dark.favoriteSubtle ? `--color-favorite-subtle: ${preset.dark.favoriteSubtle};` : ''}
      ${preset.dark.favoriteBorder ? `--color-favorite-border: ${preset.dark.favoriteBorder};` : ''}
      ${preset.dark.bg ? `--color-bg: ${preset.dark.bg};` : ''}
      ${preset.dark.surfaceLow ? `--color-surface-low: ${preset.dark.surfaceLow};` : ''}
      ${preset.dark.surfaceContainer ? `--color-surface-container: ${preset.dark.surfaceContainer};` : ''}
      ${preset.dark.surface ? `--color-surface: ${preset.dark.surface};` : ''}
      ${preset.dark.border ? `--color-border: ${preset.dark.border};` : ''}
    }
    ${hasGradient ? `
      .theme-header-gradient {
        background: linear-gradient(180deg, var(--color-primary-container) 0%, transparent 100%) !important;
      }
    ` : `
      .theme-header-gradient {
        background: transparent !important;
      }
    `}
  `;
}
