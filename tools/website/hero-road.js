// Prints the hero road's no-JS markup (parked), from the same code site.js draws with.
// node tools/website/hero-road.js website/assets/site.js  → paste inside <g class="rd-live"> in index.html
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const start = src.indexOf('  var ROAD = (function () {');
const end = src.indexOf('  })();', start) + '  })();'.length;
const ROAD = new Function('clamp', src.slice(start, end) + '\nreturn ROAD;')((v, a, b) => (v < a ? a : v > b ? b : v));
class Node {
  constructor(name, cls) { this.name = name; this.attrs = { class: cls }; this.kids = []; }
  setAttribute(k, v) { this.attrs[k] = v; }
  toString() {
    const a = Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
    return this.kids.length ? `<${this.name}${a}>${this.kids.join('')}</${this.name}>` : `<${this.name}${a}/>`;
  }
}
const root = new Node('g', 'rd-live');
const make = (name, cls, parent) => { const n = new Node(name, cls); (parent || root).kids.push(n); return n; };
const shapes = ROAD.build(root, make);
ROAD.draw(shapes, 0, ROAD.PARKED, 0);
process.stdout.write(root.kids.join(''));
