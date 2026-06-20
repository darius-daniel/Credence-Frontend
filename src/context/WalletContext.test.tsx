import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsProvider } from './SettingsContext'
import { WalletProvider, useWalletContext } from './WalletContext'

const TEST_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA'

vi.mock('../lib/freighterClient', () => ({
  checkFreighterInstalled: vi.fn().mockResolvedValue(true),
  requestFreighterAccess: vi.fn().mockResolvedValue({
    ok: true,
    address: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA',
  }),
  fetchFreighterAddress: vi.fn().mockResolvedValue(null),
  fetchFreighterNetwork: vi.fn().mockResolvedValue('public'),
  createWalletWatcher: vi.fn().mockResolvedValue({ stop: vi.fn() }),
  mapFreighterNetwork: vi.fn(),
  FREIGHTER_INSTALL_URL: 'https://www.freighter.app/',
}))

function WalletConsumer() {
  const wallet = useWalletContext()

  return (
    <div>
      <span data-testid="connected">{String(wallet.isConnected)}</span>
      <span data-testid="address">{wallet.address || 'none'}</span>
      <button type="button" onClick={() => void wallet.connect()}>
        connect
      </button>
      <button type="button" onClick={wallet.disconnect}>
        disconnect
      </button>
    </div>
  )
}

function renderWalletTree() {
  return render(
    <SettingsProvider>
      <WalletProvider>
        <WalletConsumer />
      </WalletProvider>
    </SettingsProvider>,
  )
}

describe('WalletProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('connects and disconnects the wallet state', async () => {
    const user = userEvent.setup()

    renderWalletTree()

    expect(screen.getByTestId('connected')).toHaveTextContent('false')
    expect(screen.getByTestId('address')).toHaveTextContent('none')

    await user.click(screen.getByRole('button', { name: 'connect' }))

    expect(screen.getByTestId('connected')).toHaveTextContent('true')
    expect(screen.getByTestId('address')).toHaveTextContent(TEST_ADDRESS)

    await user.click(screen.getByRole('button', { name: 'disconnect' }))

    expect(screen.getByTestId('connected')).toHaveTextContent('false')
    expect(screen.getByTestId('address')).toHaveTextContent('none')
  })
})
