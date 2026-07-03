// Galeri içeriği ve yerleşim planı — tüm metin/link/proje düzenlemeleri buradan yapılır.

export const ROOM = {
  width: 14, // x: -7 .. 7
  length: 36, // z: -18 .. 18
  height: 5.2,
  eyeHeight: 1.7,
} as const;

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
  year: string;
}

export interface WallPlacement {
  position: [number, number, number];
  rotationY: number;
  normal: [number, number, number];
  width: number;
  height: number;
}

export interface PaintingEntry {
  project: ProjectEntry;
  placement: WallPlacement;
}

const GITHUB = 'https://github.com/melik-bagriyanik';

// Duvar sabitleri (tablo yüzeyi duvardan 2cm önde)
const LEFT_X = -ROOM.width / 2 + 0.02;
const RIGHT_X = ROOM.width / 2 - 0.02;
const END_Z = -ROOM.length / 2 + 0.02;

const leftWall = (z: number, w: number, h: number): WallPlacement => ({
  position: [LEFT_X, 2.2, z],
  rotationY: Math.PI / 2,
  normal: [1, 0, 0],
  width: w,
  height: h,
});
const rightWall = (z: number, w: number, h: number): WallPlacement => ({
  position: [RIGHT_X, 2.2, z],
  rotationY: -Math.PI / 2,
  normal: [-1, 0, 0],
  width: w,
  height: h,
});

export const PAINTINGS: PaintingEntry[] = [
  {
    project: {
      id: 'melikshop',
      title: 'MelikShop',
      subtitle: 'Full-Stack E-Ticaret Platformu',
      description:
        'Uçtan uca kurgulanmış modern bir e-ticaret deneyimi: ürün kataloğu, sepet akışı, ödeme entegrasyonu ve yönetim paneli. Performans odaklı mimarisiyle gerçek bir üretim senaryosunu yansıtır.',
      tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind'],
      image: '/projects/ecommerce.png',
      accent: '#c9a44b',
      live: 'https://melik-shop.vercel.app',
      github: `${GITHUB}/mlk-shop`,
      year: '2025',
    },
    placement: {
      position: [0, 2.35, END_Z],
      rotationY: 0,
      normal: [0, 0, 1],
      width: 3.6,
      height: 2.03,
    },
  },
  {
    project: {
      id: 'whobee',
      title: 'Whobee',
      subtitle: 'Yapay Zeka Sohbet Asistanı',
      description:
        'Doğal dil ile etkileşim kuran, bağlamı hatırlayan bir AI asistan arayüzü. Akışkan mesaj animasyonları ve karanlık estetikli nöral arayüz tasarımıyla yapay zekayı dostane bir deneyime çevirir.',
      tech: ['React', 'TypeScript', 'AI API', 'Framer Motion'],
      image: '/projects/ai.png',
      accent: '#7c6df2',
      github: GITHUB,
      year: '2025',
    },
    placement: leftWall(-9, 3.0, 1.69),
  },
  {
    project: {
      id: 'atelier',
      title: 'Atelier',
      subtitle: 'Lüks Mücevher Vitrini',
      description:
        'Yüksek çözünürlüklü ürün sunumu ve zarif mikro etkileşimlerle kurgulanmış bir mücevher e-ticaret arayüzü. Lüks segment markalaşmasının dijitaldeki karşılığı üzerine bir çalışma.',
      tech: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
      image: '/projects/jewelry.png',
      accent: '#b8860b',
      github: GITHUB,
      year: '2024',
    },
    placement: rightWall(-9, 3.0, 1.69),
  },
  {
    project: {
      id: 'tech-news',
      title: 'Tech News',
      subtitle: 'Teknoloji Haber Platformu',
      description:
        'Güncel teknoloji haberlerini toplayan, kategori ve arama odaklı bir haber akışı uygulaması. Hızlı gezinme ve okunabilirlik öncelikli sade bir editoryal arayüz sunar.',
      tech: ['TypeScript', 'React', 'REST API', 'Vercel'],
      accent: '#2563eb',
      live: 'https://melik-news.vercel.app',
      github: `${GITHUB}/tech-news`,
      year: '2025',
    },
    placement: leftWall(-1.5, 1.92, 2.4),
  },
  {
    project: {
      id: 'pomodoro',
      title: 'Pomodoro Focus',
      subtitle: 'Odak & Zaman Yönetimi',
      description:
        'Pomodoro tekniğini zarif bir sayaç deneyimine dönüştüren üretkenlik uygulaması. Oturum istatistikleri ve akıcı geçiş animasyonlarıyla odaklanmayı keyifli hale getirir.',
      tech: ['TypeScript', 'React', 'LocalStorage'],
      accent: '#e11d48',
      live: 'https://pomodoro-eight-ashen.vercel.app',
      github: `${GITHUB}/pomodoro`,
      year: '2024',
    },
    placement: rightWall(-1.5, 1.92, 2.4),
  },
  {
    project: {
      id: 'image-blur-game',
      title: 'Blur Game',
      subtitle: 'Görsel Tahmin Oyunu',
      description:
        'Bulanık görselin adım adım netleştiği, refleks ve dikkat üzerine kurulu bir tahmin oyunu. Oyunlaştırılmış puan sistemi ve anlık geri bildirimlerle bağımlılık yaratan bir mini deneyim.',
      tech: ['TypeScript', 'React', 'Canvas API'],
      accent: '#0d9488',
      live: 'https://image-blur-game.vercel.app',
      github: `${GITHUB}/image-blur-game`,
      year: '2024',
    },
    placement: leftWall(6, 1.92, 2.4),
  },
  {
    project: {
      id: 'history-website',
      title: 'Chronicle',
      subtitle: 'İnteraktif Tarih Anlatısı',
      description:
        'Tarihi olayları zaman çizelgesi üzerinde anlatan, kaydırma temposuyla hikayeleşen bir web deneyimi. İçerik ile animasyonun dengeli birlikteliği üzerine bir anlatı tasarımı çalışması.',
      tech: ['TypeScript', 'React', 'Scroll Animation'],
      accent: '#92400e',
      live: 'https://history-website-gilt.vercel.app',
      github: `${GITHUB}/history-website`,
      year: '2024',
    },
    placement: rightWall(6, 1.92, 2.4),
  },
];

