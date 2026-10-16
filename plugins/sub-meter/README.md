# Sub Meter

A Claude Code mod: your subscription usage, always at the bottom right, on the same line as the permission mode.

```text
⏵⏵ auto mode on                                   5h ━━━━━━──── 58% · 2h 10m
```

Both windows are shown side by side: the **5-hour** one and the **weekly** one. Each bar turns yellow from 75% and red from 90%, and after it comes the time until that window resets.

Prefer one bar that takes turns? Turn on `rotate` in `/config`: it switches between the two windows every 8 seconds.

There is no monthly window: Claude Code only reports the 5-hour and the weekly ones. Off a subscription (API key billing) there is nothing to show, so the footer stays as it is.

While it is on, it also drops the `(shift+tab to cycle)` hint after the permission mode, to leave room for the meter. Turn that off in `/config` (`hideCycleHint`).

## Install

```text
/plugin marketplace add adamff-dev/claude-plugins
/plugin install sub-meter@adamff-claude-plugins
```

## How it works

One hooks module ([`hooks/register.tsx`](hooks/register.tsx)):

- `session.measure` hands it the rate-limit windows after each response (`five_hour`, `seven_day`); `$.session.usage()` gives the first reading at start.
- The last reading is kept in `$.store`, so a new session shows it before its first response.
- A `ui.render` hook on `SessionMode` wraps what the engine draws there (its mode labels) and adds one meter per window after it; with `rotate` on, `$.clock.every` switches the one shown.
- A `ui.render` hook on `PromptHint` rewrites the hint line without `(shift+tab to cycle)`; the engine still draws it, and the mode label before it.

## Development

```bash
claude plugin validate ./sub-meter   # from the repository root
claude plugin test ./sub-meter       # runs hooks/register.test.tsx against the engine
```

MIT © Miguel Ángel Durán (midudev)
