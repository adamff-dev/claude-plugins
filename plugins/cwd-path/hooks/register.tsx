import type { EngineInterface, Register } from 'claude-code'

const DEFAULT_MAX = 50
const BRANCH_TTL_MS = 3000

const slashes = (path: string) => path.split('\\').join('/')

/** The path with its home folder as "~", when it starts with it. */
function tilde (path: string, home: string | undefined) {
  if (!home) return path
  const base = slashes(home).replace(/\/+$/, '').toLowerCase()
  const lower = slashes(path).toLowerCase()
  if (lower === base) return '~'
  return lower.startsWith(base + '/') ? '~' + path.slice(base.length) : path
}

/** Keeps the end of a long path: "…\Projects\claude-plugins". */
const clip = (path: string, max: number) => (path.length <= max ? path : '…' + path.slice(path.length - (max - 1)))

/** The branch checked out in `cwd` (the short commit when detached), or undefined outside a git repository. */
async function branchOf ($: EngineInterface, cwd: string) {
  try {
    const named = await $.process.run(['git', 'branch', '--show-current'], { cwd, timeoutMs: 2000 })
    if (named.exitCode !== 0) return undefined
    if (named.stdout.trim()) return named.stdout.trim()
    const commit = await $.process.run(['git', 'rev-parse', '--short', 'HEAD'], { cwd, timeoutMs: 2000 })
    return commit.exitCode === 0 && commit.stdout.trim() ? commit.stdout.trim() : undefined
  } catch {
    return undefined
  }
}

// The footer redraws often; git is asked again only when the directory changes or the answer is a few seconds old.
let seen: { cwd: string; at: number; branch: string | undefined } | undefined
async function currentBranch ($: EngineInterface, cwd: string) {
  const now = await $.clock.now()
  if (!seen || seen.cwd !== cwd || now - seen.at > BRANCH_TTL_MS) {
    seen = { cwd, at: now, branch: await branchOf($, cwd) }
  }
  return seen.branch
}

export const register: Register = (on, options) => {
  const asked = Number(options.maxLength)
  const max = Number.isFinite(asked) && asked > 4 ? asked : DEFAULT_MAX
  const shortenHome = options.shortenHome !== false
  const showBranch = options.showBranch !== false

  // Bottom right of the prompt footer: the engine's mode labels, then the directory the session runs in.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const cwd = await $.session.cwd()
    const home = shortenHome ? (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) : undefined
    const shown = clip(tilde(cwd, home ?? undefined), max)
    const branch = showBranch ? await currentBranch($, cwd) : undefined

    // The engine's own labels (and any other plugin's) stay as drawn, before the path.
    const labels = e.props.modes.length > 0 ? await next(e) : null
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row">
        {labels}
        {labels ? <Text dimColor> · </Text> : null}
        <Text dimColor>📁 </Text>
        <Text color="claude">{shown}</Text>
        {branch ? <Text dimColor> ({branch})</Text> : null}
      </Box>
    )
  })
}
