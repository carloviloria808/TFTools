import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getChampions } from '../services/api'

const COST_COLORS = {
    1: '#9e9e9e', 2: '#2ecc71', 3: '#3498db', 4: '#9b59b6', 5: '#f1c40f',
}

// Small coin icon tinted to the cost colour
function CoinIcon({ color, size = 13 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="odds-coin" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill={color} opacity="0.25" />
            <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2.5" />
            <circle cx="12" cy="12" r="4.5" fill={color} />
        </svg>
    )
}

// % chance per shop slot of rolling each cost tier, by player level
const SHOP_ODDS = [
    { level: 2,  odds: [100, 0,  0,  0,  0 ] },
    { level: 3,  odds: [75,  25, 0,  0,  0 ] },
    { level: 4,  odds: [55,  30, 15, 0,  0 ] },
    { level: 5,  odds: [45,  33, 20, 2,  0 ] },
    { level: 6,  odds: [30,  40, 25, 5,  0 ] },
    { level: 7,  odds: [19,  30, 40, 10, 1 ] },
    { level: 8,  odds: [18,  25, 32, 22, 3 ] },
    { level: 9,  odds: [10,  20, 25, 35, 10] },
    { level: 10, odds: [5,   10, 20, 40, 25] },
]

// Copies of each champion that exist in the shared pool
const POOL_SIZES = [
    { cost: 1, copies: 30 },
    { cost: 2, copies: 25 },
    { cost: 3, copies: 18 },
    { cost: 4, copies: 10 },
    { cost: 5, copies: 9 },
]

// XP required to reach each level (buying XP costs 4 gold for 4 XP)
const XP_TABLE = [
    { level: 2, xp: 2 },
    { level: 3, xp: 6 },
    { level: 4, xp: 10 },
    { level: 5, xp: 20 },
    { level: 6, xp: 36 },
    { level: 7, xp: 48 },
    { level: 8, xp: 80 },
    { level: 9, xp: 84 },
    { level: 10, xp: 100 },
]

const TIPS = [
    { icon: '🎯', text: '4-cost odds jump from 10% to 22% at level 8 — the standard roll-down level for 4-cost carries.' },
    { icon: '🔁', text: 'Slow-rolling for a 3-star 1-cost? Stay at level 4 or 5 where 1-cost odds are still high.' },
    { icon: '👑', text: '5-costs only become realistic at level 9 (10%) — Fast 9 comps bank gold to hit this spike.' },
    { icon: '🤝', text: 'The pool is shared across all 8 players — if three people hold Corki, your odds of finding one drop fast.' },
]

function ShopOddsPage() {
    usePageTitle('Shop Odds')
    const [examples, setExamples] = useState({})   // cost → [champion, …]

    useEffect(() => {
        getChampions()
            .then(r => {
                const byCost = {}
                ;[1, 2, 3, 4, 5].forEach(cost => {
                    byCost[cost] = r.data
                        .filter(c => c.cost === cost && c.imageUrl)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3)
                })
                setExamples(byCost)
            })
            .catch(() => setExamples({}))
    }, [])

    return (
        <div className="odds-page">
            <h1>Shop Odds</h1>
            <p className="page-subtitle">Patch 17.5 — chance per shop slot of each cost tier</p>

            <div className="odds-layout">
            <div className="odds-main">
            {/* ── Main odds table ── */}
            <div className="odds-table-wrap">
                <table className="odds-table">
                    <thead>
                        <tr>
                            <th className="odds-level-head">Level</th>
                            {[1, 2, 3, 4, 5].map(cost => (
                                <th key={cost} style={{ color: COST_COLORS[cost] }}>
                                    {cost} <CoinIcon color={COST_COLORS[cost]} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SHOP_ODDS.map(({ level, odds }) => {
                            const max = Math.max(...odds)
                            return (
                                <tr key={level}>
                                    <td className="odds-level">{level}</td>
                                    {odds.map((pct, i) => (
                                        <td
                                            key={i}
                                            className={`odds-cell ${pct === 0 ? 'odds-cell-zero' : ''} ${pct === max ? 'odds-cell-max' : ''}`}
                                            style={pct > 0 ? {
                                                color: COST_COLORS[i + 1],
                                                background: `color-mix(in srgb, ${COST_COLORS[i + 1]} ${Math.round(pct * 0.3)}%, #12141c)`,
                                            } : {}}
                                        >
                                            {pct > 0 ? `${pct}%` : '—'}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Tips ── */}
            <div className="odds-tips">
                {TIPS.map((tip, i) => (
                    <div key={i} className="odds-tip">
                        <span className="odds-tip-icon">{tip.icon}</span>
                        <span className="odds-tip-text">{tip.text}</span>
                    </div>
                ))}
            </div>
            </div>{/* end odds-main */}

            {/* ── Secondary tables (right column) ── */}
            <div className="odds-secondary">
                <div className="odds-mini-card">
                    <h2 className="odds-mini-title">Champion Pool Sizes</h2>
                    <p className="odds-mini-sub">Copies of each champion shared by all 8 players</p>
                    <table className="odds-mini-table">
                        <thead>
                            <tr><th>Cost</th><th>Copies</th><th>For a 3★</th><th>Examples</th></tr>
                        </thead>
                        <tbody>
                            {POOL_SIZES.map(({ cost, copies }) => (
                                <tr key={cost}>
                                    <td style={{ color: COST_COLORS[cost], fontWeight: 700 }}>{cost} <CoinIcon color={COST_COLORS[cost]} /></td>
                                    <td>{copies}</td>
                                    <td className="odds-dim">9 of {copies}</td>
                                    <td>
                                        <div className="odds-examples">
                                            {(examples[cost] || []).map(c => (
                                                <img
                                                    key={c.id}
                                                    src={c.imageUrl}
                                                    alt={c.name}
                                                    title={c.name}
                                                    className="odds-example-img"
                                                    style={{ borderColor: COST_COLORS[cost] }}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="odds-mini-card">
                    <h2 className="odds-mini-title">XP to Level</h2>
                    <p className="odds-mini-sub">Buying XP costs 4 gold for 4 XP — you gain 2 XP free each round</p>
                    <table className="odds-mini-table">
                        <thead>
                            <tr><th>Level</th><th>XP needed</th></tr>
                        </thead>
                        <tbody>
                            {XP_TABLE.map(({ level, xp }) => (
                                <tr key={level}>
                                    <td style={{ fontWeight: 700 }}>{level}</td>
                                    <td>{xp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>{/* end odds-layout */}
        </div>
    )
}

export default ShopOddsPage
