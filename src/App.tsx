import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ExternalLink, Database, Layout, Cpu, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { animate } from 'animejs';
import * as THREE from 'three';
import { Globe } from './components/Globe';
import { VideoText } from "@/components/ui/video-text";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'nav-blur py-3 border-b border-white/5' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-2xl font-display font-black tracking-tighter"
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
              className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-primary transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all rounded-lg"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 glass-card mx-4 mt-2 overflow-hidden border-blue-500/20"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-bold uppercase tracking-widest text-slate-100 hover:text-primary transition-colors"
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
          className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-[0.3em] text-blue-400 mb-8 uppercase"
        >
          System Initialized // Core Node Alpha
        </motion.div>

        <h1 
          ref={headingRef}
          className="text-6xl md:text-8xl font-display font-black mb-8 tracking-tighter leading-[0.85] opacity-0"
        >
          Limitlerin <br />
          <div className="relative h-[80px] md:h-[120px] w-full flex items-center justify-center overflow-hidden">
            <VideoText 
              src="https://cdn.magicui.design/ocean-small.webm"
              className="bg-transparent"
              fontSize={14}
              fontWeight={900}
              fontFamily="Outfit"
            >
              ÖTESİNDE
            </VideoText>
          </div>
        </h1>

        <p 
          ref={textRef}
          className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed opacity-0"
        >
          Global ölçekli sistemler, derin veri yapıları ve kusursuz 3D 
          arayüzlerle dijital dünyayı yeniden şekillendiriyorum. 
          <span className="text-blue-200"> Gece mavisi estetiğiyle fütüristik bir dokunuş.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button className="button-primary">Protokolü Başlat</button>
          <button className="button-secondary">Sistem Analizi</button>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <ChevronDown size={32} className="text-blue-500" />
      </motion.div>
    </section>
  );
};

