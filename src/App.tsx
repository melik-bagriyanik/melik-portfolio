import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ExternalLink, Database, Layout, Cpu, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { animate } from 'animejs';
import * as THREE from 'three';
import { Globe } from './components/Globe';
import { VideoText } from "@/components/ui/video-text";

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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'nav-blur py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-display font-extrabold tracking-tighter"
        >
          MELİK<span className="text-primary italic">.AI</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 glass-card text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Sinyal Gönder
          </motion.button>
        </div>

        <button className="md:hidden text-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card mx-4 mt-2 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-xl font-bold uppercase tracking-widest text-slate-100"
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
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 1.5 }}
          className="inline-block px-6 py-2 rounded-full glass-card text-[10px] font-black tracking-[0.3em] text-primary mb-12 uppercase animate-pulse-slow font-sans"
        >
          Earth-Scale Intelligence & Systems
        </motion.div>

        <h1 
          ref={headingRef}
          className="text-6xl md:text-[9rem] font-display font-extrabold mb-12 tracking-tighter leading-none opacity-0"
        >
          Limitlerin <br />
          <span className="text-gradient">Ötesinde</span>
        </h1>

        <p 
          ref={textRef}
          className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl mb-16 leading-relaxed opacity-0"
        >
          Global ölçekli sistemler, derin veri yapıları ve kusursuz 3D 
          arayüzlerle dijital dünyayı yeniden şekillendiriyorum. Gece mavisi 
          estetiğiyle fütüristik bir dokunuş.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="button-primary">Protokolü Başlat</button>
          <button className="button-secondary">Sistem Analizi</button>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        <ChevronDown size={32} className="text-slate-600" />
      </motion.div>
    </section>
  );
};

// Main App Component with Background Control
export default function App() {
  const globeRef = useRef<THREE.Group>(null!);
  const worldBgRef = useRef<HTMLImageElement>(null);
  const nebulaBgRef = useRef<HTMLImageElement>(null);
  const cityBgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // Globe Parallax
      if (globeRef.current) {
        animate(globeRef.current.position, {
          y: scrollY * 0.002,
          duration: 300,
          easing: 'linear'
        });
      }

      // Background Opacities and Parallax
      if (worldBgRef.current) {
        worldBgRef.current.style.transform = `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0001})`;
        worldBgRef.current.style.opacity = `${Math.max(0.1, 0.4 - scrollY / vh)}`;
      }

      if (nebulaBgRef.current) {
        nebulaBgRef.current.style.opacity = `${Math.min(0.3, scrollY / vh)}`;
        nebulaBgRef.current.style.transform = `translateY(${(scrollY - vh) * 0.05}px) scale(1.1)`;
      }

      if (cityBgRef.current) {
        cityBgRef.current.style.opacity = `${Math.min(0.2, (scrollY - vh * 2) / vh)}`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="antialiased selection:bg-primary/40 selection:text-white bg-background overflow-x-hidden">
      {/* Cinematic Background Layers */}
      <img ref={worldBgRef} src="/backgrounds/world.jpg" className="bg-layer pix-world" alt="" />
      <img ref={nebulaBgRef} src="/backgrounds/nebula.png" className="bg-layer nebula-mix opacity-0" alt="" />
      <img ref={cityBgRef} src="/backgrounds/city.png" className="bg-layer opacity-0" alt="" />
      <div className="bg-overlay" />

      {/* 3D Background */}
      <div className="canvas-container opacity-50">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group ref={globeRef}>
              <Globe />
            </group>
          </Float>
        </Canvas>
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Skills />
        <Projects />
        
        {/* Digital Vision Section */}
        <section className="py-32 relative group">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1 rounded-full glass-card text-[10px] font-black tracking-widest text-primary mb-4 uppercase"
              >
                Vision Protocol
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Dijital <span className="text-gradient">Vizyon</span></h2>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative h-[300px] md:h-[600px] w-full overflow-hidden glass-card border-slate-800/50 flex items-center justify-center bg-slate-950/20"
            >
              <VideoText 
                src="https://cdn.magicui.design/ocean-small.webm"
                className="bg-transparent"
                fontSize={35}
                fontWeight={900}
                fontFamily="Outfit"
              >
                FUTURE
              </VideoText>
              
              {/* Overlay for premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Re-using Sections from previous version for brevity but wrapping in a simplified way */}
      <footer id="contact" className="py-32 border-t border-slate-900 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-[5rem] mb-12 tracking-tighter leading-none">Bağlantı <br/><span className="text-primary italic">Kurmaya</span> Hazır</h2>
          <p className="text-slate-400 text-xl mb-16 max-w-lg mx-auto leading-relaxed">
            Global projeler ve stratejik işbirlikleri için sinyal gönderin.
          </p>
          <button className="button-primary">İletişime Geç</button>
        </div>
      </footer>
    </div>
  );
}

