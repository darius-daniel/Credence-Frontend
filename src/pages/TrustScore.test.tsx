import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TrustScore from './TrustScore'
import type { TrustScore as TrustScoreData } from '../api/types'

const mockAddToast = vi.fn()
let mockConnected = true

let mockConnected = true
let mockTrustScoreState: {
  data: TrustScoreData | null
  isLoading: boolean
  error: { message: string; status: number } | null
} = {
  data: null,
  isLoading: false,
  error: null,
}

vi.mock('../context/WalletContext', () => ({
  useWalletContext: () => ({
    isConnected: mockConnected,
    address: mockConnected
      ? 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      : '',
    connect: mockConnect,
    disconnect: vi.fn(),
    isConnecting: false,
    error: null,
    network: 'public',
  }),
}))

vi.mock('../hooks/useTrustScore', () => ({
  useTrustScore: () => ({
    ...mockTrustScoreState,
    refetch: mockRefetch,
  }),
}))

vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    connected: mockConnected,
    address: mockConnected ? 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' : '',
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

describe('TrustScore', () => {
  beforeEach(() => {
    mockConnect.mockClear()
    mockRefetch.mockClear()
    mockConnected = true
    mockTrustScoreState = {
      data: null,
      isLoading: false,
      error: null,
    }
  })

  it('renders the tier ladder explainer and empty activity state', () => {
    render(<TrustScore />)

    expect(screen.getByRole('heading', { name: 'Trust Score' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /how trust is earned/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No recent activity' })).toBeInTheDocument()
    expect(
      screen.getByText(/New trust score events will appear here once bonds/i),
    ).toBeInTheDocument()
  })

  it('keeps lookup disabled until the address input reports valid input', () => {
    mockConnected = true
    render(<TrustScore />)

    expect(screen.getByRole('button', { name: /look up score/i })).toBeDisabled()
  })

  it('prompts disconnected users to connect before lookup', () => {
    mockConnected = false
    render(<TrustScore />)

    expect(screen.getByRole('button', { name: /connect wallet to continue/i })).toBeInTheDocument()
  })
})
