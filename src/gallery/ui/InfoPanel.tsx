import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.048c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.268 2.37 4.268 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import type { TargetMeta } from '../interaction';
import {
  PAINTINGS,
  TECHS,
  ABOUT,
  CONTACT,
  EXPERIENCES,
  EDUCATION,
  LANGUAGES,
  ROOMS_INFO,
  GUESTBOOK,
} from '../data';

interface InfoPanelProps {
  meta: TargetMeta | null;
  onClose: () => void;
}

function PanelShell({
  children,
  onClose,
  eyebrow,
}: {
  children: React.ReactNode;
  onClose: () => void;
  eyebrow: string;
}) {
  // Mobilde paneli açan dokunuşun ürettiği hayalet "click" (~300ms sonra gelir)
  // dış-tıklama katmanına düşüp paneli anında kapatıyordu. Panel ilk 350ms
  // boyunca "silahsız": dış tıklama yok sayılır, panel etkileşimi kapalı.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Panel dışına tıklayınca kapat */}
      <div className="fixed inset-0 z-40" onClick={armed ? onClose : undefined} />
      <motion.aside
        initial={{ x: 480, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 480, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        style={{ pointerEvents: armed ? 'auto' : 'none' }}
        className="fixed right-4 top-4 bottom-4 z-50 w-[min(420px,calc(100vw-2rem))] flex flex-col rounded-3xl bg-white/90 backdrop-blur-2xl border border-stone-200 shadow-2xl shadow-gold-700/10 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-700">
            {eyebrow}
          </span>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">{children}</div>
        <div className="px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors"
          >
            ← Galeriye Dön
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 bg-cream-100 rounded-md text-[10px] font-bold tracking-wider text-stone-600 border border-stone-200">
      {children}
    </span>
  );
}

function LinkButton({
  href,
  primary,
  icon,
  children,
}: {
  href: string;
  primary?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
        primary
          ? 'bg-gold-500 text-white hover:bg-gold-600 shadow-lg shadow-gold-500/25'
          : 'bg-white border border-stone-200 text-stone-800 hover:border-gold-400'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {children}
      </span>
      <ArrowUpRight size={16} />
    </a>
  );
}

function ProjectContent({ id }: { id: string }) {
  const entry = PAINTINGS.find((p) => p.project.id === id);
  if (!entry) return null;
  const { project } = entry;

  return (
    <div>
      {project.image && (
        <div className="rounded-2xl overflow-hidden border border-stone-200 mb-5 shadow-sm">
          <img src={project.image} alt={project.title} className="w-full aspect-video object-cover" />
        </div>
      )}
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900">
        {project.title}
      </h2>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700 mt-1 mb-5">
        {project.subtitle} · {project.year}
      </p>
      <p className="text-stone-600 leading-relaxed text-[15px] mb-6">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {project.tech.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {project.live && (
          <LinkButton href={project.live} primary icon={<ArrowUpRight size={16} />}>
            Canlı Siteyi Gör
          </LinkButton>
        )}
        {project.github && (
          <LinkButton href={project.github} icon={<GithubIcon size={16} />}>
            GitHub — Kaynak Kod
          </LinkButton>
        )}
        {project.note && (
          <p className="text-[12px] italic text-stone-400 leading-relaxed px-1">{project.note}</p>
        )}
      </div>
    </div>
  );
}

function ExperienceContent({ id }: { id: string }) {
  const exp = EXPERIENCES.find((e) => e.id === id);
  if (!exp) return null;

  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900">
        {exp.company}
      </h2>
      <p className="text-sm font-bold text-stone-700 mt-1">{exp.role}</p>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700 mt-1 mb-6">
        {exp.period} · {exp.location}
      </p>
      <ul className="space-y-3 mb-8">
        {exp.bullets.map((b) => (
          <li key={b} className="flex gap-3 text-stone-600 leading-relaxed text-[14px]">
            <span className="text-gold-500 shrink-0 mt-0.5">◆</span>
            {b}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {exp.tech.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
    </div>
  );
}

function EducationContent() {
  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-6">
        Eğitim
      </h2>
      <div className="space-y-5 mb-8">
        {EDUCATION.map((item) => (
          <div key={item.school} className="pb-5 border-b border-stone-100 last:border-0">
            <div className="font-bold text-stone-900">{item.school}</div>
            <div className="text-sm text-stone-600 mt-0.5">{item.degree}</div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-gold-700 mt-1">
              {item.period}
              {item.note ? ` · ${item.note}` : ''}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-3">
        Diller
      </div>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <Chip key={l}>{l}</Chip>
        ))}
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all';

function GuestbookContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const canSend = name.trim().length >= 2 && message.trim().length >= 5 && status !== 'sending';

  const submit = async () => {
    if (!canSend) return;
    setStatus('sending');
    try {
      const res = await fetch(GUESTBOOK.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || 'belirtilmedi',
          message: message.trim(),
          _subject: `Galeri Ziyaretçi Defteri — ${name.trim()}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center text-center pt-10">
        <div className="w-16 h-16 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-3xl mb-6">
          ✒️
        </div>
        <h2 className="text-2xl font-display font-black tracking-tight text-stone-900 mb-3">
          Deftere yazıldı!
        </h2>
        <p className="text-stone-600 text-[15px] leading-relaxed max-w-xs">
          Mesajın bana ulaştı{name ? `, ${name.split(' ')[0]}` : ''}. Ziyaretin ve notun için
          teşekkürler — en kısa sürede dönüş yapacağım.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-2">
        Ziyaretçi Defteri
      </h2>
      <p className="text-stone-600 text-[14px] leading-relaxed mb-6">
        Galeriyi gezdiğin için teşekkürler! Bir not bırak — mesajın doğrudan bana ulaşır.
      </p>
      <div className="flex flex-col gap-3">
        <input
          className={inputCls}
          placeholder="Adın *"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputCls}
          type="email"
          placeholder="E-posta (dönüş için, isteğe bağlı)"
          value={email}
          maxLength={120}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className={`${inputCls} resize-none h-32`}
          placeholder="Mesajın *"
          value={message}
          maxLength={1000}
          onChange={(e) => setMessage(e.target.value)}
        />
        {status === 'error' && (
          <p className="text-[12px] text-red-500 leading-relaxed">
            Gönderilemedi — bağlantını kontrol edip tekrar dene, ya da{' '}
            <a className="underline font-bold" href={`mailto:${CONTACT.email}`}>
              doğrudan e-posta gönder
            </a>
            .
          </p>
        )}
        <button
          onClick={submit}
          disabled={!canSend}
          className={`mt-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
            canSend
              ? 'bg-gold-500 text-white hover:bg-gold-600 shadow-lg shadow-gold-500/25'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {status === 'sending' ? 'Gönderiliyor…' : 'Deftere Yaz ✒️'}
        </button>
      </div>
    </div>
  );
}

function GuideContent() {
  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-4">
        Sergi Planı
      </h2>
      <p className="text-stone-600 leading-relaxed text-[15px] mb-6">
        Galeri beş bölümden oluşuyor. Duvarlardaki eserlerin ve heykellerin önünde durup
        tıklayarak detayları inceleyebilirsin.
      </p>
      <div className="space-y-3">
        {ROOMS_INFO.map((room) => (
          <div
            key={room.name}
            className="p-4 rounded-xl bg-white border border-stone-200"
          >
            <div className="font-bold text-stone-900 text-sm">{room.name}</div>
            <div className="text-xs text-stone-500 mt-0.5">{room.blurb}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechContent({ id }: { id: string }) {
  const tech = TECHS.find((t) => t.id === id);
  if (!tech) return null;

  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-4">
        {tech.title}
      </h2>
      <p className="text-stone-600 leading-relaxed text-[15px] mb-6">{tech.blurb}</p>
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-3">
        Bu alandaki araçlarım
      </div>
      <div className="flex flex-wrap gap-2">
        {tech.skills.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-stone-200 mb-5 shadow-sm">
        <img
          src="/profile.jpeg"
          alt="Melik Bağrıyanık"
          className="w-full aspect-[4/5] object-cover object-top"
        />
      </div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-1">
        {ABOUT.name}
      </h2>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700 mb-5 flex items-center gap-1.5">
        <MapPin size={12} /> {ABOUT.location}
      </p>
      <p className="text-stone-600 leading-relaxed text-[15px] mb-8">{ABOUT.paragraph}</p>
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
        {ABOUT.stats.map(([num, label]) => (
          <div key={label}>
            <div className="text-2xl font-display font-black text-stone-900">{num}</div>
            <div className="text-[9px] uppercase tracking-widest text-stone-500 mt-1 font-semibold">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactContent() {
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Yeni Proje Sinyali')}`;
  return (
    <div>
      <h2 className="text-3xl font-display font-black tracking-tight text-stone-900 mb-4">
        Hadi bir şey <span className="italic font-light text-gold-600">inşa edelim</span>
      </h2>
      <p className="text-stone-600 leading-relaxed text-[15px] mb-8">
        Aklındaki fikri birlikte somutlaştıralım. Mesajını bırak, en kısa sürede dönüş yapayım.
      </p>
      <div className="flex flex-col gap-3">
        <LinkButton href={mailto} primary icon={<Mail size={16} />}>
          {CONTACT.email}
        </LinkButton>
        <LinkButton href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} icon={<Phone size={16} />}>
          {CONTACT.phone}
        </LinkButton>
        <LinkButton href={CONTACT.linkedin} icon={<LinkedinIcon size={16} />}>
          LinkedIn
        </LinkButton>
        <LinkButton href={CONTACT.github} icon={<GithubIcon size={16} />}>
          GitHub
        </LinkButton>
      </div>
    </div>
  );
}

const EYEBROWS: Record<string, string> = {
  project: 'Eser · Proje Detayı',
  tech: 'Heykel · Teknoloji',
  about: 'Sanatçı',
  contact: 'İletişim',
  experience: 'Kariyer · Deneyim',
  education: 'Eğitim',
  guide: 'Sergi Planı',
  guestbook: 'Ziyaretçi Defteri',
};

export function InfoPanel({ meta, onClose }: InfoPanelProps) {
  return (
    <AnimatePresence>
      {meta && (
        <PanelShell key={meta.id} onClose={onClose} eyebrow={EYEBROWS[meta.kind] ?? ''}>
          {meta.kind === 'project' && <ProjectContent id={meta.id} />}
          {meta.kind === 'tech' && <TechContent id={meta.id} />}
          {meta.kind === 'about' && <AboutContent />}
          {meta.kind === 'contact' && <ContactContent />}
          {meta.kind === 'experience' && <ExperienceContent id={meta.id} />}
          {meta.kind === 'education' && <EducationContent />}
          {meta.kind === 'guide' && <GuideContent />}
          {meta.kind === 'guestbook' && <GuestbookContent />}
        </PanelShell>
      )}
    </AnimatePresence>
  );
}
