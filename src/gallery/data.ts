// Galeri içeriği ve kat planı — tüm metin/link/proje düzenlemeleri buradan yapılır.
// İçerik kaynağı: Melik Bağrıyanık CV (2026).
//
// KAT PLANI (üstten görünüm, + eksenler):
//
//                 z = -20
//        ┌───────────────────┐
//        │  TEKNOLOJİ SALONU │            x: -7..7, z: -20..-6
//        └────────┤ ├────────┘  ← kapı (x: -2..2, z=-6)
//   ┌─────────────┴─┴───────────────┐
//   │ KARİYER │  ANA SALON │ PROJE  │   kanatlar: x: ±7..±19, z: -6..10
//   │ KANADI ═╡            ╞═GALERİSİ│  ← kapılar (z: 0.5..3.5, x=±7)
//   └─────────────┤ ├───────────────┘
//                 │ │  ← kapı (x: -2..2, z=10)
//            ┌────┴─┴────┐
//            │ GİRİŞ HOLÜ │              x: -4..4, z: 10..20
//            └───────────┘
//                 z = 20  (başlangıç: z=17)

export const ROOM = {
  height: 5.2,
  eyeHeight: 1.7,
} as const;

export const SPAWN = { x: 0, z: 17 } as const;

// ---------------------------------------------------------------------------
// Duvarlar ve çarpışma
// ---------------------------------------------------------------------------

export interface WallSegment {
  /** merkez x, merkez z */
  cx: number;
  cz: number;
  /** uzunluk (axis yönünde) */
  len: number;
  /** 'x': duvar x ekseni boyunca uzanır; 'z': z ekseni boyunca */
  axis: 'x' | 'z';
}

export const WALL_THICKNESS = 0.3;
export const DOOR_HEIGHT = 3.2;

/** Katı duvar parçaları (çarpışmaya dahil) */
export const WALLS: WallSegment[] = [
  // Giriş holü
  { cx: 0, cz: 20, len: 8, axis: 'x' },
  { cx: 4, cz: 15, len: 10, axis: 'z' },
  { cx: -4, cz: 15, len: 10, axis: 'z' },
  // Ana salon — güney (giriş kapılı)
  { cx: -4.5, cz: 10, len: 5, axis: 'x' },
  { cx: 4.5, cz: 10, len: 5, axis: 'x' },
  // Ana salon — batı (Kariyer kapısı z: 0.5..3.5)
  { cx: -7, cz: -2.75, len: 6.5, axis: 'z' },
  { cx: -7, cz: 6.75, len: 6.5, axis: 'z' },
  // Ana salon — doğu (Proje kapısı)
  { cx: 7, cz: -2.75, len: 6.5, axis: 'z' },
  { cx: 7, cz: 6.75, len: 6.5, axis: 'z' },
  // Ana salon — kuzey (Teknoloji kapılı)
  { cx: -4.5, cz: -6, len: 5, axis: 'x' },
  { cx: 4.5, cz: -6, len: 5, axis: 'x' },
  // Batı kanadı
  { cx: -13, cz: -6, len: 12, axis: 'x' },
  { cx: -13, cz: 10, len: 12, axis: 'x' },
  { cx: -19, cz: 2, len: 16, axis: 'z' },
  // Doğu kanadı
  { cx: 13, cz: -6, len: 12, axis: 'x' },
  { cx: 13, cz: 10, len: 12, axis: 'x' },
  { cx: 19, cz: 2, len: 16, axis: 'z' },
  // Teknoloji salonu
  { cx: 0, cz: -20, len: 14, axis: 'x' },
  { cx: -7, cz: -13, len: 14, axis: 'z' },
  { cx: 7, cz: -13, len: 14, axis: 'z' },
];

/** Kapı lentoları (görsel; çarpışmaya dahil DEĞİL — altından geçilir) */
export const LINTELS: WallSegment[] = [
  { cx: 0, cz: 10, len: 4, axis: 'x' },
  { cx: 0, cz: -6, len: 4, axis: 'x' },
  { cx: -7, cz: 2, len: 3, axis: 'z' },
  { cx: 7, cz: 2, len: 3, axis: 'z' },
];

export interface Collider {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
}

export const PEDESTAL_HALF = 0.55;

function wallCollider(w: WallSegment): Collider {
  const half = WALL_THICKNESS / 2;
  return w.axis === 'x'
    ? { cx: w.cx, cz: w.cz, hx: w.len / 2, hz: half }
    : { cx: w.cx, cz: w.cz, hx: half, hz: w.len / 2 };
}

