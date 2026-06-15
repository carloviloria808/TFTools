import { TEAM_PLANNER_CODES, TEAM_PLANNER_SET } from '../data/teamPlannerCodes'

const SLOTS = 10

// Pull the CDragon character id (e.g. "tft17_corki") out of any of our image URLs
export function apiNameFromImageUrl(imageUrl) {
    const m = (imageUrl || '').toLowerCase().match(/characters\/(tft\d+_[a-z0-9]+)\//)
    return m ? m[1] : null
}

/**
 * Builds an in-game Team Planner code from a list of champions.
 * Format (reverse-engineered, community standard):
 *   "02" + one 2-hex-digit team_planner_code per slot (10 slots, "00" = empty) + set id
 * Champions are sorted by cost, then name — matching how planner imports read.
 * Returns null if no champion could be mapped.
 */
export function buildTeamCode(champions) {
    const codes = (champions || [])
        .slice()
        .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0) || (a.name ?? '').localeCompare(b.name ?? ''))
        .map(c => {
            const apiName = apiNameFromImageUrl(c.imageUrl)
            return apiName != null ? TEAM_PLANNER_CODES[apiName] : undefined
        })
        .filter(code => code !== undefined)
        .slice(0, SLOTS)

    if (codes.length === 0) return null

    const hex = codes
        .concat(Array(SLOTS - codes.length).fill(0))
        .map(code => code.toString(16).padStart(2, '0'))
        .join('')

    return `02${hex}${TEAM_PLANNER_SET}`
}

/**
 * Decodes an in-game Team Code back into our champion objects.
 * `allChampions` is the list from GET /Champions (needs imageUrl for mapping).
 * Returns { champions, missing } on success or { error } on failure.
 */
export function parseTeamCode(code, allChampions) {
    const cleaned = (code || '').trim()
    const m = cleaned.match(/^0[12]((?:[0-9a-fA-F]{2})+)(TFTSet\w+)$/)
    if (!m) return { error: 'That doesn\'t look like a valid Team Code.' }

    const [, hexRun, setId] = m
    if (setId.toLowerCase() !== TEAM_PLANNER_SET.toLowerCase())
        return { error: `That code is for ${setId} — this site covers ${TEAM_PLANNER_SET}.` }

    // Reverse map: planner code → character id → our champion record
    const codeToApi = {}
    Object.entries(TEAM_PLANNER_CODES).forEach(([apiName, plannerCode]) => {
        codeToApi[plannerCode] = apiName
    })
    const byApi = {}
    ;(allChampions || []).forEach(c => {
        const apiName = apiNameFromImageUrl(c.imageUrl)
        if (apiName) byApi[apiName] = c
    })

    const champions = []
    const missing = []
    for (let i = 0; i < hexRun.length; i += 2) {
        const value = parseInt(hexRun.slice(i, i + 2), 16)
        if (value === 0) continue   // empty slot
        const champ = byApi[codeToApi[value]]
        if (champ) champions.push(champ)
        else missing.push(value)
    }

    if (champions.length === 0) return { error: 'No recognizable champions in that code.' }
    return { champions, missing }
}
