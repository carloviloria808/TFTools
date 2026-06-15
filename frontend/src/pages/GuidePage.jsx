import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const SECTIONS = [
    {
        id: 'what-is-tft',
        emoji: '🎮',
        title: 'What is TFT?',
        content: `Teamfight Tactics (TFT) is an auto-battler game mode inside League of Legends. Eight players compete on a shared carousel of champions, each building their own team on a hexagonal board. Every round, your team automatically fights another player's team. The last player standing wins.

A full game lasts roughly 30–45 minutes and is split into stages. Each stage has several rounds of combat plus one shared-draft "carousel" round where all players pick a free champion.

Your goal: build the strongest possible team using champion synergies, items, and augments — while managing your gold economy efficiently.`
    },
    {
        id: 'board-positioning',
        emoji: '🏁',
        title: 'The Board & Positioning',
        content: `Your board is a 4×7 hex grid. The bottom two rows are your side — the top two belong to the enemy (mirrored each fight).

Positioning matters a lot:
• Front row (row 1) — tanks, bruisers, and frontline units that absorb damage
• Back row (row 4) — carries and squishies that deal the most damage

Units auto-attack the nearest enemy, so your carries need protection. Put your tankiest units up front and your damage dealers in the back corners.

Pro tip: spread out your units to avoid AoE abilities, and position carries away from assassins (who jump to the back row).`
    },
    {
        id: 'shop-and-costs',
        emoji: '🛒',
        title: 'The Shop & Champion Costs',
        content: `Each round you get a shop of 5 random champions. Champions come in 5 cost tiers:

• 1 Gold — common, easy to find, great for early game
• 2 Gold — slightly rarer, good mid-game value
• 3 Gold — core units for most compositions
• 4 Gold — powerful carries, available mid-to-late game
• 5 Gold — elite carries, only appear after level 7+

You can hold up to 9 champions on your bench. Buying three copies of the same champion merges them into a 2-star version (stronger stats). Three 2-stars become a 3-star (very powerful).

Rerolling the shop costs 2 gold. You can lock your shop (press the lock icon) to keep the same options next round.`
    },
    {
        id: 'traits',
        emoji: '🔮',
        title: 'Traits & Synergies',
        content: `Every champion belongs to one or more traits (shown as icons under their portrait). When you field enough champions sharing a trait, you unlock a trait bonus for your whole team.

Each trait has multiple breakpoints — higher breakpoints give stronger bonuses. For example:
• Dark Star at 2 units: minor bonus
• Dark Star at 4 units: stronger bonus
• Dark Star at 6 units: even stronger bonus

The active traits panel (left side of the board) shows your current counts and highlights which breakpoints you've hit.

You don't need to activate every trait — focus on 2-3 strong synergies that support your carry. Trying to activate too many traits at once often results in a weak team with no clear power spike.

Check the Traits page on TFTools to see every breakpoint and its exact bonus.`
    },
    {
        id: 'items',
        emoji: '🛡️',
        title: 'Items 101',
        content: `Items drop from PvE rounds (wolves, raptors, etc.) as components. Each component can be combined with another to make a powerful combined item.

There are 9 base components:
B.F. Sword, Recurve Bow, Chain Vest, Negatron Cloak, Needlessly Large Rod, Tear of the Goddess, Giant's Belt, Spatula, Sparring Gloves

Combining two components gives you a combined item (e.g. B.F. Sword + B.F. Sword = Infinity Edge). Every component combination produces a unique item.

Key tips:
• Put your best items on your main carry
• Defensive items (Warmog's, Dragon's Claw) go on frontline tanks
• Spatula items grant a bonus trait — very powerful if it fits your comp
• You can see recipes on the Items page of TFTools
• The Team Builder shows exactly which components you need`
    },
    {
        id: 'economy',
        emoji: '💰',
        title: 'Economy Basics',
        content: `Gold management is the most important skill in TFT. Here's how it works:

Interest: You earn 1 bonus gold per 10 gold you have saved (up to 5 bonus gold at 50g). Always try to save gold in multiples of 10.

Passive income: You earn 5 gold per round regardless.

Win/Loss streaks: Winning or losing consecutive rounds grants bonus gold (1-3g). Committing to a streak (either winning or losing) is often more profitable than going 50/50.

Leveling up: Spending XP to level up lets you field more units. Higher levels also increase the chance of seeing 4 and 5-cost champions in your shop.

When to roll: Don't blindly spend all your gold. Save to 50g for maximum interest, then decide when to "roll down" (spend gold rerolling) based on your health and stage.

Stage 2-3: Save gold, don't roll unless you're losing badly.
Stage 4+: Start rolling if you need to stabilize your board.`
    },
    {
        id: 'stages',
        emoji: '📅',
        title: 'Stage Guide',
        content: `TFT is divided into stages, each with multiple rounds:

Stage 1 — Carousel: Pick a champion + item from the shared carousel. Prioritize components over champions.

Stage 2 — Early Game: Build a strong early board with cheap synergies. Save gold. Don't roll. Take whatever items drop from wolves.

Stage 3 — Mid Game: Start thinking about your final composition. Hit level 6 for a 6-unit board. Take damage from wolves/raptors — items here matter.

Stage 4 — Transition: This is the most critical stage. Decide on your final carry and start itemizing them. Consider rolling down at 4-1 or 4-2 if you're low on health.

Stage 5+ — Late Game: Level up to 8-9 to roll for 4 and 5-cost champions. Finalize your board positioning and item distribution.

The "Stage Guide" on each comp on TFTools gives specific advice for what to do each stage for that comp.`
    },
    {
        id: 'augments',
        emoji: '✨',
        title: 'Augments',
        content: `Augments are powerful permanent bonuses you choose at stages 2-1, 3-2, and 4-2. Each round you pick one of three random augments.

There are three tiers:
• Silver — the weakest, offered earliest
• Gold — mid-tier, more impactful
• Prismatic — the strongest augments in the game

Tips for picking augments:
• Prioritize augments that directly boost your carry or your main traits
• Economy augments (extra gold, interest) are great early
• Combat augments (damage, shields) are better late
• Reroll if you get three augments that don't fit your comp at all

Check the Augment Tier List on TFTools to see which augments are rated S through D tier for the current patch.`
    },
    {
        id: 'using-tftools',
        emoji: '🧰',
        title: 'How to Use TFTools',
        content: `TFTools is designed to help you play better at every stage of the game. Here's a quick tour:

📊 Comp Tier List — Browse S through X tier compositions for the current patch. Each comp shows win rate, top 4 rate, playstyle, and difficulty. Click a comp to see its full board, items, and stage guide.

⚔️ Champions — Every champion with their traits, stats, ability, and recommended items. Great for checking what a champion does before you buy them.

🔮 Traits — All trait breakpoints and bonuses. Use this to plan which synergies to activate.

🛡️ Items — Full item recipe chart. Check what components combine into what.

✨ Augments — Browse all augments with their full descriptions and tier ratings.

🌟 Gods — What each Space God offers at each stage. Knowing this helps you decide who to pray to during a God round.

🏗️ Team Builder — Build and test compositions before your next game. Supports drag and drop, shareable URLs, and export as image.

📖 Glossary — Quick reference for TFT terms and jargon.`
    },
]

