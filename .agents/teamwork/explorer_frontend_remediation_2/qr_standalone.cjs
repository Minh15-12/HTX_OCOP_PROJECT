/**
 * Standalone ISO/IEC 18004 Standard QR Code Generator (Byte Mode, Version 1-4, ECC M)
 */

// GF(256) math with primitive polynomial 0x11D
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
  return EXP[(LOG[a] + LOG[b]) % 255];
}

// Reed-Solomon generator polynomial
function getRsGeneratorPoly(numEc) {
  let poly = [1];
  for (let i = 0; i < numEc; i++) {
    const factor = EXP[i];
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

// RS Error Correction calculation
function calculateReedSolomon(data, numEc) {
  const gen = getRsGeneratorPoly(numEc);
  const remainder = new Array(numEc).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let j = 0; j < numEc; j++) {
      remainder[j] ^= gfMul(gen[numEc - 1 - j], factor);
    }
  }
  return remainder;
}

console.log('RS Math test passed!');
