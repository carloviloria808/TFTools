// ── Shared skeleton building blocks ──────────────────────────────────────────
// All shimmer animation is driven by the .skel class in index.css

// ── 1. Compositions tier list skeleton ───────────────────────────────────────

export function TierListSkeleton() {
    const rows = [
        { tier: 'S', count: 2 },
        { tier: 'A', count: 3 },
        { tier: 'B', count: 8 },
        { tier: 'C', count: 7 },
    ]
    return (
        <div className="comp-tier-list">
            {rows.map(({ tier, count }) => (
                <div key={tier} className="comp-tier-row skel-tier-row">
                    <div className="skel skel-tier-label" />
                    <div className="comp-tier-items">
                        {Array.from({ length: count }, (_, i) => (
                            <div key={i} className="skel skel-comp-icon" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── 2. Comp detail modal skeleton ─────────────────────────────────────────────

export function CompDetailSkeleton() {
    return (
        <div className="cdm-skel">
            {/* Header */}
            <div className="cdm-skel-header">
                <div className="skel cdm-skel-portrait" />
                <div className="cdm-skel-title-col">
                    <div className="skel cdm-skel-name" />
                    <div className="skel cdm-skel-sub" />
                    <div className="cdm-skel-chips">
                        <div className="skel cdm-skel-chip" />
                        <div className="skel cdm-skel-chip" />
                        <div className="skel cdm-skel-chip cdm-skel-chip-wide" />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="cdm-skel-body">
                {/* Left panel */}
                <div className="cdm-skel-panel">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="skel cdm-skel-line" style={{ width: i % 2 === 0 ? '85%' : '65%' }} />
                    ))}
                </div>

                {/* Board */}
                <div className="cdm-skel-board">
                    {Array.from({ length: 4 }, (_, r) => (
                        <div key={r} className="cdm-skel-board-row" style={{ marginLeft: r % 2 === 0 ? '28px' : '0' }}>
                            {Array.from({ length: 7 }, (_, c) => (
                                <div key={c} className="skel cdm-skel-cell" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── 3. Homepage featured comp card skeleton ───────────────────────────────────

export function CompCardSkeleton() {
    return (
        <div className="home-comp-card-skel">
            <div className="skel home-skel-img" />
            <div className="home-skel-body">
                <div className="skel home-skel-title" />
                <div className="home-skel-chips">
                    <div className="skel home-skel-chip" />
                    <div className="skel home-skel-chip" />
                </div>
                <div className="skel home-skel-stats" />
            </div>
        </div>
    )
}

export function HomeSectionSkeleton({ count = 6 }) {
    return (
        <section className="home-section">
            <div className="home-section-header">
                <div className="home-skel-section-title-col">
                    <div className="skel home-skel-section-title" />
                    <div className="skel home-skel-section-sub" />
                </div>
            </div>
            <div className="home-comp-grid">
                {Array.from({ length: count }, (_, i) => (
                    <CompCardSkeleton key={i} />
                ))}
            </div>
        </section>
    )
}