// ---------------------------------------------------------------------------
// Yerleşim yardımcıları
// ---------------------------------------------------------------------------

export interface WallPlacement {
  position: [number, number, number];
  rotationY: number;
  normal: [number, number, number];
  width: number;
  height: number;
}

const EPS = 0.17; // duvar yüzeyinden öne çıkma (duvar yarı kalınlığı 0.15 + 2cm)

/** +z'ye bakan duvar yüzü (kuzey duvarların iç yüzü) */
const faceSouth = (x: number, z: number, w: number, h: number, y = 2.25): WallPlacement => ({
  position: [x, y, z + EPS],
  rotationY: 0,
  normal: [0, 0, 1],
  width: w,
  height: h,
});
/** -z'ye bakan duvar yüzü */
const faceNorth = (x: number, z: number, w: number, h: number, y = 2.25): WallPlacement => ({
  position: [x, y, z - EPS],
  rotationY: Math.PI,
  normal: [0, 0, -1],
  width: w,
  height: h,
});
/** +x'e bakan duvar yüzü */
const faceEast = (x: number, z: number, w: number, h: number, y = 2.25): WallPlacement => ({
  position: [x + EPS, y, z],
  rotationY: Math.PI / 2,
  normal: [1, 0, 0],
  width: w,
  height: h,
});
/** -x'e bakan duvar yüzü */
const faceWest = (x: number, z: number, w: number, h: number, y = 2.25): WallPlacement => ({
  position: [x - EPS, y, z],
  rotationY: -Math.PI / 2,
  normal: [-1, 0, 0],
  width: w,
  height: h,
});

// ---------------------------------------------------------------------------
// Projeler (tablolar)
// ---------------------------------------------------------------------------

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  /** public/ altındaki ekran görüntüsü; yoksa prosedürel poster üretilir */
  image?: string;
  accent: string;
  live?: string;
  github?: string;
  /** Mobil uygulama mağaza bağlantıları */
  playStore?: string;
  appStore?: string;
  /** Kurumsal projelerde link yerine gösterilecek not */
  note?: string;
  year: string;
}

export interface PaintingEntry {
  project: ProjectEntry;
  placement: WallPlacement;
}

const GITHUB = 'https://github.com/melik-bagriyanik';
const CORPORATE_NOTE = 'Kurumsal proje — kaynak kodu ve canlı ortam gizlilik kapsamında.';

/**
 * Ana Salon — sanatçı portresi (Teknoloji kapısının solu).
 * Tıklanınca Hakkımda paneli açılır.
 */
export const PORTRAIT = {
  id: 'artist',
  image: '/profile.jpeg',
  title: 'MELİK BAĞRIYANIK',
  subtitle: 'Sanatçının Portresi · İstanbul',
  // profile.jpeg 1344×1920 → 7:10 oranı korunur
  placement: faceSouth(-4.5, -6, 1.75, 2.5, 2.35),
} as const;

