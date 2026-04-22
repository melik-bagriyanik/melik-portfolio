import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Database, Layout, Cpu, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { animate } from 'animejs';
import * as THREE from 'three';
import { Globe } from './components/Globe';
import { VideoText } from "@/components/ui/video-text";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import {
  ContainerScroll,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ui/animated-gallery";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import { InteractiveNeuralVortex } from "@/components/ui/interactive-neural-vortex-background";

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
            className="md:hidden absolute top-full left-0 right-0 bg-[#020617]/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl mx-4 mt-2 overflow-hidden z-50 shadow-2xl shadow-blue-500/10"
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
      <InteractiveNeuralVortex className="!z-[1]" opacity={0.9} />

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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-light">
                  Ben Melik, <span className="text-blue-400 font-medium">Yapay Zeka Mimarı</span> ve <span className="text-blue-400 font-medium">Full-Stack Geliştirici</span> olarak dijital sınırları zorluyorum.
                  Karmaşık veri yapılarını estetik 3D dünyalarla birleştirerek, sadece çalışan değil, ilham veren sistemler inşa ediyorum.
                </p>
                <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">
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
                      'radial-gradient(circle at center, rgba(37,99,235,0.18) 0%, rgba(2,6,23,0) 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <InteractiveRobotSpline
                  scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                  className="absolute inset-0 w-full h-full"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <Skills />
        <Projects />
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

const PROJECT_IMAGES_1 = [
  '/projects/ecommerce.png',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=60',
];
const PROJECT_IMAGES_2 = [
  '/projects/ai.png',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=60',
];
const PROJECT_IMAGES_3 = [
  '/projects/jewelry.png',
  'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=60',
];

const Projects = () => {
  return (
    <section id="projects" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-12 text-left">
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
      </div>

      <ContainerScroll className="relative h-[350vh]">
        <ContainerSticky className="h-svh">
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(37,99,235,0.25) 0%, rgba(2,6,23,0) 70%)',
              filter: 'blur(64px)',
            }}
          />
          <GalleryContainer className="max-w-7xl mx-auto px-6">
            <GalleryCol yRange={['-10%', '2%']} className="-mt-2">
              {PROJECT_IMAGES_1.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-2xl shadow-blue-500/10 border border-white/5"
                  src={imageUrl}
                  alt="Proje görseli"
                />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-50%]" yRange={['15%', '5%']}>
              {PROJECT_IMAGES_2.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-2xl shadow-blue-500/10 border border-white/5"
                  src={imageUrl}
                  alt="Proje görseli"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={['-10%', '2%']} className="-mt-2">
              {PROJECT_IMAGES_3.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow-2xl shadow-blue-500/10 border border-white/5"
                  src={imageUrl}
                  alt="Proje görseli"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[140px] rounded-full" />
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
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">
              Yeni projelere açık
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
            Hadi bir şey <span className="italic font-light text-blue-400">inşa edelim</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
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
          className="group block relative mb-6 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-transparent border border-blue-500/20 hover:border-blue-400/50 transition-all overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                <Mail className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
                  E-posta gönder
                </div>
                <div className="text-lg md:text-2xl font-bold text-white truncate">
                  {email}
                </div>
              </div>
            </div>
            <ArrowUpRight className="shrink-0 w-6 h-6 text-slate-400 group-hover:text-blue-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
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
          className="group block mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Phone className="w-5 h-5 text-slate-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  Telefon
                </div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {phone}
                </div>
              </div>
            </div>
            <ArrowUpRight className="shrink-0 w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
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
              className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-white/10 transition-all">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
                    {s.label}
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {s.handle}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="shrink-0 w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-widest text-slate-500"
        >
          <div>© {new Date().getFullYear()} Melik Bağrıyanık</div>
          <div className="font-bold text-slate-400">MELİK<span className="text-blue-400 italic">.AI</span></div>
        </motion.div>
      </div>
    </footer>
  );
};
