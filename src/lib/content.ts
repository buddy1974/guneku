import 'server-only';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(), 'src', 'data');

function read<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf-8')) as T;
}

function readDir<T>(dir: string): T[] {
  const dirPath = path.join(DATA, dir);
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf-8')) as T);
}

function readBySlug<T>(dir: string, slug: string): T | null {
  const filePath = path.join(DATA, dir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SiteConfig {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  palacePhone: string;
  socialLinks: Record<string, string>;
  fonEmail: string;
  copyright: { text: string; builtBy: string; builtByUrl: string };
  coordinates: { lat: number; lng: number };
  youtubeChannelId: string;
  anthropicModel: string;
  aiPersonality: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface Navigation {
  mainNav: NavItem[];
}

export interface ContentArticle {
  id: string;
  type: string;
  title: string;
  slug: string;
  section: string;
  order?: number;
  publishedAt: string | null;
  metaDescription: string | null;
  body: string;
  youtubeEmbeds: string[];
  images: string[];
  featuredImage: string | null;
}

export interface KingdomArticle extends ContentArticle {
  type: 'KingdomArticle';
}

export interface PalaceArticle extends ContentArticle {
  type: 'PalaceArticle';
  era: 'legacy' | 'current';
}

export interface Update {
  id: string;
  type: 'Update';
  joomlaId: number;
  title: string;
  slug: string;
  publishedAt: string | null;
  excerpt: string;
  body: string;
  featuredImage: string | null;
  images: string[];
  youtubeEmbeds: string[];
}

export interface StaticPage extends ContentArticle {
  type: 'StaticPage';
}

export interface GalleryImage {
  id: string;
  filename: string;
  caption: string | null;
  title: string | null;
  ftpPath: string;
  publicPath: string;
  width: number | null;
  height: number | null;
  isMainImage: boolean;
  downloadStatus: string;
}

export interface GalleryAlbum {
  id: string;
  joomlaFolder: string;
  title: string;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  imageCount: number;
  images: GalleryImage[];
}

export interface ImageGallery {
  id: string;
  type: 'ImageGallery';
  albums: GalleryAlbum[];
}

export interface VideoGallery {
  id: string;
  type: 'VideoGallery';
  youtubeChannelId: string;
  featuredVideoId: string;
  dbVideos: unknown[];
  youtubeApiStatus: string;
  allVideos: unknown[];
}

export interface NotableProfile {
  id: string;
  type: 'NotableProfile';
  name: string;
  slug: string;
  origin: string;
  location: string;
  title: string;
  bio: string;
  connectionToGuneku: string;
  [key: string]: unknown;
}

export interface Institution {
  id: string;
  name: string;
  abbreviation: string;
  status: string;
  description?: string;
  [key: string]: unknown;
}

export interface FonProfile {
  id: string;
  type: 'FonProfile';
  fullName: string;
  title: string;
  fonNumber: string;
  residenceCity: string;
  residenceCountry: string;
  personalWebsite: string;
  fonEmail: string;
  practiceWebsite: string;
  education: unknown[];
  career: unknown[];
  professionalMemberships: unknown[];
  initiatives: unknown[];
  enthronementNarrative: string;
  governanceStyle: string;
  [key: string]: unknown;
}

// ─── Reader Functions ───────────────────────────────────────────────────────

export function getSiteConfig(): SiteConfig {
  return read<SiteConfig>('site-config.json');
}

export function getNavigation(): Navigation {
  return read<Navigation>('navigation.json');
}

export function getAllKingdomArticles(): KingdomArticle[] {
  return readDir<KingdomArticle>('kingdom');
}

export function getKingdomArticle(slug: string): KingdomArticle | null {
  return readBySlug<KingdomArticle>('kingdom', slug);
}

export function getAllPalaceArticles(): PalaceArticle[] {
  return readDir<PalaceArticle>('palace').filter(
    a => a.type === 'PalaceArticle'
  );
}

export function getPalaceArticle(slug: string): PalaceArticle | null {
  return readBySlug<PalaceArticle>('palace', slug);
}

export function getFonProfile(): FonProfile | null {
  return readBySlug<FonProfile>('palace', 'fon-walters-profile');
}

export function getAllUpdates(): Update[] {
  return readDir<Update>('updates').sort((a, b) => {
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function getUpdate(slug: string): Update | null {
  return readBySlug<Update>('updates', slug);
}

export function getAllPages(): StaticPage[] {
  return readDir<StaticPage>('pages');
}

export function getPage(slug: string): StaticPage | null {
  return readBySlug<StaticPage>('pages', slug);
}

export function getImageGallery(): ImageGallery {
  return read<ImageGallery>('gallery/image-gallery.json');
}

export function getVideoGallery(): VideoGallery {
  return read<VideoGallery>('gallery/video-gallery.json');
}

export function getAllNotables(): NotableProfile[] {
  return readDir<NotableProfile>('notables');
}

export function getNotable(slug: string): NotableProfile | null {
  return readBySlug<NotableProfile>('notables', slug);
}

export function getAllInstitutions(): Institution[] {
  return readDir<Institution>('institutions');
}

export function getInstitution(id: string): Institution | null {
  return readBySlug<Institution>('institutions', id);
}