export const PAINTINGS: PaintingEntry[] = [
  // ——— Doğu Kanadı: Proje Galerisi ———
  {
    project: {
      id: 'kuyumcu',
      title: 'Kuyumcu',
      subtitle: 'Canlı Fiyat Takibi · NowlSoft',
      description:
        'Finans/ticaret odaklı, canlı veri akışı ve anlık altın-döviz fiyat takibi sunan mobil kuyumcu uygulaması. Anlık fiyat gösterimi gibi kritik modülleri ilgili API’lerle entegre ettim; performans optimizasyonlarıyla akıcı bir deneyim sağladım.',
      tech: ['React Native', 'Expo', 'Canlı Veri', 'WebSocket'],
      image: '/projects/kuyumcu.jpeg',
      accent: '#b8860b',
      note: CORPORATE_NOTE,
      year: '2026',
    },
    // kuyumcu.jpeg 518×1061 → dikey telefon oranı korunur
    placement: faceSouth(10.5, -6, 1.22, 2.5),
  },
  {
    project: {
      id: 'ebelediye',
      title: 'E-Belediye',
      subtitle: 'Batman Belediyesi · Kurumsal Mobil',
      description:
        'Batman Belediyesi vatandaşlarının belediye hizmetlerine erişimini sağlayan kurumsal e-belediye mobil uygulaması. Toplu taşıma, haberler ve duyurular gibi kritik modülleri API entegrasyonlarıyla hayata geçirdim; iOS ve Android’de stabil çalışacak şekilde optimize ettim.',
      tech: ['React Native', 'Expo', 'iOS & Android', 'REST API'],
      image: '/projects/belediye.webp',
      accent: '#0d9488',
      playStore: 'https://play.google.com/store/apps/details?id=com.batmanmobileapp&hl=tr',
      appStore: 'https://apps.apple.com/tr/app/batman-belediyesi/id6755880286',
      note: 'Kurumsal proje — kaynak kodu gizlilik kapsamında.',
      year: '2025',
    },
    // belediye.webp 273×592 → dikey telefon oranı korunur
    placement: faceSouth(15.5, -6, 1.15, 2.5),
  },
  {
    project: {
      id: 'tech-news',
      title: 'Haber Sitesi',
      subtitle: 'Teknoloji Haber Platformu',
      description:
        'Next.js ile geliştirdiğim, Dev.to API’sinden anlık veri çekerek güncel teknoloji içeriklerini dinamik olarak sunan haber platformu. Hızlı gezinme ve okunabilirlik öncelikli sade bir editoryal arayüz sunar.',
      tech: ['Next.js', 'TypeScript', 'Dev.to API', 'Vercel'],
      image: '/projects/image.png',
      accent: '#2563eb',
      live: 'https://melik-news.vercel.app',
      github: `${GITHUB}/tech-news`,
      year: '2026',
    },
    // image.png 2704×1488 → yatay ekran görüntüsü oranı korunur
    placement: faceWest(19, -1, 3.0, 1.65),
  },
  {
    project: {
      id: 'pomodoro',
      title: 'Pomodoro',
      subtitle: 'Odak & Zaman Yönetimi',
      description:
        'React ile geliştirdiğim, kullanıcıların odaklanma sürelerini optimize etmelerini sağlayan modern arayüzlü Pomodoro zamanlayıcı uygulaması. Oturum akışları ve zarif geçiş animasyonlarıyla odaklanmayı keyifli hale getirir.',
      tech: ['React', 'TypeScript', 'LocalStorage'],
      image: '/projects/pomodoro.png',
      accent: '#e11d48',
      live: 'https://pomodoro-snowy-seven.vercel.app',
      github: `${GITHUB}/pomodoro`,
      year: '2025',
    },
    // pomodoro.png 2460×1530 → yatay ekran görüntüsü oranı korunur
    placement: faceWest(19, 5, 3.0, 1.87),
  },
  {
    project: {
      id: 'portfolio',
      title: 'Portfolyo',
      subtitle: 'Kişisel Web Sitesi',
      description:
        'Next.js ve Tailwind CSS ile geliştirdiğim önceki kişisel portfolyo sitem. Hakkımda, projeler, yetenekler, eğitim ve deneyim bölümlerini tek sayfalık akıcı bir deneyimde toplar.',
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      image: '/projects/portfolio.png',
      accent: '#8b5cf6',
      github: `${GITHUB}/new_portfolio`,
      year: '2024',
    },
    // portfolio.png 2552×1468 → yatay ekran görüntüsü oranı korunur
    placement: faceNorth(10.5, 10, 3.0, 1.73),
  },
  {
    project: {
      id: 'commersee',
      title: 'Commersee',
      subtitle: 'E-Ticaret Analitiği · Singularity',
      description:
        'Singularity Software bünyesinde frontend geliştirmesini yönettiğim e-ticaret analiz platformu. Markaları yükseltmek, e-ticaret satışlarını artırmak ve keşfedilmemiş pazarları keşfetmek için gelişmiş analitiğin gücünü kullanır; SEO uyumlu, yüksek performanslı bir yapıyla geliştirildi.',
      tech: ['Next.js', 'React', 'TypeScript', 'SEO'],
      image: '/projects/commersee.png',
      accent: '#a855f7',
      live: 'https://www.commersee.com/tr/',
      note: 'Kurumsal proje — kaynak kodu gizlilik kapsamında.',
      year: '2024',
    },
    // commersee.png 2772×1480 → yatay ekran görüntüsü oranı korunur
    placement: faceNorth(15.5, 10, 3.0, 1.6),
  },
];

// ---------------------------------------------------------------------------
// Teknolojiler (heykel kaideleri — Teknoloji Salonu, çember düzeni)
// ---------------------------------------------------------------------------

