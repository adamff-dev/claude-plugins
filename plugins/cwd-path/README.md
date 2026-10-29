# cwd-path

A Claude Code mod: the directory Claude Code is working in, always at the bottom right of the prompt, on the same line as the permission mode.

```text
⏵⏵ auto mode on                          📁 ~\Projects\claude-plugins (main)
```

Your home folder is shown as `~`, and long paths are cut from the left so the end of the path (the part that tells projects apart) stays visible. It follows the session if the directory changes.

## Options

Set them in `/plugin configure cwd-path@adamff-claude-plugins`:

- `maxLength` (30, 40, 50, 60, 80 or 100; default 50): the longest path shown before it is cut.
- `showBranch` (default on): the current git branch in parentheses after the path, when the directory is in a git repository (the short commit when HEAD is detached).
- `shortenHome` (default on): show the home folder as `~`.

## Install

```text
/plugin marketplace add adamff-dev/claude-plugins
/plugin install cwd-path@adamff-claude-plugins
```

## How it works

One hooks module ([`hooks/register.tsx`](hooks/register.tsx)): a `ui.render` hook on `SessionMode` keeps the engine's mode labels as drawn and adds the path after them, read with `$.session.cwd()` on each draw. The branch comes from `git branch --show-current`, asked again only when the directory changes or after 3 seconds.

MIT © adamff-dev
