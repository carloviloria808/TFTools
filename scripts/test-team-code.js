// Round-trip sanity test for the team code encode/decode logic
const fs = require('fs')

const data = JSON.parse(fs.readFileSync('C:/Users/carlo/tp.json', 'utf8')).TFTSet17
const codeToName = {}
data.forEach(c => { codeToName[c.team_planner_code] = c.display_name })

const code = '021a163d251519183c0000TFTSet17'
const m = code.match(/^0[12]((?:[0-9a-fA-F]{2})+)(TFTSet\w+)$/)
if (!m) throw new Error('regex failed to match!')

const [, hexRun, setId] = m
console.log('set id parsed:', setId)
const names = []
for (let i = 0; i < hexRun.length; i += 2) {
    const v = parseInt(hexRun.slice(i, i + 2), 16)
    if (v === 0) continue
    names.push(codeToName[v] ?? `UNKNOWN(${v})`)
}
console.log('decoded champions:', names.join(', '))

const expected = ['Poppy', 'Veigar', 'Milio', 'Pantheon', 'Fizz', 'Corki', 'Rammus', 'Riven']
const ok = expected.every(n => names.includes(n)) && names.length === expected.length
console.log(ok ? 'ROUND-TRIP OK ✓' : 'MISMATCH ✗')
