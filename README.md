# agent-skills

Agent Skills by [@TriSBie](https://github.com/TriSBie) for Claude Code and other agents that read `SKILL.md`.

| Skill | What it does |
|---|---|
| [dense-tool-ui](skills/dense-tool-ui) | Measured layout, interaction and color reference for dense, keyboard-first work tools and their dark landing pages, with two runnable templates. |

## Install

**Claude Code (plugin marketplace)**

```
/plugin marketplace add TriSBie/agent-skills
/plugin install trisbie-skills@trisbie-agent-skills
```

**Any agent (copy the folder)**

```bash
git clone https://github.com/TriSBie/agent-skills
cp -r agent-skills/skills/dense-tool-ui ~/.claude/skills/
```

## dense-tool-ui

![App template](docs/dense-tool-ui-app.png)
![Landing template](docs/dense-tool-ui-landing.png)

- `SKILL.md`: workflow and rules (short, always loaded).
- `references/`: exact sizes, tokens and page anatomy, read on demand.
- `assets/`: `app-template.html` and `landing-template.html`, single files with no build step. Open either with `?selftest` and the tab title should read `SELFTEST OK <n>`.

Measurements were taken from a live product in November 2026 and will drift as that product changes. The skill copies structure and behavior only: no logos, names, illustrations or copy from the source.

## License

MIT