export type SculptureKind =
  | 'torusKnot'
  | 'icosahedron'
  | 'octahedron'
  | 'prism'
  | 'rings'
  | 'stack'
  | 'cube'
  | 'slab';

export interface TechEntry {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  sculpture: SculptureKind;
  position: [number, number, number];
  rotationY: number;
  material: 'gold' | 'stone' | 'bronze';
  /** Uzmanlık yıldızları: daha büyük kaide, altın malzeme, öne yerleşim */
  featured?: boolean;
}

/** Plaket verilen noktaya (genelde kapıya/odaya) baksın */
const faceTo = (x: number, z: number, tx: number, tz: number): number =>
  Math.atan2(tx - x, tz - z);

const TECH_DOOR = { x: 0, z: -6 };

export const TECHS: TechEntry[] = [
  // ——— Ön sıra: uzmanlık yıldızları (kapıdan girince ilk görülenler) ———
  {
    id: 'react',
    title: 'React',
    blurb:
      'En güçlü olduğum alan: bileşen mimarisi, hooks ve modern render stratejileriyle ölçeklenen, yüksek performanslı arayüzler.',
    skills: ['React.js', 'Hooks & Context', 'Reusable Components', 'SPA'],
    sculpture: 'rings',
    position: [0, 0, -10.9],
    rotationY: faceTo(0, -10.9, TECH_DOOR.x, TECH_DOOR.z),
    material: 'gold',
    featured: true,
  },
  {
    id: 'nextjs',
    title: 'Next.js',
    blurb:
      'SSR/SSG, SEO ve performans odağı: Commersee gibi üretim projelerinde Next.js ile yüksek performanslı, arama dostu yapılar kurdum.',
    skills: ['Next.js', 'SSR / SSG', 'SEO', 'Vercel'],
    sculpture: 'torusKnot',
    position: [-4.2, 0, -12.6],
    rotationY: faceTo(-4.2, -12.6, TECH_DOOR.x, TECH_DOOR.z),
    material: 'gold',
    featured: true,
  },
  {
    id: 'reactnative',
    title: 'React Native',
    blurb:
      'Native kalitesinde iOS & Android: e-belediye ve canlı finans akışlı kuyumcu uygulaması dahil üretimde çalışan mobil işler.',
    skills: ['React Native', 'Expo', 'iOS & Android', 'Flutter'],
    sculpture: 'slab',
    position: [4.2, 0, -12.6],
    rotationY: faceTo(4.2, -12.6, TECH_DOOR.x, TECH_DOOR.z),
    material: 'gold',
    featured: true,
  },

  // ——— Arka sıra: destekleyici yetenekler ———
  {
    id: 'typescript',
    title: 'TypeScript & JS',
    blurb:
      'Tip güvenliğiyle kendini belgeleyen, hatayı derleme anında yakalayan modern JavaScript kod tabanları.',
    skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
    sculpture: 'cube',
    position: [-5.0, 0, -16.4],
    rotationY: faceTo(-5.0, -16.4, 0, -13),
    material: 'stone',
  },
  {
    id: 'dotnet',
    title: '.NET & Backend',
    blurb:
      'İstemci-sunucu mimarisini bütüncül ele alan backend geliştirme: API tasarımı ve dependency injection ile katmanlı yapılar.',
    skills: ['.NET', 'Node.js', 'REST API', 'Dependency Injection'],
    sculpture: 'prism',
    position: [-1.7, 0, -17.3],
    rotationY: faceTo(-1.7, -17.3, 0, -13),
    material: 'bronze',
  },
  {
    id: 'database',
    title: 'Veri & SQL',
    blurb: 'İlişkisel modelleme ve sorgu tasarımıyla güvenilir veri katmanları.',
    skills: ['SQL', 'Firebase'],
    sculpture: 'stack',
    position: [1.7, 0, -17.3],
    rotationY: faceTo(1.7, -17.3, 0, -13),
    material: 'stone',
  },
  {
    id: 'tooling',
    title: 'Araçlar & Süreç',
    blurb:
      'SOLID ve Clean Code prensipleri, Git akışları ve Agile/Scrum ile sürdürülebilir ekip üretkenliği.',
    skills: ['Git', 'GitHub', 'Agile / Scrum', 'SOLID', 'Clean Code'],
    sculpture: 'octahedron',
    position: [5.0, 0, -16.4],
    rotationY: faceTo(5.0, -16.4, 0, -13),
    material: 'bronze',
  },
];

