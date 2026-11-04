# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## Project overview

A practice workspace for bit manipulation and mock interview exercises. It has no dependencies and no build step. Tests use Node's built-in `node:test`.

## Running

```sh
node <file>.js
node --test        # runs *.test.js files
```

## Conventions

- Each exercise is one small, pure function with a one-line doc comment.
- JavaScript bitwise operators work on 32-bit signed integers. Functions assume integer inputs within that range. Use `BigInt` if larger values are needed.
