import { Brand } from './types';

export const BRANDS: Record<string, Brand> = {
  radya: {
    id: 'b1',
    slug: 'radya',
    name: 'Radya Labs',
    audienceSummary: 'Large enterprises, corporations, and governments (explicitly NOT SMEs).',
    toneContext: 'Mission-critical systems specialist for national-scale, regulated, high-stakes systems (govt, banking, pharma, energy). Tone should read credible and due-diligence-ready, not hypey.',
    themeGrad: 'linear-gradient(135deg, #0F172A 0%, #1793E8 65%, #29B6F6 100%)',
    quickPrompts: [
      'Partnership with ITB on AI engineering training',
      'High-concurrency cloud scaling for national exams (ANBK)',
      'Governed Agentic AI architectures for regulated banking'
    ],
    defaultPrompt: 'Announce our partnership with ITB on advanced enterprise AI training'
  },
  alkademi: {
    id: 'b2',
    slug: 'alkademi',
    name: 'Alkademi',
    audienceSummary: 'Tech students and fresh university graduates.',
    toneContext: 'Approachable, educational, and inspiring stepping-stone into real-world software engineering careers. Distinct from the enterprise Radya Labs voice.',
    themeGrad: 'linear-gradient(135deg, #042f2e 0%, #1FA579 60%, #43D3A4 100%)',
    quickPrompts: [
      'October Bootcamp cohort registration open',
      'Day in the life of a junior full-stack developer',
      'Top 3 code review habits senior engineers look for'
    ],
    defaultPrompt: 'Announce open enrollment for the October tech mentorship cohort'
  },
  jangkau: {
    id: 'b3',
    slug: 'jangkau',
    name: 'Jangkau',
    audienceSummary: 'UMKM / SME business owners in Indonesia.',
    toneContext: 'Practical, benefit-driven, focused on customer chat automation and revenue growth for the chatbot SaaS product.',
    themeGrad: 'linear-gradient(135deg, #451a03 0%, #C17F1B 60%, #E9A23B 100%)',
    quickPrompts: [
      'Automate midnight customer orders on WhatsApp',
      'Instant catalog responses via Instagram DM integration',
      '5 ways AI chatbots save 4 hours of admin daily'
    ],
    defaultPrompt: 'Explain how 24/7 automated chat prevents lost sales during midnight hours'
  },
  sinaptik: {
    id: 'b4',
    slug: 'sinaptik',
    name: 'Sinaptik',
    audienceSummary: 'Corporate training stakeholders and enterprise leadership.',
    toneContext: 'Operates for corporate training only, framed as portfolio-building rather than demand generation. Low-key and professional in tone.',
    themeGrad: 'linear-gradient(135deg, #1e1b4b 0%, #4E3AA8 60%, #EC008C 120%)',
    quickPrompts: [
      'Corporate AI governance workshop completion recap',
      'Enterprise technical competency roadmap framework',
      'Executive briefing on machine learning compliance'
    ],
    defaultPrompt: 'Share documentation from our recent executive AI governance workshop'
  }
};

export const HISTORICAL_POSTS = [
  { id: 'h1', date: 'Aug 30, 2026', format: 'Carousel' as const, topic: 'Company update carousel — engineering culture & scalable architectures', thumbClass: 'from-sky-900 to-blue-600' },
  { id: 'h2', date: 'Aug 28, 2026', format: 'Carousel' as const, topic: 'Repost — Direktorat PPB ITB partnership announcement', thumbClass: 'from-sky-900 to-blue-600' },
  { id: 'h3', date: 'Aug 24, 2026', format: 'Video' as const, topic: '"AI Learning & Development" enterprise briefing', thumbClass: 'from-slate-900 to-teal-600' },
  { id: 'h4', date: 'Aug 20, 2026', format: 'Photo' as const, topic: 'RuangCipta by Radya Labs — launch poster', thumbClass: 'from-slate-900 to-pink-600' },
  { id: 'h5', date: 'Aug 15, 2026', format: 'Video' as const, topic: '"Agent vs Chatbot: Apa bedanya?" architecture breakdown', thumbClass: 'from-slate-900 to-teal-600' },
  { id: 'h6', date: 'Aug 12, 2026', format: 'Video' as const, topic: '"AI in Talent Management" implementation spotlight', thumbClass: 'from-slate-900 to-teal-600' },
  { id: 'h7', date: 'Aug 11, 2026', format: 'Carousel' as const, topic: 'Company update carousel — 2026 mid-year review', thumbClass: 'from-sky-900 to-blue-600' },
  { id: 'h8', date: 'Aug 10, 2026', format: 'Photo' as const, topic: 'Product & interface design snapshot — mission critical console', thumbClass: 'from-slate-900 to-pink-600' },
  { id: 'h9', date: 'Aug 3, 2026', format: 'Video' as const, topic: '"AI Cost Optimization for Enterprise" technical teardown', thumbClass: 'from-slate-900 to-teal-600' },
  { id: 'h10', date: 'Jul 29, 2026', format: 'Carousel' as const, topic: 'Company update carousel — national infrastructure partners', thumbClass: 'from-sky-900 to-blue-600' }
];