// ---------------------------------------------------------------------------
// Kariyer & Eğitim (Batı Kanadı duvar panoları)
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  /** Panoda ilk 3 satır çizilir; panelde tamamı listelenir */
  bullets: string[];
  tech: string[];
  placement: WallPlacement;
}

export const EXPERIENCES: ExperienceEntry[] = [
  {
    id: 'safahat',
    company: 'SafahatAI',
    role: 'Full Stack Developer',
    period: '12/2025 – Günümüz',
    location: 'İstanbul',
    bullets: [
      'UYAP ile tam entegre, yapay zeka odaklı hukuk otomasyon platformunun web uygulamasını geliştiriyorum.',
      'React.js ile şirket yönetim kadrosuna yönelik web uygulaması geliştiriyorum.',
      '.NET teknolojisiyle backend geliştirme süreçlerine destek veriyorum.',
    ],
    tech: ['React.js', '.NET', 'Yapay Zeka', 'UYAP Entegrasyonu'],
    placement: faceSouth(-15.5, -6, 2.3, 1.55, 2.3),
  },
  {
    id: 'nowlsoft',
    company: 'NowlSoft',
    role: 'Mobile Application Developer',
    period: '09/2025 – Günümüz',
    location: 'Uzaktan · Ek zamanlı',
    bullets: [
      'Batman Belediyesi için kurumsal e-belediye mobil uygulamasını hayata geçirdim.',
      'Canlı veri akışı ve anlık fiyat takibi içeren Kuyumcu uygulamasını kodladım.',
      'Toplu taşıma, haberler, duyurular ve anlık fiyat modüllerini API’lerle entegre ettim.',
      'Performans optimizasyonlarıyla uygulamaların stabil ve akıcı çalışmasını sağladım.',
    ],
    tech: ['React Native', 'Expo', 'iOS & Android'],
    placement: faceSouth(-10.5, -6, 2.3, 1.55, 2.3),
  },
  {
    id: 'singularity-fs',
    company: 'Singularity Software',
    role: 'Frontend-Oriented Full Stack Developer',
    period: '01/2023 – 12/2025',
    location: 'İstanbul',
    bullets: [
      'SOLID ve Clean Code prensipleriyle ölçeklenebilir frontend mimarileri geliştirdim.',
      'Commersee e-ticaret platformunun frontend geliştirmesini yönettim; SEO uyumlu, yüksek performanslı bir yapı tasarladım.',
      'Ranswer.ai AI destek platformunda dinamik UI yapılarını ve API entegrasyonlarını yönettim.',
      'Ranswer.ai mobil uygulamasını React Native ile web sürümüyle uyumlu geliştirdim.',
      'Agile (Scrum) süreçlerine aktif katılarak hızlı teslimatı destekledim.',
    ],
    tech: ['React.js', 'Next.js', 'React Native', 'Clean Architecture'],
    placement: faceEast(-19, -1, 2.3, 1.55, 2.3),
  },
  {
    id: 'singularity-mobile',
    company: 'Singularity Software',
    role: 'Mobile Application Developer',
    period: '10/2022 – 01/2023',
    location: 'İstanbul',
    bullets: [
      'Flutter ile mobil e-ticaret uygulaması geliştirdim.',
      'Ürün listeleme ve ürün detay modüllerini geliştirdim.',
      'Firebase Authentication ile giriş/üye olma sistemini kurdum.',
      'State management ve performans optimizasyonu uyguladım.',
    ],
    tech: ['Flutter', 'Firebase', 'iOS & Android'],
    placement: faceEast(-19, 4.5, 2.3, 1.55, 2.3),
  },
];

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  note?: string;
}

export const EDUCATION: EducationItem[] = [
  {
    school: 'Bilecik Şeyh Edebali Üniversitesi',
    degree: 'Bilgisayar Mühendisliği',
    period: '2019 – 2023',
    note: 'Not ortalaması 3.25 / 4.00',
  },
  {
    school: 'Wroclaw Ekonomi ve İşletme Üniversitesi',
    degree: 'Bilgisayar Bilimi · Erasmus+',
    period: '2021 – 2022',
    note: 'Wroclaw, Polonya',
  },
  {
    school: 'WSB Üniversitesi',
    degree: 'İngilizce Hazırlık Programı',
    period: '2024',
    note: 'B2 seviye · Poznan, Polonya',
  },
];

