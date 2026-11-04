// Sample file: a few basic bit manipulation exercises.

/** True if n is a positive power of two. */
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/** Count the 1 bits in a non-negative integer. */
function countSetBits(n) {
  let count = 0;
  while (n) {
    n &= n - 1; // clear the lowest set bit
    count++;
  }
  return count;
}

/** Return bit i of n (0 or 1). */
function getBit(n, i) {
  return (n >> i) & 1;
}

/** Return n with bit i set to 1. */
function setBit(n, i) {
  return n | (1 << i);
}

/** Return n with bit i set to 0. */
function clearBit(n, i) {
  return n & ~(1 << i);
}

/** Return n with bit i flipped. */
function toggleBit(n, i) {
  return n ^ (1 << i);
}

module.exports = { isPowerOfTwo, countSetBits, getBit, setBit, clearBit, toggleBit };

if (require.main === module) {
  const bin = (n) => n.toString(2).padStart(4, "0");

  const x = 0b1011; // 11
  console.log(`x = ${x} (${bin(x)})`);
  console.log("isPowerOfTwo(16):", isPowerOfTwo(16));
  console.log("countSetBits(x): ", countSetBits(x));
  console.log("getBit(x, 2):    ", getBit(x, 2));
  console.log("setBit(x, 2):    ", bin(setBit(x, 2)));
  console.log("clearBit(x, 0):  ", bin(clearBit(x, 0)));
  console.log("toggleBit(x, 3): ", bin(toggleBit(x, 3)));
}
