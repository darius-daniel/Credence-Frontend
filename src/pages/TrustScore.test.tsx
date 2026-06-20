import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TrustScore from './TrustScore'
import type { TrustScore as TrustScoreData } from '../api/types'

const mockConnect = vi.fn()
const mockRefetch = vi.fn()

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
    render(<TrustScore />)

    expect(screen.getByRole('button', { name: /look up score/i })).toBeDisabled()
  })

  it('calls refetch when a valid lookup is submitted', async () => {
    const user = userEvent.setup()
    render(<TrustScore />)

    const input = screen.getByRole('textbox', { name: /stellar address/i })
    await user.type(input, 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA')
    await user.click(screen.getByRole('button', { name: /look up score/i }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('renders LoadingSkeleton while trust score data is loading', async () => {
    const user = userEvent.setup()
    mockTrustScoreState = {
      data: null,
      isLoading: true,
      error: null,
    }

    render(<TrustScore />)

    const input = screen.getByRole('textbox', { name: /stellar address/i })
    await user.type(input, 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA')
    await user.click(screen.getByRole('button', { name: /look up score/i }))

    expect(screen.getByLabelText(/loading trust score/i)).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText(/loading trust score/i)).toBeInTheDocument()
  })

  it('renders ErrorState with retry when lookup fails', async () => {
    const user = userEvent.setup()
    mockTrustScoreState = {
      data: null,
      isLoading: false,
      error: { message: 'Service unavailable', status: 503 },
    }

    render(<TrustScore />)

    const input = screen.getByRole('textbox', { name: /stellar address/i })
    await user.type(input, 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA')
    await user.click(screen.getByRole('button', { name: /look up score/i }))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /unable to load trust score/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(mockRefetch).toHaveBeenCalledTimes(2)
  })

  it('renders TrustGauge and tier badge on successful lookup', async () => {
    const user = userEvent.setup()
    mockTrustScoreState = {
      data: {
        address: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA',
        score: 620,
        tier: 'gold',
        attestations: 2,
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
      isLoading: false,
      error: null,
    }

    render(<TrustScore />)

    const input = screen.getByRole('textbox', { name: /stellar address/i })
    await user.type(input, 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA')
    await user.click(screen.getByRole('button', { name: /look up score/i }))

    await waitFor(() => {
      expect(screen.getByRole('progressbar', { name: /trust score: 620/i })).toBeInTheDocument()
    })

    expect(screen.getAllByText('Gold Tier').length).toBeGreaterThan(0)
  })
})