// Main App Component with Background Control
export default function App() {
  const globeRef = useRef<THREE.Group>(null!);
  const worldBgRef = useRef<HTMLImageElement>(null);
  const nebulaBgRef = useRef<HTMLImageElement>(null);
  const spaceBgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // Globe Parallax
      if (globeRef.current) {
        globeRef.current.position.y = scrollY * 0.002;
        globeRef.current.rotation.y = scrollY * 0.0005;
      }

      // Background Opacities and Parallax
      if (worldBgRef.current) {
        worldBgRef.current.style.transform = `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0001})`;
        worldBgRef.current.style.opacity = `${Math.max(0, 0.6 - scrollY / (vh * 0.8))}`;
      }

      if (nebulaBgRef.current) {
        const nebulaStart = 0;
        const opacity = Math.min(0.5, (scrollY - nebulaStart) / vh);
        nebulaBgRef.current.style.opacity = `${opacity}`;
        nebulaBgRef.current.style.transform = `translateY(${(scrollY) * -0.05}px) scale(1.15)`;
      }

      if (spaceBgRef.current) {
        const spaceStart = vh;
        const opacity = Math.min(0.4, (scrollY - spaceStart) / vh);
        spaceBgRef.current.style.opacity = `${opacity}`;
        spaceBgRef.current.style.transform = `translateY(${(scrollY - vh) * -0.02}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="antialiased selection:bg-primary/40 selection:text-white bg-[#020617]">
      {/* Cinematic Background Layers */}
      <img ref={worldBgRef} src="/backgrounds/world.jpg" className="bg-layer pix-world" alt="" style={{ opacity: 0.6 }} />
      <img ref={nebulaBgRef} src="/backgrounds/nebula.png" className="bg-layer nebula-mix" alt="" style={{ opacity: 0 }} />
      <img ref={spaceBgRef} src="/backgrounds/space.png" className="bg-layer" alt="" style={{ opacity: 0 }} />
      <div className="bg-overlay" />

      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#3b82f6" intensity={1} />
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
                textClassName="text-4xl md:text-5xl font-black text-white"
                underlineClassName="text-blue-500"
              />
            </div>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-light">
                Ben Melik, <span className="text-blue-400 font-medium">Yapay Zeka Mimarı</span> ve <span className="text-blue-400 font-medium">Full-Stack Geliştirici</span> olarak dijital sınırları zorluyorum. 
                Karmaşık veri yapılarını estetik 3D dünyalarla birleştirerek, sadece çalışan değil, ilham veren sistemler inşa ediyorum.
              </p>
            </div>
          </div>
        </section>

        <Skills />
        <Projects />
      </main>
      
      {/* Contact Section - Final Wow Section */}
      <footer id="contact" className="min-h-screen relative flex items-center justify-center border-t border-white/5 bg-black/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block mb-6 px-4 py-1 rounded-full border border-blue-500/30 text-[10px] uppercase tracking-widest text-blue-400 font-bold">
              Available for Projects
            </div>
            
            <AnimatedText 
              text="Sinyal Gönderin" 
              textClassName="text-6xl md:text-[8rem] mb-12 tracking-tighter leading-none font-black text-white"
              underlineClassName="text-blue-500"
            />

            <p className="text-slate-400 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              Global ölçekli dijital çözümler ve inovatif mimariler için hazırız. <br className="hidden md:block"/> Vizyonunuzu gerçeğe dönüştürelim.
            </p>
            <button className="button-primary text-xl px-16 py-6 shadow-2xl shadow-blue-500/20">
              İletişime Geç
            </button>
          </motion.div>
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      </footer>
    </div>
  );
}

// Sub-components
const Skills = () => {
  const skillCategories = [
    {
      title: 'Architectures',
      icon: <Layout className="text-blue-400" size={24} />,
      skills: ['React 19', 'Next.js 15', 'Three.js', 'PostgreSQL', 'Node.js'],
    },
    {
      title: 'Intelligence',
      icon: <Database className="text-blue-500" size={24} />,
      skills: ['Prisma', 'GraphQL', 'AWS Cloud', 'Docker', 'Redis', 'Tailwind'],
    },
    {
      title: 'Interactions',
      icon: <Cpu className="text-blue-600" size={24} />,
      skills: ['Anime.js', 'Framer Motion', 'React Native', 'Expo', 'Python'],
    },
  ];

  return (
    <section id="skills" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-24">
          <AnimatedText 
            text="Teknolojik Yığın" 
            textClassName="text-4xl md:text-6xl font-black text-white"
            underlineClassName="text-blue-500"
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
              className="glass-card p-10 group hover:-translate-y-2 transition-all duration-500 border-white/5"
            >
              <div className="mb-8 w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-xl mb-6 uppercase tracking-widest font-black text-white">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-white/5 rounded-md text-[10px] font-bold tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors border border-white/5">
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
            <AnimatedText 
              text="Seçilmiş Operasyonlar" 
              textClassName="text-4xl md:text-7xl font-black text-white text-left"
              underlineClassName="text-blue-500"
              className="items-start"
            />
            <p className="text-slate-400 text-xl mt-8 leading-relaxed">Projelerim sadece kod değil, birer dijital sanat eseri ve çözüm protokolüdür.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {projects.map((proj) => (
             <motion.div 
             key={proj.title}
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="glass-card overflow-hidden group border-white/5 text-left bg-gradient-to-b from-white/5 to-transparent"
           >
             <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-80 z-10" />
               <img src={proj.image} alt={proj.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
             </div>
             <div className="p-10 relative z-20">
               <div className="flex flex-wrap gap-3 mb-6">
                 {proj.tags.map((tag) => (
                   <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{tag}</span>
                 ))}
               </div>
               <h3 className="text-2xl mb-4 font-black tracking-tight text-white">{proj.title}</h3>
               <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-2">
                 {proj.description}
               </p>
               <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:gap-5 transition-all">
                 PROJEYİ İNCELE <ExternalLink size={14} />
               </button>
             </div>
           </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
