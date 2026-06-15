import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { getArchiveList, getArchiveSnapshot } from '../services/api'

const TIERS = ['S', 'A', 'B', 'C', 'X']
const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3',
}
const TIER_DESCRIPTIONS = {
    S: 'META', A: 'STRONG', B: 'SOLID', C: 'SITUATIONAL', X: 'CONDITIONAL',
}

function formatDate(dateStr) {
    const normalized = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
    return new Date(normalized).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Snapshot view (read-only tier list for one patch) ────────────────────────

function SnapshotView({ patch }) {
    const [snap,    setSnap]    = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)

    useEffect(() => {
        setLoading(true)
        getArchiveSnapshot(patch)
            .then(r => { setSnap(r.data); setLoading(false) })
            .catch(() => { setError('Snapshot not found'); setLoading(false) })
    }, [patch])

    if (loading) return <div className="loading">Loading snapshot...</div>
    if (error)   return <div className="error">{error}</div>

    const comps = snap.comps || []
    const grouped = TIERS.reduce((acc, tier) => {
        acc[tier] = comps.filter(c => c.tier?.trim() === tier)
        return acc
    }, {})

    return (
        <>
            <div className="archive-snapshot-meta">
                Archived {formatDate(snap.createdAt)} · {comps.length} comps · read-only
            </div>

            <div className="comp-tier-list">
                {TIERS.map(tier => {
                    const tierComps = grouped[tier] || []
                    if (tierComps.length === 0) return null
                    return (
                        <div key={tier} className="comp-tier-row" style={{ borderColor: TIER_COLORS[tier] }}>
                            <div className="comp-tier-label" style={{ backgroundColor: TIER_COLORS[tier] }}>
                                <span className="comp-tier-letter">{tier}</span>
                                <span className="comp-tier-desc">{TIER_DESCRIPTIONS[tier]}</span>
                            </div>
                            <div className="comp-tier-items">
                                {tierComps.map(comp => (
                                    <div key={comp.id} className="comp-card-icon archive-card">
                                        <div
                                            className="comp-card-icon-img-wrapper"
                                            style={{ borderColor: TIER_COLORS[tier] }}
                                        >
                                            {comp.carryImageUrl ? (
                                                <img src={comp.carryImageUrl} alt={comp.name} className="comp-card-icon-img" />
                                            ) : (
                                                <div className="comp-card-icon-placeholder" />
                                            )}
                                        </div>
                                        <div className="comp-card-tooltip">
                                            <span className="comp-card-tooltip-name">{comp.name}</span>
                                            {(comp.top4Rate != null || comp.winRate != null) && (
                                                <span className="comp-card-tooltip-stats">
                                                    {comp.top4Rate != null && `Top4 ${(comp.top4Rate * 100).toFixed(1)}%`}
                                                    {comp.top4Rate != null && comp.winRate != null && ' · '}
                                                    {comp.winRate != null && `Win ${(comp.winRate * 100).toFixed(1)}%`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ArchivePage() {
    const { patch } = useParams()
    usePageTitle(patch ? `Patch ${patch} Archive` : 'Patch Archive')

    const [snapshots, setSnapshots] = useState([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState(null)

    useEffect(() => {
        getArchiveList()
            .then(r => { setSnapshots(r.data); setLoading(false) })
            .catch(() => { setError('Failed to load archive'); setLoading(false) })
    }, [])

    if (loading) return <div className="loading">Loading archive...</div>
    if (error)   return <div className="error">{error}</div>

    return (
        <div className="archive-page">
            <div className="history-header">
                <div>
                    <h1>{patch ? `Patch ${patch} Tier List` : 'Patch Archive'}</h1>
                    <p className="page-subtitle">
                        {patch
                            ? 'How the meta looked at the end of this patch'
                            : 'Past tier lists, archived automatically at the end of each patch'}
                    </p>
                </div>
                <Link to={patch ? '/compositions/archive' : '/compositions'} className="history-back">
                    {patch ? '← All Patches' : '← Back to Tier List'}
                </Link>
            </div>

            {/* Patch selector pills */}
            {snapshots.length > 0 && (
                <div className="archive-patch-pills">
                    {snapshots.map(s => (
                        <Link
                            key={s.patchVersion}
                            to={`/compositions/archive/${s.patchVersion}`}
                            className={`archive-patch-pill ${patch === s.patchVersion ? 'archive-patch-pill-active' : ''}`}
                        >
                            <span className="archive-patch-num">Patch {s.patchVersion}</span>
                            <span className="archive-patch-meta">{formatDate(s.createdAt)} · {s.compCount} comps</span>
                        </Link>
                    ))}
                </div>
            )}

            {patch ? (
                <SnapshotView patch={patch} />
            ) : snapshots.length === 0 ? (
                <div className="archive-empty">
                    <div className="archive-empty-icon">🗄️</div>
                    <p>No archived patches yet.</p>
                    <p className="archive-empty-sub">
                        The current tier list is archived automatically the first time a comp is moved to a new patch version.
                    </p>
                </div>
            ) : (
                <p className="archive-hint">Select a patch above to view its tier list.</p>
            )}
        </div>
    )
}

export default ArchivePage
