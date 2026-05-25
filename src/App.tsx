import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Database, Layout, Cpu, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { animate } from 'animejs';
import * as THREE from 'three';
import { Globe } from './components/Globe';
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import {
  ContainerScroll,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ui/animated-gallery";
import { MouseFollowingEyes } from "@/components/ui/mouse-following-eyes";
import { ExperienceArcade } from "@/components/ui/experience-arcade";

// Types
interface NavLink {
  name: string;
  href: string;
}

// Components
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { name: 'Hakkımda', href: '#about' },
    { name: 'Yetenekler', href: '#skills' },
    { name: 'Projeler', href: '#projects' },
    { name: 'Deneyim', href: '#experience' },
    { name: 'İletişim', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'nav-blur py-3' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-2xl font-display font-black tracking-tighter text-stone-900"
        >
          MELİK<span className="text-gold-600 italic">.AI</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:text-gold-600 transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 bg-gold-500/15 border border-gold-500/40 text-gold-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all rounded-lg"
          >
            Sinyal Gönder
          </motion.button>
        </div>

        <button className="md:hidden text-stone-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-2xl mx-4 mt-2 overflow-hidden z-50 shadow-2xl shadow-gold-500/10"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold uppercase tracking-widest text-stone-800 hover:text-gold-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      animate(headingRef.current, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 2000,
        easing: 'easeOutExpo',
        delay: 500
      });
    }

    if (textRef.current) {
      animate(textRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 2000,
        easing: 'easeOutExpo',
        delay: 800
      });
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-[10px] font-black tracking-[0.3em] text-gold-700 mb-8 uppercase"
        >
          System Initialized // Core Node Alpha
        </motion.div>

        <h1
          ref={headingRef}
          className="text-6xl md:text-8xl font-display font-black mb-8 tracking-tighter leading-[0.85] opacity-0 text-stone-900"
        >
          Limitlerin <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-gold-600 to-gold-700 italic">
            ÖTESİNDE
          </span>
        </h1>

        <p
          ref={textRef}
          className="max-w-2xl mx-auto text-stone-600 text-lg md:text-xl mb-12 leading-relaxed opacity-0"
        >
          Global ölçekli sistemler, derin veri yapıları ve kusursuz 3D
          arayüzlerle dijital dünyayı yeniden şekillendiriyorum.
          <span className="text-gold-700"> Aydınlık altın estetiğiyle modern bir dokunuş.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button className="button-primary">Protokolü Başlat</button>
          <button className="button-secondary">Sistem Analizi</button>
        </div>
      </div>

    </section>
  );
};

