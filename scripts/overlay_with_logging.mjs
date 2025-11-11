import { execSync, spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SRC = process.argv[2] || ''
const ROOT = join(__dirname, '..')
const LOGDIR = join(ROOT, 'test-artifacts')
if (!SRC || !existsSync(SRC)) process.exit(0)
if (!existsSync(LOGDIR)) mkdirSync(LOGDIR, { recursive: true })
const logPath = join(LOGDIR, 'overlay.log')
const now = () => new Date().toISOString().replace('T',' ').replace('Z','')
const log = m => { execSync(`printf "%s\n" "${now()} ${m}" >> "${log}"`) }
log(`[overlay] start SRC=${SRC}`)
const files = readdirSync(SRC, { withFileTypes: true })
const flat = files.flatMap(f => f.isDirectory() ? [f.name] : [f.name])
log(`[overlay] files=${flat.length}`)
const list = execSync(`find "${SRC}" -maxdepth 2 -type f ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/test-artifacts/*"`).toString()
writeFileSync(logPath, `${now()} [overlay] listing\n${list}`)
execSync(`rsync -a --stats --prune-empty-dirs --exclude '.bak' --exclude '.git' --exclude 'node_modules' --exclude 'test-artifacts' "${SRC}/" "${ROOT}/"`, { stdio: 'inherit' })
execSync(`git -C "${ROOT}" add -A`)
writeFileSync(join(LOGDIR,'overlay.changed.txt'), execSync(`git -C "${ROOT}" status --porcelain`).toString())
log('[overlay] done')
