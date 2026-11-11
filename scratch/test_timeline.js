const agent = require('../ai_agent.js');
const timelineI18n = require('../public/js/timeline-i18n.js');

const packages = agent.buildTourPackages('Berlin', ['Tashkent', 'Samarkand', 'Bukhara'], 1500, 5);
const pkg = packages[0];

console.log('Testing packages:', packages.length);
console.log('Testing day 1 timeline in all 9 languages:');

const day1 = pkg.itinerary_days[0];
const sampleItem = day1.timeline[0]; // Airport arrival

console.log('Original Item:', sampleItem.title);
console.log('Original Duration:', sampleItem.duration);
console.log('Original Transport:', sampleItem.transport);
console.log('Original Location:', sampleItem.location);

const langs = ['en', 'uz', 'ru', 'tr', 'de', 'fr', 'es', 'ar', 'zh'];

langs.forEach(lang => {
  const loc = timelineI18n.localizeTimelineItem(sampleItem, lang);
  console.log(`\n--- [${lang.toUpperCase()}] ---`);
  console.log('Title:    ', loc.title);
  console.log('Duration: ', loc.duration);
  console.log('Transport:', loc.transport);
  console.log('Location: ', loc.location);
  console.log('Desc:     ', loc.description.substring(0, 80) + '...');
});

console.log('\n\n--- Testing all 5 days for Russian (RU) ---');
pkg.itinerary_days.forEach(d => {
  console.log(`\nDay ${d.day_number} (${d.city}):`);
  d.timeline.forEach(t => {
    const loc = timelineI18n.localizeTimelineItem(t, 'ru');
    console.log(`  [${t.time}] ${loc.title} | ⏱ ${loc.duration} | 🚗 ${loc.transport}`);
  });
});

console.log('\n\n--- Testing all 5 days for English (EN) ---');
pkg.itinerary_days.forEach(d => {
  console.log(`\nDay ${d.day_number} (${d.city}):`);
  d.timeline.forEach(t => {
    const loc = timelineI18n.localizeTimelineItem(t, 'en');
    console.log(`  [${t.time}] ${loc.title} | ⏱ ${loc.duration} | 🚗 ${loc.transport}`);
  });
});
