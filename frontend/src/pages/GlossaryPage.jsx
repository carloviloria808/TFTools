import { useState, useMemo } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

const TERMS = [
    { term: 'Augment', definition: 'A permanent power-up chosen at stages 2-1, 3-2, and 4-2. Comes in Silver, Gold, and Prismatic tiers — Prismatic being the strongest.' },
    { term: 'BIS', definition: 'Best In Slot. The optimal item combination for a specific champion. E.g. "Corki BIS is Infinity Edge, Last Whisper, Jeweled Gauntlet."' },
    { term: 'Bench', definition: 'The 9 slots below your board where you store champions you\'re not currently fielding. Units on the bench don\'t fight.' },
    { term: 'Carousel', definition: 'A shared round at the start of each stage where all players pick from a circle of champions holding items. Lower HP players pick first.' },
    { term: 'Capped', definition: 'A fully optimized board — every champion is at max star level with BIS items. "I\'m capped" means you have nothing left to improve.' },
    { term: 'Contested', definition: 'When another player is building the same composition or buying the same champions as you. Contested champions are harder to 3-star.' },
    { term: 'Econ', definition: 'Short for economy. "Playing econ" means saving gold to maintain interest and level up efficiently rather than spending it all on rerolls.' },
    { term: 'Emblem', definition: 'A special item (usually from Spatula combinations) that grants a champion an additional trait, potentially activating new synergies.' },
    { term: 'Fast 8', definition: 'A strategy where you rush to level 8 as quickly as possible to access powerful 4-cost carries. Requires strong economy management.' },
    { term: 'Fast 9', definition: 'An aggressive leveling strategy to reach level 9 for 5-cost champions. High risk, high reward — requires a healthy economy.' },
    { term: 'Flex', definition: 'A composition or unit that fits into multiple different team comps. "Karma is flex" means she works in many different builds.' },
    { term: 'Frontline', definition: 'Tanky champions placed in the front rows to absorb damage and protect your carries. Usually have high HP, armor, and magic resist.' },
    { term: 'Headliner', definition: 'In some TFT sets, a special high-powered version of a champion that provides extra trait stacks. Not applicable to all sets.' },
    { term: 'Highroll', definition: 'When you get extremely lucky — finding multiple copies of a key champion, getting the perfect augment, or hitting your carry early.' },
    { term: 'Hyper Roll', definition: 'A game mode variant where rounds are faster and gold income is different. Also refers to a strategy of rolling heavily at level 4-5 to 3-star 1-2 cost champions.' },
    { term: 'Interest', definition: 'Bonus gold earned for saving gold. You gain 1 gold per 10g saved, up to a maximum of 5 bonus gold at 50 gold.' },
    { term: 'Level Up', definition: 'Spending 4 XP to increase your player level, which lets you field one more unit and unlocks higher-cost champions in your shop.' },
    { term: 'Lock Shop', definition: 'Preventing your shop from refreshing between rounds. Useful when you see a champion you need and don\'t want to lose those options.' },
    { term: 'Loss Streak', definition: 'Intentionally losing consecutive rounds to earn streak bonus gold (up to 3g per round). A common econ strategy in the early game.' },
    { term: 'Lowroll', definition: 'The opposite of highroll — bad luck such as not finding your key champions, getting poor augment options, or receiving weak item drops.' },
    { term: 'Opener', definition: 'Your early-game board before you transition into your final composition. A good opener preserves HP and gold while setting up your late game.' },
    { term: 'Pivot', definition: 'Changing your composition mid-game, usually because your original plan is contested or your units aren\'t appearing. Flexibility is key.' },
    { term: 'Prismatic', definition: 'The highest tier of augment. Prismatic augments are extremely powerful and can define your entire game plan.' },
    { term: 'Reroll', definition: 'A strategy where you stop at a low level (5-7) and spend gold rolling to 3-star key cheap champions rather than leveling to access expensive units.' },
    { term: 'Roll Down', definition: 'Spending a large amount of gold rerolling the shop at a specific stage to find your key units. "Rolling down at 4-1" is a common timing.' },
    { term: 'Scuttle', definition: 'The PvE round featuring the Scuttle Crab. Usually appears at 3-4 and 5-4, dropping bonus loot.' },
    { term: 'Scouting', definition: 'Checking other players\' boards (by clicking their portraits) to see what they\'re building, what items they have, and whether your comp is contested.' },
    { term: 'Slow Roll', definition: 'Staying at a specific level and rolling each round to maintain shop odds for lower-cost champions. Common for 3-cost reroll comps.' },
    { term: 'Spatula', definition: 'A base component that combines with any other component to create an Emblem item, granting the wearer an additional trait.' },
    { term: 'Spiked', definition: 'When your board suddenly becomes very powerful, usually from hitting a key 2-star or 3-star champion, or combining a perfect item.' },
    { term: 'Stage', definition: 'TFT is divided into numbered stages (1, 2, 3...). Each stage has multiple PvP and PvE rounds. New stages introduce stronger enemies and higher-cost shop odds.' },
    { term: 'Streaking', definition: 'Maintaining a win streak or loss streak to earn bonus gold each round. Committing to a streak is better than going 50/50.' },
    { term: 'Tempo', definition: 'How strong your board is relative to others at the same stage. "High tempo" means your board is stronger than average for the current point in the game.' },
    { term: 'Top 4', definition: 'Finishing in the top 4 players. In ranked TFT, top 4 earns LP (League Points). Top 1 (first place) earns more LP.' },
    { term: 'Transition', definition: 'Moving from your early/mid-game board to your final end-game composition, usually around stages 3-4.' },
    { term: 'Tristana Board', definition: 'A placeholder nickname sometimes used to describe a random unsynergized board of whatever champions you happened to find.' },
    { term: 'Win Streak', definition: 'Winning multiple rounds in a row, earning bonus gold each round. Usually pursued by players with strong early boards.' },
    { term: 'XP', definition: 'Experience points used to level up your player level. You gain 2 XP per round passively, or can buy 4 XP for 4 gold.' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function GlossaryPage() {
    usePageTitle('Glossary')
    const [search, setSearch] = useState('')
    const [activeLetter, setActiveLetter] = useState(null)

    const filtered = useMemo(() => {
        let list = TERMS
        if (search.trim())    list = list.filter(t => t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()))
        if (activeLetter)     list = list.filter(t => t.term.toUpperCase().startsWith(activeLetter))
        return list.sort((a, b) => a.term.localeCompare(b.term))
    }, [search, activeLetter])

    const usedLetters = new Set(TERMS.map(t => t.term[0].toUpperCase()))

    return (
        <div className="glossary-page">
            <h1 className="glossary-title">TFT Glossary</h1>
            <p className="glossary-subtitle">Quick reference for common TFT terms and jargon</p>

            {/* Search */}
            <div className="glossary-search-wrap">
                <input
                    className="glossary-search"
                    type="text"
                    placeholder="Search terms or definitions..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setActiveLetter(null) }}
                    autoFocus
                />
                {search && (
                    <button className="glossary-search-clear" onClick={() => setSearch('')}>✕</button>
                )}
            </div>

            {/* Alphabet nav */}
            <div className="glossary-alphabet">
                <button
                    className={`glossary-letter ${activeLetter === null && !search ? 'glossary-letter-active' : ''}`}
                    onClick={() => { setActiveLetter(null); setSearch('') }}
                >All</button>
                {ALPHABET.map(letter => (
                    <button
                        key={letter}
                        className={`glossary-letter ${activeLetter === letter ? 'glossary-letter-active' : ''} ${!usedLetters.has(letter) ? 'glossary-letter-empty' : ''}`}
                        onClick={() => { if (usedLetters.has(letter)) { setActiveLetter(l => l === letter ? null : letter); setSearch('') } }}
                        disabled={!usedLetters.has(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {/* Count */}
            <p className="glossary-count">
                {filtered.length} term{filtered.length !== 1 ? 's' : ''}
                {(search || activeLetter) && (
                    <button className="glossary-clear-filter" onClick={() => { setSearch(''); setActiveLetter(null) }}>
                        Clear filter
                    </button>
                )}
            </p>

            {/* Terms list */}
            {filtered.length === 0 ? (
                <div className="no-results">No terms found for "{search}"</div>
            ) : (
                <div className="glossary-list">
                    {filtered.map(({ term, definition }) => (
                        <div key={term} className="glossary-entry">
                            <dt className="glossary-term">{term}</dt>
                            <dd className="glossary-def">{definition}</dd>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default GlossaryPage
