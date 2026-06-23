import './TrustGauge.css'

import { type TrustTier, TIERS, TIER_ORDER, MAX_SCORE } from '../lib/tiers'

export interface TrustGaugeProps {
  /** Current trust score (0-1000) */
  score: number
  /** Current tier */
  tier: TrustTier
  /** Custom className for wrapper */
  className?: string
  /** Optional ID for accessibility */
  id?: string
}

/**
 * Calculate points remaining to reach the next tier
 * @param score Current score
 * @param tier Current tier
 * @returns Points needed to reach next tier (0 if at platinum)
 */
export function pointsToNextTier(score: number, tier: TrustTier): number {
  const tierIndex = TIER_ORDER.indexOf(tier)
  if (tierIndex === TIER_ORDER.length - 1) {
    return 0
  }
  const nextTier = TIER_ORDER[tierIndex + 1]
  return Math.max(0, TIERS[nextTier].min - score)
}

/**
 * Calculate percentage of fill for the gauge (0-100)
 * @param score Current score
 * @returns Percentage (0-100)
 */
export function getProgressPercentage(score: number): number {
  return Math.min((score / MAX_SCORE) * 100, 100)
}

export default function TrustGauge({
  score,
  tier,
  className = '',
  id = 'trust-gauge',
}: TrustGaugeProps) {
  const percentage = getProgressPercentage(score)
  const nextTierPoints = pointsToNextTier(score, tier)
  const isAtMax = tier === 'platinum' && score >= MAX_SCORE

  return (
    <div className={`trust-gauge ${className}`} id={id}>
      {/* Accessible heading and description */}
      <div className="trust-gauge__header">
        <h3 className="trust-gauge__title">Trust Score Gauge</h3>
        <p className="trust-gauge__description">
          Visual representation of your trust score across tier bands from Bronze to Platinum
        </p>
      </div>

      {/* Main gauge container */}
      <div
        className="trust-gauge__container"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={MAX_SCORE}
        aria-label={`Trust score: ${score} out of ${MAX_SCORE}, ${tier} tier`}
      >
        {/* Track background with tier divisions */}
        <div className="trust-gauge__track">
          {/* Tier threshold markers and fills */}
          <div
            className="trust-gauge__fill trust-gauge__fill--bronze"
            role="presentation"
            aria-hidden="true"
          />
          <div
            className="trust-gauge__fill trust-gauge__fill--silver"
            role="presentation"
            aria-hidden="true"
          />
          <div
            className="trust-gauge__fill trust-gauge__fill--gold"
            role="presentation"
            aria-hidden="true"
          />
          <div
            className="trust-gauge__fill trust-gauge__fill--platinum"
            role="presentation"
            aria-hidden="true"
          />

          {/* Progress indicator - shows actual current progress */}
          <div
            className="trust-gauge__progress"
            style={
              {
                '--progress-width': `${percentage}%`,
              } as React.CSSProperties & { '--progress-width': string }
            }
            role="presentation"
            aria-hidden="true"
          />

          {/* Tier threshold markers */}
          <div className="trust-gauge__markers">
            {TIER_ORDER.map((t, index) => {
              const markerPercentage = (TIERS[t].min / MAX_SCORE) * 100
              return (
                <div
                  key={t}
                  className={`trust-gauge__marker trust-gauge__marker--${t}`}
                  style={
                    {
                      '--marker-position': `${markerPercentage}%`,
                    } as React.CSSProperties & { '--marker-position': string }
                  }
                  title={`${TIERS[t].label}: ${TIERS[t].min}-${TIERS[t].max ?? MAX_SCORE} points`}
                >
                  {/* Only show label for first marker on mobile, all on desktop */}
                  {index === 0 && <span className="trust-gauge__marker-label">{t}</span>}
                </div>
              )
            })}
          </div>

          {/* Current score indicator thumb */}
          <div
            className="trust-gauge__thumb"
            style={
              {
                '--thumb-position': `${percentage}%`,
              } as React.CSSProperties & { '--thumb-position': string }
            }
            role="presentation"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Score and tier display */}
      <div className="trust-gauge__stats">
        <div className="trust-gauge__score-display">
          <span className="trust-gauge__score-value">{score}</span>
          <span className="trust-gauge__score-label">/ {MAX_SCORE}</span>
        </div>

        <div className="trust-gauge__tier-display">
          <span className="trust-gauge__tier-badge" data-tier={tier}>
            {TIERS[tier].label}
          </span>
        </div>

        <div className="trust-gauge__progress-caption">
          {isAtMax ? (
            <span className="trust-gauge__maxed">Platinum tier — maximum score achieved</span>
          ) : (
            <span className="trust-gauge__next-tier">
              {nextTierPoints} points to {TIER_ORDER[TIER_ORDER.indexOf(tier) + 1]}
            </span>
          )}
        </div>
      </div>

      {/* Tier legend/explanation */}
      <div className="trust-gauge__legend">
        <p className="trust-gauge__legend-title">Tier Ranges</p>
        <ul className="trust-gauge__legend-list">
          {TIER_ORDER.map((t) => (
            <li key={t} className="trust-gauge__legend-item">
              <span
                className="trust-gauge__legend-dot"
                style={{ backgroundColor: TIERS[t].color }}
                aria-hidden="true"
              />
              <span className="trust-gauge__legend-text">
                {TIERS[t].label}: {TIERS[t].min}–{TIERS[t].max ?? MAX_SCORE}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