export type SculptureKind = 'torusKnot' | 'icosahedron' | 'prism' | 'rings' | 'stack' | 'cube';

export interface TechEntry {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  sculpture: SculptureKind;
  position: [number, number, number];
  material: 'gold' | 'stone' | 'bronze';
}

export const TECHS: TechEntry[] = [
  {
    id: 'react',
    title: 'React Ekosistemi',
    blurb: 'Bileşen mimarisi, durum yönetimi ve modern render stratejileriyle ölçeklenen arayüzler.',
    skills: ['React 19', 'Next.js 15', 'React Native', 'Expo'],
    sculpture: 'rings',
    position: [-2.9, 0, -12],
    material: 'gold',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    blurb: 'Tip güvenliğiyle kendini belgeleyen, hatayı derleme anında yakalayan kod tabanları.',
    skills: ['TypeScript', 'ESLint', 'Zod', 'Monorepo'],
    sculpture: 'cube',
    position: [2.9, 0, -12],
    material: 'stone',
  },
  {
    id: 'threejs',
    title: '3D & Animasyon',
    blurb: 'WebGL üzerinde gerçek zamanlı sahneler, mikro etkileşimler ve sinematik geçişler.',
    skills: ['Three.js', 'R3F', 'Framer Motion', 'Anime.js'],
    sculpture: 'torusKnot',
    position: [-2.9, 0, -4],
    material: 'gold',
  },
  {
    id: 'backend',
    title: 'Backend & API',
    blurb: 'Dayanıklı servisler, temiz sözleşmeler ve gerçek zamanlı veri akışları.',
    skills: ['Node.js', 'GraphQL', 'REST', 'Python'],
    sculpture: 'prism',
    position: [2.9, 0, -4],
    material: 'bronze',
  },
  {
    id: 'database',
    title: 'Veri Katmanı',
    blurb: 'İlişkisel modelleme, önbellekleme ve ORM ile güvenilir veri mimarileri.',
    skills: ['PostgreSQL', 'Prisma', 'Redis'],
    sculpture: 'stack',
    position: [-2.9, 0, 4],
    material: 'stone',
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps',
    blurb: 'Konteynerize dağıtım, CI/CD ve bulut altyapısıyla üretime hazır sistemler.',
    skills: ['AWS', 'Docker', 'Vercel', 'CI/CD'],
    sculpture: 'icosahedron',
    position: [2.9, 0, 4],
    material: 'gold',
  },
];

export interface BoardEntry {
  id: 'about' | 'contact';
  title: string;
  lines: string[];
  placement: WallPlacement;
}

export const BOARDS: BoardEntry[] = [
  {
    id: 'about',
    title: 'HAKKIMDA',
    lines: [
      'Ben Melik — Full-Stack Geliştirici',
      've Yapay Zeka Mimarı.',
      '',
      'Karmaşık veri yapılarını estetik',
      '3D dünyalarla birleştirerek, sadece',
      'çalışan değil, ilham veren',
      'sistemler inşa ediyorum.',
    ],
    placement: leftWall(12.5, 2.1, 1.5),
  },
  {
    id: 'contact',
    title: 'İLETİŞİM',
    lines: [
      'Yeni projelere açığım.',
      '',
      'melik.bagriyanik0@gmail.com',
      '0506 053 33 54',
      '',
      'linkedin.com/in/melik-bagriyanik',
      'github.com/melik-bagriyanik',
    ],
    placement: rightWall(12.5, 2.1, 1.5),
  },
];

export const CONTACT = {
  email: 'melik.bagriyanik0@gmail.com',
  phone: '0506 053 33 54',
  linkedin: 'https://www.linkedin.com/in/melik-bagriyanik',
  github: GITHUB,
} as const;

export const ABOUT = {
  name: 'MELİK BAĞRIYANIK',
  role: 'FULL-STACK DEVELOPER · AI MİMARI',
  location: 'İstanbul · TR',
  paragraph:
    'Global ölçekli sistemler, akıllı arayüzler ve 3D deneyimler kuruyorum. Kod ile estetiğin kesişiminde, kullanıcıyı önceleyen ürünler inşa ediyorum. 5+ yıl deneyim, 30+ tamamlanmış proje.',
} as const;

// Kaide çarpışma kutuları için yarı-genişlik
export const PEDESTAL_HALF = 0.55;
