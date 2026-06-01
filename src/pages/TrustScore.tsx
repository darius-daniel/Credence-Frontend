import Banner from '../components/Banner'
import Disclaimer from '../components/Disclaimer'
import { useToast } from '../components/ToastProvider'
import Badge from '../components/Badge'
import Button from '../components/Button'
import './TrustScore.css'

export default function TrustScore() {
  const { addToast } = useToast()

  // Mock data: current trust score and tier
  // In production, these would come from wallet/contract data
  const currentScore = 675
  const currentTier: TrustTier = 'gold'

  const handleLookup = () => {
    addToast('success', 'Trust score retrieved.')
  }

  const mockActivity = [
    { id: 1, action: 'Bond Created', date: '2024-03-25', status: 'active' },
    { id: 2, action: 'Attestation Received', date: '2024-03-20', status: 'active' },
    { id: 3, action: 'Bond Slashed', date: '2024-03-15', status: 'slashed' },
  ]

  return (
    <div>
      <div className="trustScore__headerRow">
        <h1 className="trustScore__title">Trust Score</h1>
        <Badge variant="gold" label="Gold Tier" className="tier-badge" />
      </div>
      <p id="trust-desc" className="trustScore__description">
        Your reputation score is computed from bond amount, duration, and attestations.
      </p>
      <Banner severity="info">
        Scores update once per epoch. Recent bond changes may not be reflected immediately.
      </Banner>

      <div className="trustScore__grid">
        <div className="trustScore__card">
          <h2 className="trustScore__cardTitle">Lookup Identity</h2>
          <label htmlFor="wallet-address" className="trustScore__label">
            Identity / Wallet address
          </label>
          <input
            id="wallet-address" className="focus-visible"
            type="text"
            placeholder="G..."
            aria-describedby="trust-desc"
            className="trustScore__input"
          />
          <Button type="button" onClick={handleLookup} variant="primary" fullWidth>
            Look up score
          </Button>
        </div>

        <div className="trustScore__card">
          <h2 className="trustScore__cardTitle">Recent Activity</h2>
          <ul className="trustScore__activityList">
            {mockActivity.map((item, index) => (
              <li
                key={item.id}
                className={[
                  'trustScore__activityRow',
                  index === mockActivity.length - 1 ? 'trustScore__activityRow--last' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div>
                  <div className="trustScore__activityAction">{item.action}</div>
                  <div className="trustScore__activityDate">{item.date}</div>
                </div>
                <Badge variant={item.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Disclaimer
        context="Trust scores are protocol metrics only and do not constitute creditworthiness assessments."
        termsHref="#"
      />
    </div>
  )
}
