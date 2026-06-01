import Banner from '../components/Banner'
import Disclaimer from '../components/Disclaimer'
import Badge from '../components/Badge'
import ActionCard from '../components/ActionCard'
import Button from '../components/Button'
import AmountInput from '../components/AmountInput'
import { FormField } from '../components/forms/FormField'
import { useMemo, useState } from 'react'

export default function Bond() {
  const { addToast } = useToast()
  const [amount, setAmount] = useState('')

  const mockedBalance = 2500

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(/,/g, '').trim()
    if (!normalized) return 0
    const numericValue = Number(normalized)
    return Number.isFinite(numericValue) ? numericValue : 0
  }, [amount])

  const overBalance = parsedAmount > mockedBalance
  const balanceLabel = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(mockedBalance)
  }, [mockedBalance])

  const handleCreate = () => {
    addToast('success', 'Bond created successfully.')
  }

  const mockBonds = [
    { id: 1, amount: '500 USDC', status: 'active' },
    { id: 2, amount: '1000 USDC', status: 'locked' },
    { id: 3, amount: '250 USDC', status: 'grace-period' },
  ]

  return (
    <div style={{ display: 'grid', gap: 'var(--credence-space-8)' }}>
      <div style={{ display: 'grid', gap: 'var(--credence-space-3)' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Bond USDC</h1>
        <p id="bond-desc" style={{ color: 'var(--text-secondary)', maxWidth: '42rem' }}>
          Lock USDC into the Credence contract to build your economic reputation.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
          gap: 'var(--credence-space-6)',
          alignItems: 'start',
        }}
      >
        <ActionCard title="Create New Bond">
          <FormField
            id="bond-amount"
            label="Amount (USDC)"
            hint={`Available: ${balanceLabel} USDC`}
            error={overBalance ? 'Amount exceeds available balance.' : undefined}
          >
            <AmountInput
              value={amount}
              onChange={setAmount}
              balance={mockedBalance}
              presets={[100, 500, 1000]}
              placeholder="0.00"
              aria-describedby="bond-desc"
              error={overBalance ? 'Amount exceeds available balance.' : undefined}
            />
          </FormField>
          <Button
            type="button"
            onClick={handleCreate}
            style={{
              width: '100%',
              padding: 'var(--credence-space-3) var(--credence-space-4)',
              background: 'var(--color-primary)',
              color: 'var(--bg-page)',
              border: 'none',
              borderRadius: 'var(--credence-radius-lg)',
              fontWeight: 'var(--credence-font-weight-semibold)',
              cursor: 'pointer',
            }}
          >
            Create bond
          </Button>
        </ActionCard>

        <ActionCard title="Active Bonds">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid' }}>
            {mockBonds.map((bond) => (
              <li
                key={bond.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBlock: 'var(--credence-space-3)',
                  borderBottom:
                    bond.id === mockBonds.length ? 'none' : '1px solid var(--border-default)',
                  gap: 'var(--credence-space-4)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{bond.amount}</span>
                <Badge variant={bond.status} />
              </li>
            ))}
          </ul>
        </ActionCard>
      </div>
    </div>
  )
}

