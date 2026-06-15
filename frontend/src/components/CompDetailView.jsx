/**
 * CompDetailView — shared detail layout used by both the modal and the standalone page.
 * Receives a fully-shaped `comp` object (matches the /api/Compositions/:id response).
 */
import { useState, useEffect } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { buildTeamCode } from '../utils/teamCode'

function ItemTooltip({ item, children }) {
    const [visible, setVisible] = useState(false)
    return (
        <div
            className="item-tooltip-wrap"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className="item-tooltip-popup">
                    <div className="item-tooltip-name">{item.name}</div>
                    {item.description && (
                        <div className="item-tooltip-desc">{item.description}</div>
                    )}
                </div>
            )}
        </div>
    )
}

const ROWS = 4
const COLS = 7

export const COST_COLORS = {
    1: '#808080',
    2: '#2ecc71',
    3: '#3498db',
    4: '#9b59b6',
    5: '#f1c40f',
}

export const TIER_COLORS = {
    S: '#ff7675',
    A: '#fdcb6e',
    B: '#6c5ce7',
    C: '#00b894',
    X: '#b2bec3',
}

function CrownIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
            <path d="M5 16L3 6l5.5 4L12 3l3.5 7L21 6l-2 10H5zm2 2h10v2H7v-2z" />
        </svg>
    )
}

function DifficultyDots({ difficulty }) {
    const levels = { Easy: 1, Medium: 2, Hard: 3 }
    const filled = levels[difficulty] ?? 2
    return (
        <span className="comp-detail-difficulty-dots">
            {[1, 2, 3].map(i => (
                <span key={i} className={`comp-detail-diff-dot ${i <= filled ? 'filled' : ''}`} />
            ))}
        </span>
    )
}

// Bronze → Silver → Gold → Prismatic
const BREAKPOINT_COLORS = ['#b87333', '#9f9fa8', '#e8a724', '#c57bdb']
const UNIQUE_COLOR = '#e8a724'  // 1-breakpoint traits get gold

function getBreakpointColor(activeIdx, totalBreakpoints) {
    if (totalBreakpoints === 1) return UNIQUE_COLOR
    return BREAKPOINT_COLORS[activeIdx] ?? '#aaa'
}

function computeTraits(champions) {
    const map = {}
    champions.forEach(cc => {
        ;(cc.champion?.traits || []).forEach(t => {
            if (!map[t.name]) {
                map[t.name] = {
                    ...t,
                    count: 0,
                    breakpoints: [...(t.breakpoints || [])].sort((a, b) => a.unitsRequired - b.unitsRequired),
                }
            }
            map[t.name].count++
        })
    })

    // Emblems: an "X Emblem" item grants the wearer the trait "X" (+1),
    // unless they already have it natively.
    champions.forEach(cc => {
        const nativeTraits = new Set((cc.champion?.traits || []).map(t => t.name))
        ;(cc.items || []).forEach(item => {
            const name = item.name || ''
            if (!/emblem/i.test(name)) return
            const traitName = name.replace(/\s*emblem\s*/i, '').trim()
            if (!traitName || nativeTraits.has(traitName)) return
            if (map[traitName]) {
                map[traitName].count++
            } else {
                map[traitName] = { name: traitName, imageUrl: item.imageUrl, count: 1, breakpoints: [] }
            }
        })
    })

    return Object.values(map)
        .map(trait => {
            // Find the highest breakpoint we've hit
            let activeIdx = -1
            trait.breakpoints.forEach((bp, idx) => {
                if (trait.count >= bp.unitsRequired) activeIdx = idx
            })
            return { ...trait, activeIdx }
        })
        // only traits that hit a breakpoint; if breakpoints aren't loaded yet, show all
        .filter(t => t.breakpoints.length === 0 || t.activeIdx >= 0)
        .sort((a, b) => b.count - a.count)
}

function BuilderIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    )
}

function NamesIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

