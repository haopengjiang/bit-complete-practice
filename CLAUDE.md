# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## Project overview

A small practice project for bit manipulation exercises. It has no dependencies and no build step. Tests use Node's built-in `node:test`.

## Files

- `sample.js`: the main version. It defines bit helpers (`isPowerOfTwo`, `countSetBits`, `getBit`, `setBit`, `clearBit`, `toggleBit`) and prints a demo when run.
- `sample.py`: an older Python version of the same exercises.

## Running

```sh
node sample.js
python sample.py
node --test        # runs sample.test.js
```

## Conventions

- Each exercise is one small, pure function with a one-line doc comment.
- The demo output at the bottom of the file shows binary values with `bin()` (JS) or `:04b` (Python).
- JavaScript bitwise operators work on 32-bit signed integers. Functions assume integer inputs within that range. Use `BigInt` if larger values are needed.
- Keep the JS and Python versions in sync when adding exercises, unless told otherwise.
