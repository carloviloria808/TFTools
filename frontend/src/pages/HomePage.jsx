import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { Link } from 'react-router-dom'
import { getChampions, getTraits, getItems, getAugmentsByTier, getGods, getCompositions } from '../services/api'
import { HomeSectionSkeleton } from '../components/Skeleton'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'

const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3'
}

const PLAYSTYLE_COLORS = {
    'Reroll':   '#00b894',
    'Fast 8':   '#6c5ce7',
    'Fast 9':   '#e17055',
    'Standard': '#74b9ff',
}

function CardMontage({ images }) {
    if (!images || images.length === 0) return null
    return (
        <div className="home-card-montage">
            {images.slice(0, 6).map((url, i) => (
                <img key={i} src={url} alt="" className="home-card-montage-img" />
            ))}
        </div>
    )
}

function CompFeaturedCard({ comp }) {
    const tier = comp.tier?.trim()
    const accentColor = PLAYSTYLE_COLORS[comp.playstyle] ?? 'rgba(255,255,255,0.07)'
    return (
        <Link
            to={`/compositions/${comp.id}`}
            className="home-comp-card"
            style={{ borderColor: `${accentColor}55`, '--card-accent': accentColor }}
        >
            {/* Carry image */}
            <div className="home-comp-card-img-wrap">
                {comp.carryImageUrl
                    ? <img src={comp.carryImageUrl} alt={comp.name} className="home-comp-card-img" />
                    : <div className="home-comp-card-img-placeholder" />
                }
                <span className="home-comp-card-tier" style={{ background: TIER_COLORS[tier] }}>
                    {tier}
                </span>
            </div>

            {/* Info */}
            <div className="home-comp-card-body">
                <div className="home-comp-card-name">{comp.name}</div>

                <div className="home-comp-card-chips">
                    {comp.playstyle && (
                        <span
                            className="home-comp-chip"
                            style={{ color: PLAYSTYLE_COLORS[comp.playstyle] ?? '#aaa', borderColor: PLAYSTYLE_COLORS[comp.playstyle] ?? '#aaa' }}
                        >
                            {comp.playstyle}
                        </span>
                    )}
                    {comp.difficulty && (
                        <span className="home-comp-chip home-comp-chip-diff">{comp.difficulty}</span>
                    )}
                </div>

                {/* Stats row */}
                {(comp.top4Rate != null || comp.winRate != null) && (
                    <div className="home-comp-card-stats">
                        {comp.top4Rate != null && (
                            <div className="home-comp-stat">
                                <span className="home-comp-stat-val">{(comp.top4Rate * 100).toFixed(1)}%</span>
                                <span className="home-comp-stat-lbl">Top 4</span>
                            </div>
                        )}
                        {comp.winRate != null && (
                            <div className="home-comp-stat">
                                <span className="home-comp-stat-val">{(comp.winRate * 100).toFixed(1)}%</span>
                                <span className="home-comp-stat-lbl">Win</span>
                            </div>
                        )}
                        {comp.avgPlacement != null && (
                            <div className="home-comp-stat">
                                <span className="home-comp-stat-val">{comp.avgPlacement.toFixed(2)}</span>
                                <span className="home-comp-stat-lbl">Avg</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="home-comp-card-desc">{comp.description}</div>
            </div>
        </Link>
    )
}

function MetaCarousel({ comps, pageSize = 6, gridClass = 'home-comp-grid' }) {
    const [page, setPage] = useState(0)
    const [paused, setPaused] = useState(false)

    const pageCount = Math.ceil(comps.length / pageSize)
    const pages = Array.from({ length: pageCount }, (_, i) =>
        comps.slice(i * pageSize, (i + 1) * pageSize)
    )

    // Auto-advance every 5s unless paused (hover)
    useEffect(() => {
        if (pageCount <= 1 || paused) return
        const id = setInterval(() => setPage(p => (p + 1) % pageCount), 9000)
        return () => clearInterval(id)
    }, [pageCount, paused])

    // Single page — no carousel chrome
    if (pageCount <= 1) {
        return (
            <div className={gridClass}>
                {comps.map(c => <CompFeaturedCard key={c.id} comp={c} />)}
            </div>
        )
    }

    const go = dir => setPage(p => (p + dir + pageCount) % pageCount)

    return (
        <div
            className="meta-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="meta-carousel-viewport">
                <div
                    className="meta-carousel-track"
                    style={{ transform: `translateX(-${page * 100}%)` }}
                >
                    {pages.map((p, i) => (
                        <div key={i} className={`meta-carousel-page ${gridClass}`}>
                            {p.map(c => <CompFeaturedCard key={c.id} comp={c} />)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="meta-carousel-controls">
                <button className="meta-carousel-arrow" onClick={() => go(-1)} aria-label="Previous">‹</button>
                <div className="meta-carousel-dots">
                    {pages.map((_, i) => (
                        <button
                            key={i}
                            className={`meta-carousel-dot ${i === page ? 'meta-carousel-dot-active' : ''}`}
                            onClick={() => setPage(i)}
                            aria-label={`Page ${i + 1}`}
                        />
                    ))}
                </div>
                <button className="meta-carousel-arrow" onClick={() => go(1)} aria-label="Next">›</button>
            </div>
        </div>
    )
}

function HomePage() {
    usePageTitle(null)
    const { recent, clearRecent } = useRecentlyViewed()
    const [cardImages, setCardImages] = useState({
        champions: [], traits: [], items: [], augments: [], gods: [], compositions: []
    })
    const [metaComps,     setMetaComps]     = useState([])
    const [beginnerComps, setBeginnerComps] = useState([])
    const [compsLoading,  setCompsLoading]  = useState(true)

    useEffect(() => {
        Promise.allSettled([
            getChampions(),
            getTraits(),
            getItems(),
            getAugmentsByTier('1'),
            getAugmentsByTier('2'),
            getAugmentsByTier('3'),
            getGods(),
            getCompositions(),
        ]).then(([champions, traits, items, silverAugments, goldAugments, prismaticAugments, gods, comps]) => {
            const pick = (result, key = 'imageUrl') =>
                result.status === 'fulfilled'
                    ? result.value.data.filter(x => x[key]).map(x => x[key])
                    : []

            const champImgs   = pick(champions)
            const silverImgs  = pick(silverAugments).slice(0, 2)
            const goldImgs    = pick(goldAugments).slice(0, 2)
            const prismaticImgs = pick(prismaticAugments).slice(0, 2)

            setCardImages({
                champions:    champImgs.slice(0, 6),
                traits:       pick(traits),
                items:        pick(items).slice(0, 6),
                augments:     [...silverImgs, ...goldImgs, ...prismaticImgs],
                gods:         pick(gods),
                compositions: champImgs.slice(6, 12),
            })

            setCompsLoading(false)
            if (comps.status === 'fulfilled') {
                const all = comps.value.data

                // Meta: S → A → B tier, sorted by tier then win rate desc — up to 18 (3 carousel pages)
                const meta = [...all]
                    .filter(c => ['S', 'A', 'B'].includes(c.tier?.trim()))
                    .sort((a, b) => {
                        const tierOrder = { S: 0, A: 1, B: 2 }
                        const ta = tierOrder[a.tier?.trim()] ?? 3
                        const tb = tierOrder[b.tier?.trim()] ?? 3
                        if (ta !== tb) return ta - tb
                        return (b.winRate ?? 0) - (a.winRate ?? 0)
                    })
                    .slice(0, 18)
                setMetaComps(meta)

                // Beginners: Easy difficulty, sorted by tier — up to 12 (3 carousel pages)
                const beginners = [...all]
                    .filter(c => c.difficulty === 'Easy')
                    .sort((a, b) => {
                        const order = { S: 0, A: 1, B: 2, C: 3, X: 4 }
                        return (order[a.tier?.trim()] ?? 5) - (order[b.tier?.trim()] ?? 5)
                    })
                    .slice(0, 12)
                setBeginnerComps(beginners)
            }
        })
    }, [])

    return (
        <div className="home-page">

            {/* ── Hero ── */}
            <div className="hero">
                <img src="/abyssia.png" alt="Abyssia" className="hero-champion hero-champion-right" />
                <img src="/grizzle.png" alt="Grizzle" className="hero-champion hero-champion-left" />
                <div className="hero-brand">
                    <h1 className="hero-title">TF<span>Tools</span></h1>
                    <div className="hero-divider" />
                    <img src="/tftgodslogo.png" alt="TFT Space Gods" className="hero-set-logo" />
                </div>
                <p className="hero-subtitle">
                    Your ultimate companion for Teamfight Tactics Set 17: Space Gods
                </p>
                <div className="hero-newplayer">
                    <span className="hero-newplayer-label">🌱 New to TFT?</span>
                    <Link to="/guide" className="hero-newplayer-btn">📖 Beginner Guide</Link>
                    <Link to="/glossary" className="hero-newplayer-btn">📚 Glossary</Link>
                    <a href="https://www.youtube.com/watch?v=SP20lQatN2c" target="_blank" rel="noreferrer" className="hero-newplayer-btn">▶ Intro to TFT Guide</a>
                </div>
            </div>

            {/* ── Navigation Cards ── */}
            <div className="home-grid">
                <Link to="/champions" className="home-card">
                    <CardMontage images={cardImages.champions} />
                    <div className="home-card-icon">⚔️</div>
                    <h2>Champions</h2>
                    <p>Browse all 64 champions, their costs and traits</p>
                </Link>
                <Link to="/traits" className="home-card">
                    <CardMontage images={cardImages.traits} />
                    <div className="home-card-icon">🔮</div>
                    <h2>Traits</h2>
                    <p>Explore all 32 traits and their breakpoint bonuses</p>
                </Link>
                <Link to="/items" className="home-card">
                    <CardMontage images={cardImages.items} />
                    <div className="home-card-icon">🛡️</div>
                    <h2>Items</h2>
                    <p>Find item recipes and discover combined items</p>
                </Link>
                <Link to="/augments" className="home-card">
                    <CardMontage images={cardImages.augments} />
                    <div className="home-card-icon">✨</div>
                    <h2>Augments</h2>
                    <p>Browse Silver, Gold, and Prismatic augments</p>
                </Link>
                <Link to="/gods" className="home-card">
                    <CardMontage images={cardImages.gods} />
                    <div className="home-card-icon">🌟</div>
                    <h2>Gods</h2>
                    <p>Learn about all 9 Space Gods and their offerings</p>
                </Link>
                <Link to="/compositions" className="home-card">
                    <CardMontage images={cardImages.compositions} />
                    <div className="home-card-icon">📊</div>
                    <h2>Tier List</h2>
                    <p>Browse the best compositions ranked S through X tier</p>
                </Link>
            </div>

            {/* ── Recently Viewed ── */}
            {recent.length > 0 && (
                <section className="home-section">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">
                                <span className="home-section-dot home-section-dot-blue" />
                                Recently Viewed
                            </h2>
                            <p className="home-section-sub">Comps you've looked at recently</p>
                        </div>
                        <button className="home-section-clear" onClick={clearRecent}>Clear</button>
                    </div>
                    <div className="home-comp-grid">
                        {recent.map(c => <CompFeaturedCard key={c.id} comp={c} />)}
                    </div>
                </section>
            )}

            {/* ── Meta Snapshot ── */}
            {compsLoading ? <HomeSectionSkeleton count={6} /> : metaComps.length > 0 && (
                <section className="home-section">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">
                                <span className="home-section-dot home-section-dot-gold" />
                                Meta Snapshot
                            </h2>
                            <p className="home-section-sub">Top compositions for Patch 17.5</p>
                        </div>
                        <Link to="/compositions" className="home-section-link">View Full Tier List →</Link>
                    </div>
                    <MetaCarousel comps={metaComps} pageSize={6} />
                </section>
            )}

            {/* ── Beginner Picks ── */}
            {compsLoading ? <HomeSectionSkeleton count={4} /> : beginnerComps.length > 0 && (
                <section className="home-section">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">
                                <span className="home-section-dot home-section-dot-green" />
                                Beginner Friendly
                            </h2>
                            <p className="home-section-sub">Easy comps to pilot — great if you're learning the set</p>
                        </div>
                        <Link to="/compositions" className="home-section-link">See All Comps →</Link>
                    </div>
                    <MetaCarousel comps={beginnerComps} pageSize={4} gridClass="home-comp-grid home-comp-grid-4" />
                </section>
            )}

            {/* ── Trailer ── */}
            <div className="trailer-section">
                <div className="trailer-text">
                    <h2 className="trailer-title">TFT Space Gods Set Trailer</h2>
                    <p className="trailer-description">
                        Ready for some divine intervention? The very power of the cosmos can be yours — worship wisely. TFT's latest set, Space Gods, has arrived. Play now!
                    </p>
                </div>
                <div className="trailer-video">
                    <iframe
                        src="https://www.youtube.com/embed/iN_15JAyTXo"
                        title="TFT Space Gods Set Trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>

        </div>
    )
}

export default HomePage
