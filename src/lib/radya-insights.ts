// Snapshot MANUAL dari Instagram Insights @radyalabs (bukan live API).
// Periode: 30 hari, 18 Agu – 17 Sep. Dicatat Sep 2026.
// Hanya mencakup apa yang terlihat di screenshot: overview, audience, top content.
// LinkedIn BELUM termasuk. Brand lain BELUM termasuk.

export const RADYA_IG_SNAPSHOT = {
  account: 'radyalabs',
  platform: 'instagram' as const,
  periodLabel: '30 hari · 18 Agu – 17 Sep',
  recordedAt: 'Sep 2026',
  note: 'Snapshot manual dari Instagram Insights (bukan fetch live API)',

  overview: {
    followers: 628,
    followersDelta: '+1.9% since Aug 17',
    views: 13266,
    netFollowers: 12,
    interactions: 138,
    viewers: 1347,
    followerShare: 36.2,
    nonFollowerShare: 63.8,
  },

  viewsByType: [
    { label: 'Posts', value: 9300, display: '9.3K' },
    { label: 'Stories', value: 3100, display: '3.1K' },
    { label: 'Reels', value: 781, display: '781' },
    { label: 'Live videos', value: 0, display: '0' },
  ],

  interactionsByType: [
    { label: 'Posts', value: 127 },
    { label: 'Reels', value: 7 },
    { label: 'Stories', value: 4 },
    { label: 'Live videos', value: 0 },
  ],

  profileActivity: [
    { label: 'Profile visits', value: 380 },
    { label: 'Bio link taps', value: 20 },
    { label: 'Business address taps', value: 0 },
  ],

  audience: {
    gender: [
      { label: 'Men', value: 75.5 },
      { label: 'Women', value: 24.5 },
    ],
    ageRange: [
      { label: '13–17', value: 0 },
      { label: '18–24', value: 19.1 },
      { label: '25–34', value: 48.9 },
      { label: '35–44', value: 22.9 },
      { label: '45–54', value: 7.3 },
      { label: '55–64', value: 1.0 },
      { label: '65+', value: 0.8 },
    ],
    topCountries: [
      { label: 'Indonesia', value: 98.6 },
      { label: 'Singapore', value: 0.3 },
      { label: 'United States', value: 0.2 },
      { label: 'Cambodia', value: 0.2 },
      { label: 'France', value: 0.2 },
    ],
    activeTimes: {
      timezone: 'GMT+7',
      summary: ['Tuesdays · 6 PM – 9 PM', 'Wednesdays · 6 PM – 9 PM', 'Fridays · 6 PM – 9 PM'],
    },
  },

  // Konten dengan angka views/likes/comments/shares yang terbaca jelas.
  // "shares" = ikon segitiga (shares/sends). Repost tidak tersedia (–).
  topContent: [
    { title: 'Dunia industri terus bergerak…', age: '2w', views: '4.6K', viewsNum: 4600, likes: 68, comments: 1, shares: 4 },
    { title: 'THE NEXT BIG THING IS R…', age: '4w', views: '3.5K', viewsNum: 3500, likes: 43, comments: 0, shares: 5 },
    { title: "WE'RE HIRING AT RADYA L…", age: '2w', views: '1.8K', viewsNum: 1800, likes: 19, comments: 0, shares: 15 },
    { title: 'STARTUP CAFE #62 IS HE…', age: '2d', views: '1.5K', viewsNum: 1500, likes: 28, comments: 0, shares: 1 },
    { title: 'STARTUP CAFE #64 IS H…', age: '20h', views: '1.3K', viewsNum: 1300, likes: 36, comments: 0, shares: 1 },
    { title: 'STARTUP CAFE #63 IS HE…', age: '1d', views: '1.0K', viewsNum: 1000, likes: 16, comments: 0, shares: 0 },
    { title: 'Siap kerja belum tentu siap m…', age: '1w', views: '1.0K', viewsNum: 1000, likes: 8, comments: 0, shares: 1 },
    { title: 'Karyawan nggak selalu pergi k…', age: '4d', views: '695', viewsNum: 695, likes: 2, comments: 0, shares: 1 },
    { title: 'Perkembangan AI yang pesat …', age: '3w', views: '581', viewsNum: 581, likes: 5, comments: 0, shares: 0 },
  ],
};
