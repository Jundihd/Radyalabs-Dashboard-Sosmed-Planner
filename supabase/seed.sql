-- Seed Data for Radya Labs Social Media System (v1)

-- Seed Brands
insert into brands (slug, name, audience_summary, tone_context)
values
  (
    'radya',
    'Radya Labs',
    'Large enterprises, corporations, and governments (explicitly NOT SMEs).',
    'Mission-critical systems specialist for national-scale, regulated, high-stakes systems (govt, banking, pharma, energy). Tone should read credible and due-diligence-ready, not hypey.'
  ),
  (
    'alkademi',
    'Alkademi',
    'Tech students and fresh university graduates.',
    'Approachable, educational, and inspiring stepping-stone into real-world software engineering careers. Distinct from the enterprise Radya Labs voice.'
  ),
  (
    'jangkau',
    'Jangkau',
    'UMKM / SME business owners in Indonesia.',
    'Practical, benefit-driven, focused on customer chat automation and revenue growth for the chatbot SaaS product.'
  ),
  (
    'sinaptik',
    'Sinaptik',
    'Corporate training stakeholders and enterprise leadership.',
    'Operates for corporate training only, framed as portfolio-building rather than demand generation. Low-key and professional in tone.'
  )
on conflict (slug) do nothing;

-- Seed Default Users
insert into users (email, name, role)
values
  ('aloysius@radyalabs.com', 'Aloysius', 'approver'),
  ('arif@radyalabs.com', 'Arif', 'creator')
on conflict (email) do nothing;
