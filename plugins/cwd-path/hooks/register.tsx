import type { Register } from 'claude-code'

const DEFAULT_MAX = 50

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

export const register: Register = (on, options) => {
  const asked = Number(options.maxLength)
  const max = Number.isFinite(asked) && asked > 4 ? asked : DEFAULT_MAX
  const shortenHome = options.shortenHome !== false

  // Bottom right of the prompt footer: the engine's mode labels, then the directory the session runs in.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const cwd = await $.session.cwd()
    const home = shortenHome ? (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) : undefined
    const shown = clip(tilde(cwd, home ?? undefined), max)

    // The engine's own labels (and any other plugin's) stay as drawn, before the path.
    const labels = e.props.modes.length > 0 ? await next(e) : null
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row">
        {labels}
        {labels ? <Text dimColor> · </Text> : null}
        <Text dimColor>📁 </Text>
        <Text color="claude">{shown}</Text>
      </Box>
    )
  })
}
