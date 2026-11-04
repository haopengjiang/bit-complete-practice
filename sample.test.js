const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPowerOfTwo,
  countSetBits,
  getBit,
  setBit,
  clearBit,
  toggleBit,
} = require("./sample.js");

test("isPowerOfTwo", () => {
  for (const n of [1, 2, 16, 1024]) assert.equal(isPowerOfTwo(n), true, `${n}`);
  for (const n of [0, -4, 3, 12]) assert.equal(isPowerOfTwo(n), false, `${n}`);
});

test("countSetBits", () => {
  assert.equal(countSetBits(0), 0);
  assert.equal(countSetBits(1), 1);
  assert.equal(countSetBits(0b1011), 3);
  assert.equal(countSetBits(255), 8);
});

test("getBit", () => {
  assert.equal(getBit(0b1011, 0), 1);
  assert.equal(getBit(0b1011, 2), 0);
  assert.equal(getBit(0b1011, 3), 1);
});

test("setBit", () => {
  assert.equal(setBit(0b1011, 2), 0b1111);
  assert.equal(setBit(0b1011, 0), 0b1011); // already set
});

test("clearBit", () => {
  assert.equal(clearBit(0b1011, 0), 0b1010);
  assert.equal(clearBit(0b1011, 2), 0b1011); // already clear
});

test("toggleBit", () => {
  assert.equal(toggleBit(0b1011, 3), 0b0011);
  assert.equal(toggleBit(toggleBit(0b1011, 1), 1), 0b1011); // toggle twice
});
