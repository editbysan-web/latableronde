// Presentation regression checks; no network or account required.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../hear-me-out.js'), 'utf8');
const helpers = source.slice(source.indexOf('  const escape ='), source.indexOf('  const button ='));
const {choiceTitle, posterCaption} = vm.runInNewContext(`${helpers}\n({choiceTitle,posterCaption})`);
assert.equal(choiceTitle({pseudo:'Thomas',title:''}), 'Voici ce que Thomas a trouvé');
assert.equal(choiceTitle({pseudo:'Alice',title:'   '}), 'Voici ce que Alice a trouvé');
assert.equal(choiceTitle({pseudo:'Thomas',title:'Mon choix'}), 'Voici ce que Thomas a trouvé');
assert.equal(choiceTitle({pseudo:'Thomas',title:'Shrek'}), 'Shrek');
const card = posterCaption({pseudo:'Thomas',title:'',theme:'Personnages de films'});
assert.ok(card.includes('Personnages de films'));
assert.ok(card.includes('Voici ce que Thomas a trouvé'));
const escaped = posterCaption({pseudo:'<img>',title:'<script>',theme:'<svg>'});
assert.ok(!escaped.includes('<script>') && !escaped.includes('<svg>') && !escaped.includes('<img>'));
assert.ok(source.includes('c.fillText(ch.theme'));
assert.ok(source.includes('class="hmo-vote-theme"'));
console.log('PASS: named fallback, whitespace, legacy default, custom title, poster theme, escaping, PNG theme, voting theme.');