export const LANGUAGES = ['Türkçe — Ana dil', 'İngilizce — Orta-İleri (B2)'] as const;

export const EDUCATION_PLACEMENT: WallPlacement = faceNorth(-13, 10, 2.3, 1.55, 2.3);

// ---------------------------------------------------------------------------
// Hakkımda / İletişim / Sergi Planı panoları
// ---------------------------------------------------------------------------

export const CONTACT = {
  email: 'melik.bagriyanik0@gmail.com',
  phone: '+90 506 053 33 54',
  linkedin: 'https://www.linkedin.com/in/melik-bagriyanik',
  github: GITHUB,
  website: 'https://melik-portfolio.vercel.app',
} as const;

export const ABOUT = {
  name: 'MELİK BAĞRIYANIK',
  role: 'FULL STACK DEVELOPER',
  location: 'İstanbul, Türkiye',
  paragraph:
    'Web ve mobil uygulama geliştirme süreçlerinde geniş deneyime sahip, frontend odaklı bir Full Stack Developer’ım. React.js, Next.js ve React Native ekosistemlerinde ileri seviye uzmanlıkla; yüksek performanslı web arayüzleri ile native kalitesinde iOS ve Android uygulamaları inşa ediyorum. İstemci-sunucu mimarilerini bütüncül ele almak adına backend tarafında da .NET ve Node.js teknolojileriyle süreçleri destekliyorum.',
  stats: [
    ['3+', 'Yıl Deneyim'],
    ['4', 'Şirket & Ekip'],
    ['10+', 'Üretimde Proje'],
  ],
} as const;

export interface BoardEntry {
  id: 'about' | 'contact';
  title: string;
  lines: string[];
  placement: WallPlacement;
}

export const BOARDS: BoardEntry[] = [
  {
    id: 'contact',
    title: 'İLETİŞİM',
    lines: [
      'Yeni projelere ve fırsatlara açığım.',
      '',
      'melik.bagriyanik0@gmail.com',
      '+90 506 053 33 54',
      '',
      'linkedin.com/in/melik-bagriyanik',
      'github.com/melik-bagriyanik',
    ],
    placement: faceWest(7, 6.5, 2.0, 1.4, 2.25),
  },
];

export const GUIDE_PLACEMENT: WallPlacement = faceWest(4, 15, 1.7, 1.25, 2.1);

// ---------------------------------------------------------------------------
// Anıt (Ana Salon merkezi) — yaklaşınca hologramlar belirir
// ---------------------------------------------------------------------------

