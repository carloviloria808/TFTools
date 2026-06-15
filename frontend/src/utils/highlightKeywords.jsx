const keywords = [
    { word: 'Precision',   color: '#f0a843' },
    { word: 'Shred',       color: '#4fc3f7' },
    { word: 'Sunder',      color: '#e8651a' },
    { word: 'Chill',       color: '#00e5ff' },
    { word: 'Burn',        color: '#e55050' },
    { word: 'Wound',       color: '#b06cc4' },
    { word: 'Stun',        color: '#f9ca24' },
    { word: 'Mana Reave',  color: '#7c6ff7' },
    { word: 'Disarm',      color: '#a29bfe' },
    { word: 'Slow',        color: '#74b9ff' },
    { word: 'Banish',      color: '#dfe6e9' },
]

// Builds a regex that matches any keyword (whole word, case-sensitive)
const keywordRegex = new RegExp(
    `(${keywords.map(k => k.word).join('|')})`,
    'g'
)

const colorMap = Object.fromEntries(keywords.map(k => [k.word, k.color]))

export function highlightKeywords(text) {
    if (!text) return null
    const parts = text.split(keywordRegex)
    return parts.map((part, i) =>
        colorMap[part]
            ? <span key={i} style={{ color: colorMap[part], fontWeight: 'bold' }}>{part}</span>
            : part
    )
}