// Sub-components re-defined to keep file clean
const Skills = () => {
  const skillCategories = [
    {
      title: 'Architectures',
      icon: <Layout className="text-primary" size={24} />,
      skills: ['React 19', 'Next.js 15', 'Three.js', 'PostgreSQL', 'Node.js'],
    },
    {
      title: 'Intelligence',
      icon: <Database className="text-secondary" size={24} />,
      skills: ['Prisma', 'GraphQL', 'AWS Cloud', 'Docker', 'Redis'],
    },
    {
      title: 'Interactions',
      icon: <Cpu className="text-accent" size={24} />,
      skills: ['Anime.js', 'Framer Motion', 'React Native', 'Expo', 'GSAP'],
    },
  ];

  return (
    <section id="skills" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl mb-6">Teknolojik <span className="text-secondary">Yığın</span></h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="glass-card p-12 group hover:scale-[1.02] transition-all duration-500"
            >
              <div className="mb-8 w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-primary/50 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-2xl mb-8 uppercase tracking-widest font-black">{cat.title}</h3>
              <div className="flex flex-wrap gap-3">
                {cat.skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-slate-950/80 rounded-full text-xs font-bold tracking-wider text-slate-400 group-hover:text-primary transition-colors border border-slate-800">
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

const Projects = () => {
  const projects = [
    {
      title: 'Aura Luxe Commerce',
      description: 'Ultra lüks saat markaları için geliştirilmiş yüksek performanslı e-ticaret çözümü.',
      tags: ['NEXT.JS 15', 'STRIPE', 'FRAMER'],
      image: '/projects/ecommerce.png',
    },
    {
      title: 'Neural Command Node',
      description: 'Yapay zeka operasyonlarını yöneten ve görselleştiren ileri düzey kontrol paneli.',
      tags: ['THREE.JS', 'AI CORE', 'R3F'],
      image: '/projects/ai.png',
    },
    {
      title: 'Aurum Inventory',
      description: 'Değerli taş ve metal operasyonlarını yöneten kurumsal düzey b2b mobil uygulama.',
      tags: ['EXPO', 'DOCKER', 'POSTGRES'],
      image: '/projects/jewelry.png',
    },
  ];

  return (
    <section id="projects" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 text-left">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-7xl mb-8 tracking-tighter">Seçilmiş <br /><span className="text-gradient">Operasyonlar</span></h2>
            <p className="text-slate-400 text-xl leading-relaxed">Projelerim sadece kod değil, birer dijital sanat eseri ve çözüm protokolüdür.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {projects.map((proj) => (
             <motion.div 
             key={proj.title}
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="glass-card overflow-hidden group border-none text-left"
           >
             <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
               <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 z-10" />
               <img src={proj.image} alt={proj.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="p-10 relative z-20">
               <div className="flex flex-wrap gap-3 mb-6">
                 {proj.tags.map((tag) => (
                   <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">{tag}</span>
                 ))}
               </div>
               <h3 className="text-3xl mb-4 font-black tracking-tight">{proj.title}</h3>
               <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                 {proj.description}
               </p>
               <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary hover:gap-5 transition-all">
                 Giriş Yap <ExternalLink size={14} />
               </button>
             </div>
           </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
