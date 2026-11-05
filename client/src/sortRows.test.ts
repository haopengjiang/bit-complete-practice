import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareCells, isNumericCell, sortKeyedRows, sortRows, withKeys } from './sortRows.ts'

type Row = Record<string, string>
const col = (rows: Row[], key: string) => rows.map((r) => r[key])

test('sorts numeric cells numerically, not as text', () => {
  const rows = [{ id: '10' }, { id: '2' }, { id: '1' }, { id: '-3' }, { id: '2.5' }]
  assert.deepEqual(col(sortRows(rows, 'id', 'asc'), 'id'), ['-3', '1', '2', '2.5', '10'])
  assert.deepEqual(col(sortRows(rows, 'id', 'desc'), 'id'), ['10', '2.5', '2', '1', '-3'])
})

test('treats numbers with surrounding whitespace as numbers', () => {
  const rows = [{ n: ' 10 ' }, { n: '9' }]
  assert.deepEqual(col(sortRows(rows, 'n', 'asc'), 'n'), ['9', ' 10 '])
})

test('sorts text case-insensitively', () => {
  const rows = [{ name: 'bob' }, { name: 'Alice' }, { name: 'carol' }]
  assert.deepEqual(col(sortRows(rows, 'name', 'asc'), 'name'), ['Alice', 'bob', 'carol'])
})

test('orders digits inside text naturally (item2 before item10)', () => {
  const rows = [{ v: 'item10' }, { v: 'item2' }]
  assert.deepEqual(col(sortRows(rows, 'v', 'asc'), 'v'), ['item2', 'item10'])
})

test('puts numbers before text in a mixed column (ascending)', () => {
  const rows = [{ v: 'n/a' }, { v: '5' }, { v: 'abc' }, { v: '1' }]
  assert.deepEqual(col(sortRows(rows, 'v', 'asc'), 'v'), ['1', '5', 'abc', 'n/a'])
})

test('keeps empty and whitespace-only cells last in both directions', () => {
  const rows = [{ v: '' }, { v: 'b' }, { v: '  ' }, { v: 'a' }]
  assert.deepEqual(col(sortRows(rows, 'v', 'asc'), 'v'), ['a', 'b', '', '  '])
  assert.deepEqual(col(sortRows(rows, 'v', 'desc'), 'v'), ['b', 'a', '', '  '])
})

test('does not treat "" as the number 0', () => {
  const rows = [{ v: '' }, { v: '-1' }, { v: '0' }]
  assert.deepEqual(col(sortRows(rows, 'v', 'asc'), 'v'), ['-1', '0', ''])
})

test('is stable: equal values keep their original order in both directions', () => {
  const rows = [
    { role: 'Engineer', name: 'A' },
    { role: 'Analyst', name: 'B' },
    { role: 'Engineer', name: 'C' },
  ]
  assert.deepEqual(col(sortRows(rows, 'role', 'asc'), 'name'), ['B', 'A', 'C'])
  assert.deepEqual(col(sortRows(rows, 'role', 'desc'), 'name'), ['A', 'C', 'B'])
})

test('does not mutate the input array', () => {
  const rows = [{ id: '2' }, { id: '1' }]
  const copy = structuredClone(rows)
  const sorted = sortRows(rows, 'id', 'asc')
  assert.deepEqual(rows, copy)
  assert.notEqual(sorted, rows)
})

test('a missing key sorts like an empty cell', () => {
  const rows: Row[] = [{ id: '1' }, { id: '2', x: 'z' }]
  assert.deepEqual(col(sortRows(rows, 'x', 'asc'), 'id'), ['2', '1'])
})

// --- Stable row keys: record the original position before sorting -----------

test('withKeys tags each row with its original position, wrapping (not copying) the row', () => {
  const rows = [{ id: 'a' }, { id: 'b' }]
  const keyed = withKeys(rows)
  assert.deepEqual(keyed, [
    { key: 0, row: { id: 'a' } },
    { key: 1, row: { id: 'b' } },
  ])
  assert.equal(keyed[0]!.row, rows[0]) // same object
})

test('withKeys does not add fields to the row objects', () => {
  const rows = [{ id: '1', name: 'A' }]
  withKeys(rows)
  assert.deepEqual(Object.keys(rows[0]!), ['id', 'name'])
})

test('sortKeyedRows keeps each original key with its row after sorting', () => {
  const rows = [{ id: '10' }, { id: '' }, { id: '2' }, { id: '1' }]
  const keyed = withKeys(rows)

  const asc = sortKeyedRows(keyed, 'id', 'asc')
  assert.deepEqual(asc.map((k) => k.key), [3, 2, 0, 1])
  assert.deepEqual(sortKeyedRows(keyed, 'id', 'desc').map((k) => k.key), [0, 2, 3, 1])
  for (const k of asc) assert.equal(k.row, rows[k.key]) // key still points at the same row
})

test('sortKeyedRows does not mutate its input and handles an empty table', () => {
  const keyed = withKeys([{ id: '2' }, { id: '1' }])
  sortKeyedRows(keyed, 'id', 'asc')
  assert.deepEqual(keyed.map((k) => k.key), [0, 1])
  assert.deepEqual(sortKeyedRows([], 'id', 'asc'), [])
})

test('isNumericCell accepts plain decimals only', () => {
  for (const s of ['0', '-3', '+4', '2.5', '.5', ' 10 ']) assert.equal(isNumericCell(s), true, s)
  for (const s of ['', '  ', '1,200', '12px', '0x10', '1e3', 'abc', '-', '.']) {
    assert.equal(isNumericCell(s), false, s)
  }
})

test('compareCells compares numbers by value', () => {
  assert.ok(compareCells('2', '10') < 0)
  assert.ok(compareCells('10', '2') > 0)
  assert.equal(compareCells('1.0', '1'), 0)
})
