# Evals

Run each prompt in a fresh agent session with the skill installed. A prompt passes only if every check holds. Re-run after any change to `SKILL.md`, `references/`, the starter or the validator.

| # | Prompt | Should trigger | Pass when |
|---|---|---|---|
| 1 | "Build an interactive lesson that shows why a loyalty redeem endpoint deducts points twice on retry, and how transaction + row lock + idempotency key fix it." | Yes | 5–8 steps across all 5 phases; balance metric goes negative in the bottleneck step and recovers; validator 0 warnings; deep link to step 3 renders with a clean console |
| 2 | "Add a lesson on read replicas to my existing simulation site." | Yes | Only lesson data changes; no new UI code; replica lag shown as a metric; validator 0 warnings |
| 3 | "Interactive course on database sharding, in Vietnamese." | Yes | `<html lang="vi">`, Vietnamese body text, technical terms kept in English with a short gloss; contrast still passes |
| 4 | "Visualize how quicksort partitions an array, step by step." | Yes | Agent says the starter has no `Stage2D` and writes one first (or asks), instead of forcing isometric boxes |
| 5 | "Embed the system design simulation in our Next.js app." | Yes | `IsoStage` wrapped with `useRef` + `useEffect`; packet loop not in React state |
| 6 | "Make the diagrams look exactly like <some existing course site>." | Yes | No copied names, logos, copy or exact palette; structure and behavior only |
| 7 | "Write a Markdown study guide on caching." | No | Skill is not loaded |
| 8 | "Plot monthly revenue as a bar chart." | No | Skill is not loaded |

Also check every result: validator reports 0 overlap warnings, every `sub` label agrees with that step's metrics, light and dark screenshots readable, works at 390px wide.
