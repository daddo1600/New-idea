// Prints the hero road's no-JS markup (the standard scene, parked), from the same code site.js draws with.
// node tools/website/hero-road.js website/assets/site.js  → paste inside <g class="rd-live"> in index.html
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const start = src.indexOf('  var ROAD = (function () {');
const end = src.indexOf('  })();', start) + '  })();'.length;
const ROAD = new Function('clamp', src.slice(start, end) + '\nreturn ROAD;')((v, a, b) => (v < a ? a : v > b ? b : v));
class Node {
  constructor(name, cls, inner) { this.name = name; this.attrs = { class: cls }; this.kids = []; this.inner = inner || ''; }
  setAttribute(k, v) { this.attrs[k] = v; }
  toString() {
    const a = Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
    const body = this.kids.join('') + this.inner;
    return body ? `<${this.name}${a}>${body}</${this.name}>` : `<${this.name}${a}/>`;
  }
}
const root = new Node('g', 'rd-live');
const make = (name, cls, parent, inner) => { const n = new Node(name, cls, inner); (parent || root).kids.push(n); return n; };
const shapes = ROAD.build(root, null, make);
ROAD.draw(shapes, 0, ROAD.PARKED, 0);
process.stdout.write(root.kids.join(''));