export const MONUMENT = {
  id: 'monument',
  position: [0, 0, 1.4] as [number, number, number],
  /** Hologram etkinleşme mesafesi (m) */
  activationDistance: 5.4,
  /** Yörüngede dönen yetenek çipleri */
  skills: ['React', 'Next.js', 'React Native', 'TypeScript', '.NET', 'Node.js', 'SQL', 'Flutter'],
  holoCard: {
    title: 'EĞİTİM',
    rows: [
      { head: 'Bilgisayar Mühendisliği', sub: 'Bilecik Şeyh Edebali Üniversitesi · 2019–2023' },
      { head: 'Erasmus+ · Bilgisayar Bilimi', sub: 'Wroclaw Ekonomi ve İşletme Üniv. · 2021–2022' },
      { head: 'İngilizce Hazırlık (B2)', sub: 'WSB Üniversitesi · Poznan · 2024' },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Ziyaretçi Defteri kürsüsü (Giriş/Çıkış holü)
// ---------------------------------------------------------------------------

export const GUESTBOOK = {
  id: 'guestbook',
  position: [2.4, 0, 12.6] as [number, number, number],
  /** Kürsü, giriş yoluna/oyuncuya dönük */
  rotationY: Math.atan2(0 - 2.4, 17 - 12.6),
  /** Mesajlar bu adrese e-posta olarak düşer (FormSubmit) */
  endpoint: 'https://formsubmit.co/ajax/melik.bagriyanik0@gmail.com',
} as const;

export interface RoomInfo {
  name: string;
  blurb: string;
  /** kroki için dünya koordinatları [x1, z1, x2, z2] */
  rect: [number, number, number, number];
}

export const ROOMS_INFO: RoomInfo[] = [
  { name: 'Giriş Holü', blurb: 'Sergi planı · Ziyaretçi defteri', rect: [-4, 10, 4, 20] },
  { name: 'Ana Salon', blurb: 'Sanatçı portresi · Anıt · İletişim', rect: [-7, -6, 7, 10] },
  { name: 'Kariyer Kanadı', blurb: 'İş deneyimi ve eğitim panoları', rect: [-19, -6, -7, 10] },
  { name: 'Proje Galerisi', blurb: 'Kişisel ve kurumsal projeler', rect: [7, -6, 19, 10] },
  { name: 'Teknoloji Salonu', blurb: 'Yetenek heykelleri', rect: [-7, -20, 7, -6] },
];

// ---------------------------------------------------------------------------
// Yönlendirme tabelaları
// ---------------------------------------------------------------------------

export interface SignEntry {
  text: string;
  position: [number, number, number];
  rotationY: number;
  size?: number;
}

export const SIGNS: SignEntry[] = [
  // Ana salon tarafından kapı üstleri
  { text: 'TEKNOLOJİ SALONU', position: [0, 3.55, -6 + EPS], rotationY: 0, size: 0.13 },
  { text: 'KARİYER KANADI', position: [-7 + EPS, 3.55, 2], rotationY: Math.PI / 2, size: 0.13 },
  { text: 'PROJE GALERİSİ', position: [7 - EPS, 3.55, 2], rotationY: -Math.PI / 2, size: 0.13 },
  // Giriş holünden ana salona
  { text: 'ANA SALON', position: [0, 3.55, 10 + EPS], rotationY: 0, size: 0.13 },
  // Ana salondan çıkışa (güney kapının ana salon yüzü)
  { text: 'ÇIKIŞ · ZİYARETÇİ DEFTERİ', position: [0, 3.55, 10 - EPS], rotationY: Math.PI, size: 0.105 },
  // İletişim panosunun üstü (uzaktan görünsün)
  { text: 'İLETİŞİM', position: [7 - EPS, 3.35, 6.5], rotationY: -Math.PI / 2, size: 0.13 },
  // Sergi planı krokisinin üstü
  { text: 'SERGİ PLANI', position: [4 - EPS, 2.95, 15], rotationY: -Math.PI / 2, size: 0.09 },
  // Giriş holü karşılama (güney duvar iç yüzü, oyuncunun arkası)
  { text: 'SANAL GALERİ', position: [0, 3.1, 20 - EPS], rotationY: Math.PI, size: 0.3 },
  { text: 'MMXXVI · İSTANBUL', position: [0, 2.62, 20 - EPS], rotationY: Math.PI, size: 0.1 },
];

/** Oklu yön tabelaları — sergilerin yerini duvar üzerinde işaret eder */
export interface ArrowSignEntry {
  label: string;
  position: [number, number, number];
  rotationY: number;
  /** Ok yönü (tabelanın yerel uzayında) */
  dir: 'left' | 'right';
}

export const ARROW_SIGNS: ArrowSignEntry[] = [
  // Ana salon doğu duvarı, Proje kapısının yanı → İletişim panosu güneyde kalır
  { label: 'İLETİŞİM', position: [7 - EPS, 2.1, 4.15], rotationY: -Math.PI / 2, dir: 'right' },
  // Ana salon güney duvarı (batı parçası) → çıkış/ziyaretçi defteri kapının içinden
  { label: 'ZİYARETÇİ DEFTERİ', position: [-4.5, 2.1, 10 - EPS], rotationY: Math.PI, dir: 'left' },
];

// ---------------------------------------------------------------------------
// Çarpışma listesi (duvarlar + kaideler)
// ---------------------------------------------------------------------------

export const COLLIDERS: Collider[] = [
  ...WALLS.map(wallCollider),
  ...TECHS.map((t) => ({
    cx: t.position[0],
    cz: t.position[2],
    hx: PEDESTAL_HALF,
    hz: PEDESTAL_HALF,
  })),
  // Anıt ve ziyaretçi defteri kürsüsü
  { cx: MONUMENT.position[0], cz: MONUMENT.position[2], hx: 0.8, hz: 0.8 },
  { cx: GUESTBOOK.position[0], cz: GUESTBOOK.position[2], hx: 0.45, hz: 0.45 },
];

/** Tüm yürünebilir alanın sınır kutusu (güvenlik kelepçesi) */
export const WORLD_BOUNDS = { minX: -19, maxX: 19, minZ: -20, maxZ: 20 } as const;
