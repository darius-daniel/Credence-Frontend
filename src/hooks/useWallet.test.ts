import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWallet } from './useWallet'

const mocks = vi.hoisted(() => ({
  mockCheckFreighterInstalled: vi.fn(),
  mockRequestFreighterAccess: vi.fn(),
  mockFetchFreighterAddress: vi.fn(),
  mockFetchFreighterNetwork: vi.fn(),
  mockCreateWalletWatcher: vi.fn(),
}))

vi.mock('../lib/freighterClient', () => ({
  checkFreighterInstalled: mocks.mockCheckFreighterInstalled,
  requestFreighterAccess: mocks.mockRequestFreighterAccess,
  fetchFreighterAddress: mocks.mockFetchFreighterAddress,
  fetchFreighterNetwork: mocks.mockFetchFreighterNetwork,
  createWalletWatcher: mocks.mockCreateWalletWatcher,
}))

const TEST_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA'

describe('useWallet', () => {
  beforeEach(() => {
    mocks.mockCheckFreighterInstalled.mockResolvedValue(false)
    mocks.mockRequestFreighterAccess.mockResolvedValue({ ok: true, address: TEST_ADDRESS })
    mocks.mockFetchFreighterAddress.mockResolvedValue(null)
    mocks.mockFetchFreighterNetwork.mockResolvedValue('public')
    mocks.mockCreateWalletWatcher.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts in disconnected state', async () => {
    const { result } = renderHook(() => useWallet('public'))

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false)
    })

    expect(result.current.address).toBe('')
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.network).toBe('public')
  })

  it('connect populates address and isConnected', async () => {
    mocks.mockCheckFreighterInstalled.mockResolvedValue(true)
    mocks.mockCreateWalletWatcher.mockResolvedValue({ stop: vi.fn() })

    const { result } = renderHook(() => useWallet('public'))

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.address).toBe(TEST_ADDRESS)
    expect(result.current.isConnected).toBe(true)
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('disconnect clears address and error', async () => {
    mocks.mockCheckFreighterInstalled.mockResolvedValue(true)
    mocks.mockCreateWalletWatcher.mockResolvedValue({ stop: vi.fn() })

    const { result } = renderHook(() => useWallet('public'))

    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.isConnected).toBe(true)

    act(() => {
      result.current.disconnect()
    })

    expect(result.current.address).toBe('')
    expect(result.current.isConnected).toBe(false)
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