function GuideSection({ section }) {
    const [open, setOpen] = useState(false)

    return (
        <div className={`guide-section ${open ? 'guide-section-open' : ''}`}>
            <button className="guide-section-header" onClick={() => setOpen(o => !o)}>
                <span className="guide-section-emoji">{section.emoji}</span>
                <span className="guide-section-title">{section.title}</span>
                <span className="guide-section-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="guide-section-body">
                    {section.content.split('\n\n').map((para, i) => (
                        <p key={i} className="guide-para">
                            {para.split('\n').map((line, j) => (
                                <span key={j}>
                                    {line}
                                    {j < para.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}

function GuidePage() {
    usePageTitle('Beginner Guide')
    const [allOpen, setAllOpen] = useState(false)

    return (
        <div className="guide-page">
            <div className="guide-hero">
                <h1 className="guide-title">Beginner's Guide to TFT</h1>
                <p className="guide-subtitle">New to Teamfight Tactics Set 17: Space Gods? Start here.</p>
                <div className="guide-hero-links">
                    <Link to="/compositions" className="guide-cta-btn">Browse Comps →</Link>
                    <Link to="/glossary" className="guide-cta-btn guide-cta-btn-secondary">TFT Glossary →</Link>
                </div>
            </div>

            {/* Quick nav */}
            <div className="guide-toc">
                <span className="guide-toc-label">Jump to:</span>
                {SECTIONS.map(s => (
                    <a key={s.id} href={`#${s.id}`} className="guide-toc-link">
                        {s.emoji} {s.title}
                    </a>
                ))}
            </div>

            {/* Expand all toggle */}
            <div className="guide-expand-row">
                <button className="guide-expand-all" onClick={() => setAllOpen(o => !o)}>
                    {allOpen ? 'Collapse all ▲' : 'Expand all ▼'}
                </button>
                <span className="guide-section-count">{SECTIONS.length} sections</span>
            </div>

            {/* Sections */}
            <div className="guide-sections" id="guide-top">
                {SECTIONS.map(s => (
                    <div key={s.id} id={s.id}>
                        <GuideSection section={s} forceOpen={allOpen} />
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="guide-footer">
                <p>Ready to start climbing? Check out the comp tier list for the best compositions right now.</p>
                <Link to="/compositions" className="guide-cta-btn">View Tier List →</Link>
            </div>
        </div>
    )
}

export default GuidePage
