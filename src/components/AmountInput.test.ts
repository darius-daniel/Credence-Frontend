import { describe, it, expect } from 'vitest'
import { sanitizeUSDCInput, formatUSDC, normalizeUSDC } from './AmountInput'

describe('sanitizeUSDCInput', () => {
  it('passes through a valid decimal string', () => {
    expect(sanitizeUSDCInput('123.45')).toBe('123.45')
  })

  it('strips non-numeric, non-dot characters', () => {
    expect(sanitizeUSDCInput('abc123')).toBe('123')
    expect(sanitizeUSDCInput('$100.00')).toBe('100.00')
    expect(sanitizeUSDCInput('1,000.50')).toBe('1000.50')
  })

  it('truncates fraction to 2 decimal places', () => {
    expect(sanitizeUSDCInput('12.345')).toBe('12.34')
  })

  it('removes leading zeros from whole part', () => {
    expect(sanitizeUSDCInput('00123')).toBe('123')
    expect(sanitizeUSDCInput('00')).toBe('0')
  })

  it('keeps leading zero before a decimal point', () => {
    expect(sanitizeUSDCInput('0.5')).toBe('0.5')
  })

  it('handles multiple decimal points by ignoring everything after the second dot', () => {
    expect(sanitizeUSDCInput('12.34.56')).toBe('12.34')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeUSDCInput('')).toBe('')
  })

  it('returns "0" for single zero', () => {
    expect(sanitizeUSDCInput('0')).toBe('0')
  })
})

describe('formatUSDC', () => {
  it('adds thousands separator', () => {
    expect(formatUSDC('1234.56')).toBe('1,234.56')
  })

  it('adds trailing decimal places when absent', () => {
    expect(formatUSDC('100')).toBe('100.00')
  })

  it('handles multiple thousands separators', () => {
    expect(formatUSDC('1234567.89')).toBe('1,234,567.89')
  })

  it('pads single fractional digit to two', () => {
    expect(formatUSDC('0.5')).toBe('0.50')
  })

  it('passes through an already-formatted string', () => {
    expect(formatUSDC('1,234.56')).toBe('1,234.56')
  })

  it('returns empty string for empty input', () => {
    expect(formatUSDC('')).toBe('')
  })

  it('returns the raw string unchanged for non-numeric input', () => {
    expect(formatUSDC('abc')).toBe('abc')
  })
})

describe('normalizeUSDC', () => {
  it('rounds to 2 decimal places', () => {
    expect(normalizeUSDC('123.456')).toBe('123.46')
  })

  it('pads to 2 decimal places', () => {
    expect(normalizeUSDC('123.4')).toBe('123.40')
  })

  it('strips comma separators', () => {
    expect(normalizeUSDC('1,234.56')).toBe('1234.56')
  })

  it('clamps negative values to 0.00', () => {
    expect(normalizeUSDC('-100')).toBe('0.00')
  })

  it('formats zero as "0.00"', () => {
    expect(normalizeUSDC('0')).toBe('0.00')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeUSDC('')).toBe('')
  })

  it('returns empty string for non-numeric input', () => {
    expect(normalizeUSDC('abc')).toBe('')
  })

  it('handles large numbers', () => {
    expect(normalizeUSDC('999999.99')).toBe('999999.99')
  })
})
