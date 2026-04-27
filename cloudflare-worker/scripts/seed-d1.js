const fs = require('fs');
const path = require('path');

const flagsDir = './flags';
const outputFile = './migrations/0002_seed_flags.sql';

const files = fs.readdirSync(flagsDir).filter((f) => f.endsWith('.png'));

const statements = files.map((file) => {
	const code = path.basename(file, '.png').toUpperCase();
	return `INSERT OR REPLACE INTO flags (country_code, r2_key) VALUES ('${code}', '${code}.png');`;
});

fs.writeFileSync(outputFile, statements.join('\n'));
console.log(`Generated ${statements.length} inserts → ${outputFile}`);