function CompDetailView({ comp, showNames = false, onToggleNames, onOpenBuilder }) {
    const tierColor = TIER_COLORS[comp.tier] ?? '#aaa'
    const champs    = comp.champions ?? []
    const [codeCopied, setCodeCopied] = useState(false)
    const { isFavorite, toggleFavorite } = useFavorites()
    const { recordView } = useRecentlyViewed()

    // Record this comp as recently viewed (once per comp id)
    useEffect(() => {
        if (comp?.id) recordView(comp)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comp?.id])

    function copyTeamCode() {
        const code = buildTeamCode(champs.map(cc => cc.champion))
        if (!code) return
        navigator.clipboard.writeText(code).then(() => {
            setCodeCopied(true)
            setTimeout(() => setCodeCopied(false), 2000)
        })
    }

    // Build read-only hex grid
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    champs.forEach(cc => {
        if (cc.row >= 0 && cc.row < ROWS && cc.col >= 0 && cc.col < COLS) {
            grid[cc.row][cc.col] = cc
        }
    })

    const traits       = computeTraits(champs)
    const carry        = champs.find(cc => cc.isCarry)
    const sorted       = [...champs].sort((a, b) => a.champion.cost - b.champion.cost)
    const tipLines     = (comp.tips || '').split('\n').filter(Boolean)
    const augments     = comp.augments ?? []
    const itemPriority = comp.itemPriority ?? []
    const earlyUnits   = comp.earlyUnits ?? []
    const gods         = comp.gods ?? []
    const hasBoard     = champs.length > 0

    const STAGE_LABELS = ['Stage 2', 'Stage 3', 'Stage 4']
    const rawStageGuide = comp.stageGuide ?? []
    const stageGuide = STAGE_LABELS.map((label, i) =>
        rawStageGuide[i] ?? { stage: label, description: null }
    )

    return (
        <div className="cdv-root">

            {/* ── Header ── */}
            <div className="cdv-header">
                <div className="cdv-title-row">
                    {comp.carryImageUrl && (
                        <img
                            src={comp.carryImageUrl}
                            alt={comp.name}
                            className="cdv-carry-thumb"
                            onError={e => { e.target.style.display = 'none' }}
                        />
                    )}
                    <div className="cdv-title-text">
                        <div className="cdv-name-row">
                            <h2 className="cdv-name">{comp.name}</h2>
                            <span
                                className="cdv-tier-badge"
                                style={{ backgroundColor: tierColor }}
                            >
                                {comp.tier}
                            </span>
                            <button
                                className={`cdv-fav-star ${isFavorite(comp.id) ? 'cdv-fav-star-on' : ''}`}
                                onClick={() => toggleFavorite(comp.id)}
                                title={isFavorite(comp.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                ★
                            </button>
                        </div>
                        <div className="cdv-chips">
                            <span className="comp-detail-chip comp-detail-chip-playstyle">
                                {comp.playstyle}
                            </span>
                            <span className="comp-detail-chip comp-detail-chip-difficulty">
                                <DifficultyDots difficulty={comp.difficulty} />
                                {comp.difficulty}
                            </span>
                            <span className="comp-detail-chip comp-detail-chip-patch">
                                Patch {comp.patchVersion}
                            </span>
                            {comp.isConditional && (
                                <span className="comp-detail-chip comp-detail-chip-conditional">
                                    Conditional
                                </span>
                            )}
                        </div>

                        {/* ── Stats bar ── */}
                        {(comp.top4Rate != null || comp.winRate != null || comp.playRate != null) && (
                            <div className="cdv-stats-row">
                                {comp.top4Rate != null && (
                                    <div className="cdv-stat">
                                        <span className="cdv-stat-value">{(comp.top4Rate * 100).toFixed(1)}%</span>
                                        <span className="cdv-stat-label">Top 4</span>
                                    </div>
                                )}
                                {comp.winRate != null && (
                                    <div className="cdv-stat">
                                        <span className="cdv-stat-value">{(comp.winRate * 100).toFixed(1)}%</span>
                                        <span className="cdv-stat-label">Win Rate</span>
                                    </div>
                                )}
                                {comp.playRate != null && (
                                    <div className="cdv-stat">
                                        <span className="cdv-stat-value">{(comp.playRate * 100).toFixed(1)}%</span>
                                        <span className="cdv-stat-label">Play Rate</span>
                                    </div>
                                )}
                                {comp.avgPlacement != null && (
                                    <div className="cdv-stat">
                                        <span className="cdv-stat-value">{comp.avgPlacement.toFixed(2)}</span>
                                        <span className="cdv-stat-label">Avg Place</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body: left panel + board ── */}
            <div className="cdv-body">

                {/* Left panel */}
                <div className="cdv-left">

                    {/* Carry */}
                    {carry && (
                        <div className="comp-detail-carry-card">
                            <div className="comp-detail-carry-label">
                                <CrownIcon /> CARRY
                            </div>
                            <div
                                className="comp-detail-carry-portrait"
                                style={{
                                    borderColor: COST_COLORS[carry.champion.cost] ?? '#aaa',
                                    boxShadow: `0 0 20px ${COST_COLORS[carry.champion.cost] ?? '#aaa'}55`,
                                }}
                            >
                                <img
                                    src={carry.champion.imageUrl}
                                    alt={carry.champion.name}
                                    className="comp-detail-carry-img"
                                    onError={e => { e.target.style.display = 'none' }}
                                />
                                <div
                                    className="comp-detail-carry-cost"
                                    style={{ backgroundColor: COST_COLORS[carry.champion.cost] ?? '#aaa' }}
                                >
                                    {carry.champion.cost}g
                                </div>
                            </div>
                            <div className="comp-detail-carry-name">{carry.champion.name}</div>

                            {/* Augments — between portrait and traits */}
                            {augments.length > 0 && (
                                <div className="comp-detail-augments-grid">
                                    {augments.map((aug, i) => (
                                        <div key={i} className="comp-detail-augment-tile" title={aug.name}>
                                            {aug.imageUrl
                                                ? <img src={aug.imageUrl} alt={aug.name} className="comp-detail-augment-img" onError={e => { e.target.style.display = 'none' }} />
                                                : <div className="comp-detail-augment-icon"><span>{aug.name.charAt(0)}</span></div>
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Active traits row */}
                            {traits.length > 0 && (
                                <div className="comp-detail-carry-traits">
                                    {traits.map((trait, i) => {
                                        const color = getBreakpointColor(trait.activeIdx, trait.breakpoints.length)
                                        const hasImage = trait.imageUrl && (trait.imageUrl.startsWith('http') || trait.imageUrl.startsWith('data:'))
                                        return (
                                            <div
                                                key={i}
                                                className="comp-detail-trait-badge"
                                                title={`${trait.name} (${trait.count})`}
                                                style={{ '--trait-color': color }}
                                            >
                                                <div className="comp-detail-trait-badge-icon">
                                                    {hasImage
                                                        ? <img src={trait.imageUrl} alt={trait.name} onError={e => { e.target.style.display = 'none' }} />
                                                        : <span className="comp-detail-trait-badge-initial">{trait.name.charAt(0)}</span>
                                                    }
                                                </div>
                                                <span className="comp-detail-trait-badge-count" style={{ backgroundColor: color, color: '#000' }}>
                                                    {trait.count}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tips */}
                    {tipLines.length > 0 && (
                        <div className="comp-detail-tips-card">
                            <div className="comp-detail-section-label">TIPS</div>
                            <ul className="comp-detail-tips-list">
                                {tipLines.map((tip, i) => (
                                    <li key={i} className="comp-detail-tip">
                                        {tip.replace(/^[•\-]\s*/, '')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>

                {/* ── Roster strip above board ── */}
                <div className="comp-detail-right">
                    {sorted.length > 0 && (
                        <div className="comp-detail-roster">
                            {sorted.map(cc => (
                                <div
                                    key={cc.id}
                                    className={`comp-detail-roster-hex ${cc.isCarry ? 'is-carry' : ''}`}
                                    data-tooltip={cc.champion.name}
                                >
                                    <div
                                        className="comp-detail-roster-inner"
                                        style={{
                                            borderColor: COST_COLORS[cc.champion.cost] ?? '#aaa',
                                            boxShadow: cc.isCarry
                                                ? `0 0 12px ${COST_COLORS[cc.champion.cost] ?? '#aaa'}88`
                                                : undefined,
                                        }}
                                    >
                                        {cc.isCarry && (
                                            <div className="comp-detail-hex-crown"><CrownIcon size={10} /></div>
                                        )}
                                        <img
                                            src={cc.champion.imageUrl}
                                            alt={cc.champion.name}
                                            className="comp-detail-roster-img"
                                            onError={e => { e.target.style.display = 'none' }}
                                        />
                                    </div>
                                    {cc.items.length > 0 && (
                                        <div className="comp-detail-roster-items">
                                            {cc.items.map((item, idx) => (
                                                <div key={idx} className="comp-detail-roster-item" title={item.name}>
                                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                {/* Hex board + sidebar */}
                <div className="comp-detail-board-wrap">
                    {hasBoard ? (
                        <>
                            <div className="comp-detail-board">
                                <div className="builder-board-watermark">TFTools</div>
                                <span className="comp-detail-board-inline-label top">ENEMY</span>
                                <span className="comp-detail-board-inline-label bottom">YOU</span>
                                {Array.from({ length: ROWS }, (_, r) => {
                                    const displayRow  = ROWS - 1 - r
                                    const isOffsetRow = displayRow % 2 === 0
                                    return (
                                        <div
                                            key={displayRow}
                                            className="builder-hex-row"
                                            style={{
                                                marginLeft: isOffsetRow
                                                    ? 'calc(var(--hex-size) * 0.5 + 4px)'
                                                    : '0',
                                            }}
                                        >
                                            {Array.from({ length: COLS }, (_, c) => {
                                                const cell = grid[displayRow][c]
                                                return (
                                                    <div
                                                        key={c}
                                                        className={`comp-detail-hex-cell ${cell ? 'comp-detail-hex-filled' : ''}`}
                                                    >
                                                        {cell ? (
                                                            <div className="comp-detail-hex-champ">
                                                                <div
                                                                    className="comp-detail-hex-inner"
                                                                    style={{
                                                                        borderColor: COST_COLORS[cell.champion.cost] ?? '#aaa',
                                                                        boxShadow: cell.isCarry
                                                                            ? `0 0 14px ${COST_COLORS[cell.champion.cost] ?? '#aaa'}88`
                                                                            : undefined,
                                                                    }}
                                                                >
                                                                    {cell.isCarry && (
                                                                        <div className="comp-detail-hex-crown">
                                                                            <CrownIcon />
                                                                        </div>
                                                                    )}
                                                                    {cell.starLevel > 1 && (
                                                                        <div className="comp-detail-hex-stars">
                                                                            {Array.from({ length: cell.starLevel }, (_, i) => (
                                                                                <span key={i} style={{ color: cell.starLevel === 3 ? '#ffc107' : '#4caf50' }}>★</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <img
                                                                        src={cell.champion.imageUrl}
                                                                        alt={cell.champion.name}
                                                                        className="comp-detail-hex-img"
                                                                        onError={e => { e.target.style.display = 'none' }}
                                                                    />
                                                                    {showNames && (
                                                                        <div className="comp-detail-hex-name">
                                                                            {cell.champion.name}
                                                                        </div>
                                                                    )}
                                                                    {cell.items.length > 0 && (
                                                                        <div className="comp-detail-hex-items">
                                                                            {cell.items.map((item, idx) => (
                                                                                <div key={idx} className="comp-detail-hex-item-dot" title={item.name}>
                                                                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="comp-detail-hex-empty" />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Right sidebar */}
                            <div className="comp-detail-board-sidebar">
                                <div className="cdv-extra-card">
                                    <div className="comp-detail-section-label">ITEM PRIORITY</div>
                                    {itemPriority.length > 0 ? (
                                        <div className="cdv-sidebar-item-row">
                                            {itemPriority.map((item, i) => (
                                                <div key={i} className="cdv-sidebar-item-wrap">
                                                    <div className="cdv-sidebar-item-icon" title={item.name}>
                                                        {item.imageUrl
                                                            ? <img src={item.imageUrl} alt={item.name} onError={e => { e.target.style.display = 'none' }} />
                                                            : <span>{item.name.charAt(0)}</span>
                                                        }
                                                    </div>
                                                    {i < itemPriority.length - 1 && (
                                                        <span className="cdv-sidebar-arrow">›</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="cdv-placeholder-text">Coming soon...</span>
                                    )}
                                </div>
                                <div className="cdv-extra-card">
                                    <div className="comp-detail-section-label">EARLY UNITS</div>
                                    {earlyUnits.length > 0 ? (
                                        <div className="cdv-sidebar-unit-row">
                                            {earlyUnits.map((unit, i) => (
                                                <div key={i} className="cdv-sidebar-hex" title={unit.name}
                                                    style={{ borderColor: COST_COLORS[unit.cost] ?? '#aaa' }}>
                                                    {unit.imageUrl
                                                        ? <img src={unit.imageUrl} alt={unit.name} onError={e => { e.target.style.display = 'none' }} />
                                                        : <span>{unit.name.charAt(0)}</span>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="cdv-placeholder-text">Coming soon...</span>
                                    )}
                                </div>
                                <div className="cdv-extra-card">
                                    <div className="comp-detail-section-label">GODS</div>
                                    {gods.length > 0 ? (
                                        <div className="cdv-gods-row">
                                            {gods.map((god, i) => (
                                                <div key={i} className="cdv-sidebar-item-wrap">
                                                    <div className={`cdv-god-portrait${i === 0 ? ' cdv-god-portrait-top' : ''}`} title={god.name}>
                                                        {i === 0 && <span className="cdv-god-star">★</span>}
                                                        {god.imageUrl
                                                            ? <img src={god.imageUrl} alt={god.name} onError={e => { e.target.style.display = 'none' }} />
                                                            : <span>{god.name.charAt(0)}</span>
                                                        }
                                                    </div>
                                                    {i < gods.length - 1 && (
                                                        <span className="cdv-sidebar-arrow">›</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="cdv-placeholder-text">Coming soon...</span>
                                    )}
                                </div>

                                {/* Action buttons — pinned to bottom of sidebar, side by side */}
                                {(onOpenBuilder || onToggleNames) && (
                                    <div className="cdv-action-row">
                                        {onOpenBuilder && (
                                            <button className="cdv-extra-card cdv-action-btn cdv-action-btn-primary" onClick={onOpenBuilder}>
                                                <BuilderIcon />
                                                Open in Builder
                                            </button>
                                        )}
                                        {hasBoard && (
                                            <button
                                                className={`cdv-extra-card cdv-action-btn ${codeCopied ? 'cdv-action-btn-copied' : ''}`}
                                                onClick={copyTeamCode}
                                                title="Copy in-game Team Code — paste into the TFT Team Planner"
                                            >
                                                {codeCopied ? '✓ Code Copied!' : 'Team Code'}
                                            </button>
                                        )}
                                        {onToggleNames && (
                                            <label className="cdv-extra-card cdv-action-toggle-row">
                                                <span className="cdv-toggle-label">Show Names</span>
                                                <span
                                                    className={`cdv-toggle ${showNames ? 'cdv-toggle-on' : ''}`}
                                                    onClick={onToggleNames}
                                                    role="switch"
                                                    aria-checked={showNames}
                                                >
                                                    <span className="cdv-toggle-thumb" />
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="cdv-no-board">
                            <span>Board data coming soon</span>
                        </div>
                    )}
                </div>{/* end comp-detail-board-wrap */}

                {/* Stage Guide — always rendered, placeholders when no data */}
                <div className="cdv-stage-guide">
                    {stageGuide.map((s, i) => (
                        <div key={i} className={`cdv-stage-card${!s.description ? ' cdv-stage-card-placeholder' : ''}`}>
                            <div className="cdv-stage-label">{s.stage}</div>
                            {s.description
                                ? <p className="cdv-stage-desc">{s.description}</p>
                                : <p className="cdv-stage-desc cdv-placeholder-text">Coming soon...</p>
                            }
                        </div>
                    ))}
                </div>
                </div>{/* end comp-detail-right */}
            </div>{/* end cdv-body */}
        </div>
    )
}

export default CompDetailView
