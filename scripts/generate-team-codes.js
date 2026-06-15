// Generates frontend/src/data/teamPlannerCodes.js from CommunityDragon's
// team planner data. Run when the set roster changes:
//   curl -s -o ~/tp.json https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions-teamplanner.json
//   node scripts/generate-team-codes.js
const fs = require('fs')
const path = require('path')

const SET_KEY = 'TFTSet17'
const src = process.argv[2] || 'C:/Users/carlo/tp.json'

const data = JSON.parse(fs.readFileSync(src, 'utf8'))
const champs = data[SET_KEY]
if (!champs) throw new Error(`${SET_KEY} not found in ${src} — keys: ${Object.keys(data)}`)

const map = {}
champs
    .slice()
    .sort((a, b) => a.team_planner_code - b.team_planner_code)
    .forEach(c => { map[c.character_id.toLowerCase()] = c.team_planner_code })

const out =
`// TFT Team Planner codes for Set 17 — generated from CommunityDragon
// Source: /plugins/rcp-be-lol-game-data/global/default/v1/tftchampions-teamplanner.json
// Regenerate with scripts/generate-team-codes.js when the roster changes.

export const TEAM_PLANNER_SET = '${SET_KEY}'

export const TEAM_PLANNER_CODES = ${JSON.stringify(map, null, 4).replace(/"/g, "'")}
`

const dest = path.join(__dirname, '..', 'frontend', 'src', 'data', 'teamPlannerCodes.js')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, out)
console.log(`Wrote ${Object.keys(map).length} champion codes to ${dest}`)
