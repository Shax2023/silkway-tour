const fs = require('fs');

let code = fs.readFileSync('D:/Loyiha/scratch/generate_final_timeline.js', 'utf8');

// Fix match patterns
code = code.replace(/match:\s*\[\s*["']go["'],[^\]]+\]/, 'match: ["go\'ri amir", "gori amir", "gur-e-amir", "guri amir"]');
code = code.replace(/match:\s*\[\s*["']yog["'],[^\]]+\]/, 'match: ["yog\'och o\'ymakorligi", "xiva gilamlari ustaxonasida"]');
code = code.replace(/match:\s*\[\s*["']xorazm lazgisi["'],\s*["']olovlar va mash["']\]/, 'match: ["xorazm lazgisi", "lazgi", "olovlar va mash\'allar"]');
code = code.replace(/match:\s*\[\s*["']islom xo["'],[^\]]+\]/, 'match: ["islom xo\'ja", "islom xoja", "eng baland minora"]');
code = code.replace(/match:\s*\[\s*["']tosh hovli["'],\s*["']saroyi["'],[^\]]+\]/, 'match: ["tosh hovli", "xonning tosh saroyi", "tash-xauli"]');
code = code.replace(/match:\s*\[\s*["']juma masjidi["'],\s*["']218 ta["'],\s*["']oymakor[^\]]+\]/, 'match: ["juma masjidi", "218 ta", "o\'ymakor yog\'och ustun"]');
code = code.replace(/match:\s*\[\s*["']ko["'],[^\]]+\]/, 'match: ["ko\'hna ark", "kuhna ark", "muhammad amin-xon"]');
code = code.replace(/match:\s*\[\s*["']konigil["'],\s*["']ipak qog["'],[^\]]+\]/, 'match: ["konigil", "ipak qog\'oz", "tut po\'stlog\'i"]');
code = code.replace(/match:\s*\[\s*["']tandir go["'],[^\]]+\]/, 'match: ["tandir go\'shti", "tandirda pishirilgan"]');
code = code.replace(/match:\s*\[\s*["']ulug["'],[^\]]+\]/, 'match: ["ulug\'bek rasadxonasi", "ulugbek rasadxonasi", "sekstant muzeyi"]');
code = code.replace(/match:\s*\[\s*["']qadimiy me["'],[^\]]+\]/, 'match: ["qadimiy me\'moriy obidalari", "tarixiy obidalari"]');
code = code.replace(/match:\s*\[\s*["']esdalik sovg["'],[^\]]+\]/, 'match: ["esdalik sovg\'alari", "suvenirlar", "sharq bozori"]');

fs.writeFileSync('D:/Loyiha/scratch/generate_final_timeline.js', code, 'utf8');
console.log('clean_match_patterns completed successfully');
