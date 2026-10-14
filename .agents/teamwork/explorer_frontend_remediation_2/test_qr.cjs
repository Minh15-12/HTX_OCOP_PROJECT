// Test Reed-Solomon generator polynomial and encoding
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  EXP[i + 255] = x;
  LOG[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

// Generate generator polynomial for ECC
// g(x) = (x - 2^0)(x - 2^1)...(x - 2^(k-1))
function getGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const factor = EXP[i];
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  // poly has highest power at poly[poly.length - 1] = 1
  return poly;
}

// For Version 1-M: 16 data codewords, 10 EC codewords
const gen10 = getGeneratorPoly(10);
console.log('Degree 10 gen poly length:', gen10.length);
console.log('Degree 10 coefficients (low to high):', gen10);
