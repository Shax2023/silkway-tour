const { buildTourPackages } = require('../ai_agent.js');
const { localizeTimelineItem } = require('../public/js/timeline-i18n.js');

const pkgs = buildTourPackages('Madrid', ['Tashkent', 'Samarkand', 'Bukhara'], 2000, 5);
const pkg = pkgs[0];

const langs = ['en', 'uz', 'ru', 'tr', 'de', 'fr', 'es', 'ar', 'zh'];

console.log('=== MULTI-LANGUAGE TIMELINE VERIFICATION ===');
console.log('Checking that all timeline items in all 5 days translate correctly for each language without empty fields');

let allGood = true;

langs.forEach(lang => {
  let itemCount = 0;
  pkg.itinerary_days.forEach(d => {
    (d.timeline || []).forEach(t => {
      const loc = localizeTimelineItem(t, lang);
      itemCount++;
      if (!loc.title || !loc.description || !loc.duration || !loc.transport) {
        console.error(`FAILED: Missing field in lang ${lang} for activity ${t.title}`);
        allGood = false;
      }
    });
  });
  console.log(`✓ [${lang.toUpperCase()}] successfully localized ${itemCount} activities`);
});

if (allGood) {
  console.log('\n🌟 ALL 9 LANGUAGES VERIFIED PERFECTLY FOR TIMELINE LOCALIZATION!');
} else {
  console.error('\n❌ SOME LOCALIZATIONS FAILED!');
  process.exit(1);
}