// Main App Component with Background Control
export default function App() {
  const globeRef = useRef<THREE.Group>(null!);
  const worldBgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Globe Parallax
      if (globeRef.current) {
        globeRef.current.position.y = scrollY * 0.002;
        globeRef.current.rotation.y = scrollY * 0.0005;
      }

      if (worldBgRef.current) {
        worldBgRef.current.style.transform = `translateY(${scrollY * 0.05}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="antialiased bg-[#fafaf6]">
      {/* Soft light backdrop */}
      <img ref={worldBgRef} src="/backgrounds/world.jpg" className="bg-layer pix-world" alt="" />
      <div className="bg-overlay" />

      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} color="#c9a44b" intensity={1.2} />
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={globeRef}>
              <Globe />
            </group>
          </Float>
        </Canvas>
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />

        <section id="about" className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center mb-16">
              <AnimatedText
                text="Hakkımda"
                textClassName="text-4xl md:text-5xl font-black text-stone-900"
                underlineClassName="text-gold-500"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <p className="text-stone-700 text-xl md:text-2xl leading-relaxed font-light">
                  Ben Melik, <span className="text-gold-700 font-medium">Yapay Zeka Mimarı</span> ve <span className="text-gold-700 font-medium">Full-Stack Geliştirici</span> olarak dijital sınırları zorluyorum.
                  Karmaşık veri yapılarını estetik 3D dünyalarla birleştirerek, sadece çalışan değil, ilham veren sistemler inşa ediyorum.
                </p>
                <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-600" />
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold">
                    Whobee ile etkileşime geç →
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="order-1 lg:order-2 relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden"
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(201,164,75,0.18) 0%, rgba(250,250,246,0) 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <div className="absolute inset-0 w-full h-full">
                  <MouseFollowingEyes />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Skills />
        <Projects />
        <ExperienceSection />
      </main>

      <Contact />
    </div>
  );
}

// Sub-components
const Skills = () => {
  const skillCategories = [
    {
      title: 'Architectures',
      icon: <Layout className="text-gold-500" size={24} />,
      skills: ['React 19', 'Next.js 15', 'Three.js', 'PostgreSQL', 'Node.js'],
    },
    {
      title: 'Intelligence',
      icon: <Database className="text-gold-600" size={24} />,
      skills: ['Prisma', 'GraphQL', 'AWS Cloud', 'Docker', 'Redis', 'Tailwind'],
    },
    {
      title: 'Interactions',
      icon: <Cpu className="text-gold-700" size={24} />,
      skills: ['Anime.js', 'Framer Motion', 'React Native', 'Expo', 'Python'],
    },
  ];

  return (
    <section id="skills" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-24">
          <AnimatedText
            text="Teknolojik Yığın"
            textClassName="text-4xl md:text-6xl font-black text-stone-900"
            underlineClassName="text-gold-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="glass-card p-10 group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="mb-8 w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/30 group-hover:border-gold-500 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-xl mb-6 uppercase tracking-widest font-black text-stone-900">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-cream-100 rounded-md text-[10px] font-bold tracking-wider text-stone-600 group-hover:text-gold-700 transition-colors border border-stone-200">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PROJECT_IMAGES_1 = [
  '/projects/ecommerce.png',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&auto=format&fit=crop&q=55',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=560&auto=format&fit=crop&q=55',
];
const PROJECT_IMAGES_2 = [
  '/projects/ai.png',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=560&auto=format&fit=crop&q=55',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=560&auto=format&fit=crop&q=55',
];
const PROJECT_IMAGES_3 = [
  '/projects/jewelry.png',
  'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=560&auto=format&fit=crop&q=55',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=560&auto=format&fit=crop&q=55',
];

const Projects = () => {
  return (
    <section id="projects" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-12 text-left">
          <div className="max-w-3xl">
            <AnimatedText
              text="Seçilmiş Operasyonlar"
              textClassName="text-4xl md:text-7xl font-black text-stone-900 text-left"
              underlineClassName="text-gold-500"
              className="items-start"
            />
            <p className="text-stone-600 text-xl mt-8 leading-relaxed">Projelerim sadece kod değil, birer dijital sanat eseri ve çözüm protokolüdür.</p>
          </div>
        </div>
      </div>

      <ContainerScroll className="relative h-[200vh]">
        <ContainerSticky className="h-svh">
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(201,164,75,0.18) 0%, rgba(250,250,246,0) 70%)',
              filter: 'blur(64px)',
            }}
          />
          <GalleryContainer className="max-w-7xl mx-auto px-6">
            <GalleryCol yRange={['-6%', '1%']} className="-mt-2">
              {PROJECT_IMAGES_1.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-md shadow-gold-700/10 border border-stone-200"
                  src={imageUrl}
                  alt="Proje görseli"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-30%]" yRange={['8%', '3%']}>
              {PROJECT_IMAGES_2.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-md shadow-gold-700/10 border border-stone-200"
                  src={imageUrl}
                  alt="Proje görseli"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={['-6%', '1%']} className="-mt-2">
              {PROJECT_IMAGES_3.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-md shadow-gold-700/10 border border-stone-200"
                  src={imageUrl}
                  alt="Proje görseli"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
};

const ExperienceSection = () => {
  return (
    <section id="experience" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10">
            <span className="text-base">⌨️</span>
            <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold">
              Klavye ile oyna · WASD / Ok tuşları
            </span>
          </div>
          <AnimatedText
            text="Deneyim Pisti"
            textClassName="text-4xl md:text-6xl font-black text-stone-900"
            underlineClassName="text-gold-500"
          />
          <p className="text-stone-600 text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
            Pistte arabayı sür ve her durakta o döneme dair bir hikaye keşfet. <span className="text-stone-800 font-semibold">Klavyenden W A S D</span> ya da ok tuşlarını kullanarak başla — bir durağa girince kart otomatik açılır.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ExperienceArcade />
        </motion.div>
      </div>
    </section>
  );
};

const Contact = () => {
  const email = 'melik.bagriyanik0@gmail.com';
  const phone = '0506 053 33 54';
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    'Yeni Proje Sinyali'
  )}&body=${encodeURIComponent(
    'Merhaba Melik,\n\nBahsetmek istediğim proje:\n\n'
  )}`;

  const socials = [
    {
      label: 'LinkedIn',
      handle: '@melik-bagriyanik',
      href: 'https://www.linkedin.com/in/melik-bagriyanik',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.048c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.268 2.37 4.268 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: 'GitHub',
      handle: '@melik-bagriyanik',
      href: 'https://github.com/melik-bagriyanik',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
  ];

  return (
    <footer id="contact" className="min-h-screen relative flex items-center justify-center overflow-hidden py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-300/20 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-5xl w-full mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-600" />
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold">
              Yeni projelere açık
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900 mb-6">
            Hadi bir şey <span className="italic font-light text-gold-600">inşa edelim</span>
          </h2>
          <p className="text-stone-600 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
            Aklınızdaki fikri birlikte somutlaştıralım. Mesajınızı bırakın, en kısa sürede dönüş yapayım.
          </p>
        </motion.div>

        <motion.a
          href={mailtoHref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group block relative mb-6 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gold-300/30 via-gold-200/20 to-transparent border border-gold-500/30 hover:border-gold-500 transition-all overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-300/30 blur-[80px] rounded-full group-hover:bg-gold-400/40 transition-all duration-700" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center group-hover:bg-gold-500 group-hover:border-gold-500 transition-all">
                <Mail className="w-5 h-5 text-gold-700 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-gold-700 font-bold mb-1">
                  E-posta gönder
                </div>
                <div className="text-lg md:text-2xl font-bold text-stone-900 truncate">
                  {email}
                </div>
              </div>
            </div>
            <ArrowUpRight className="shrink-0 w-6 h-6 text-stone-500 group-hover:text-gold-600 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.a>

        <motion.a
          href={`tel:${phone.replace(/\s/g, '')}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group block mb-10 p-6 rounded-2xl bg-white/70 border border-stone-200 hover:border-gold-400 hover:bg-white transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-cream-100 border border-stone-200 flex items-center justify-center group-hover:bg-cream-200 transition-all">
                <Phone className="w-5 h-5 text-stone-700" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">
                  Telefon
                </div>
                <div className="text-lg md:text-xl font-bold text-stone-900">
                  {phone}
                </div>
              </div>
            </div>
            <ArrowUpRight className="shrink-0 w-5 h-5 text-stone-400 group-hover:text-stone-700 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 border border-stone-200 hover:border-gold-400 hover:bg-white transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-cream-100 border border-stone-200 flex items-center justify-center text-stone-700 group-hover:text-gold-700 group-hover:bg-cream-200 transition-all">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-0.5">
                    {s.label}
                  </div>
                  <div className="text-sm font-bold text-stone-900 truncate">
                    {s.handle}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="shrink-0 w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-20 pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-widest text-stone-500"
        >
          <div>© {new Date().getFullYear()} Melik Bağrıyanık</div>
          <div className="font-bold text-stone-700">MELİK<span className="text-gold-600 italic">.AI</span></div>
        </motion.div>
      </div>
    </footer>
  );
};
