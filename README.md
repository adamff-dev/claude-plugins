# claude-plugins

Claude Code plugins by adamff-dev.

## Install

```text
/plugin marketplace add adamff-dev/claude-plugins
/plugin install sub-meter@adamff-claude-plugins
```

## Plugins

- **sub-meter**: your subscription usage (5-hour and weekly windows) at the bottom right of the prompt. Both bars side by side by default; turn on `rotate` in `/plugin configure sub-meter@adamff-claude-plugins` to show one at a time. See [plugins/sub-meter](plugins/sub-meter/README.md).

Sub Meter is based on the original plugin by Miguel Ángel Durán (midudev), from [midudev/better-claude](https://github.com/midudev/better-claude). MIT licensed.
