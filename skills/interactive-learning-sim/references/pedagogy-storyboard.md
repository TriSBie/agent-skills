# Pedagogy & Storyboard: The 5-Beat Simulation

A good learning simulation does not come from drawing many 3D boxes at step 1. It comes from a **cause-and-effect story rhythm**. Each step adds exactly one new variable, so the learner sees *why* the architecture or algorithm must evolve.

## Table of contents
1. [The 5 beats of a simulation lesson](#1-the-5-beats-of-a-simulation-lesson)
2. [The "grow gradually" rule on the stage](#2-the-grow-gradually-rule-on-the-stage)
3. [Designing a cause-and-effect `metrics` strip](#3-designing-a-cause-and-effect-metrics-strip)
4. [Writing sharp `changes` blocks (architecture diff) & `callout` boxes](#4-writing-sharp-changes-blocks-architecture-diff--callout-boxes)
5. [Designing `Practice` items that resist rote learning](#5-designing-practice-items-that-resist-rote-learning)

---

## 1. The 5 beats of a simulation lesson

When you turn a technical topic into a `steps[]` array (usually 5 to 8 steps), lead the learner through these 5 cognitive phases:

| Beat (`chapter`) | Teaching goal | What happens on the stage and metrics? |
|---|---|---|
| 1. `problem` | Pose a real question the learner wants answered | Only 2–3 minimal entities (e.g. `User → Web Shop`). State a concrete expectation (e.g. responses must be `< 100 ms`). |
| 2. `baseline` | Show how the naive/simplest approach works | Packets flow freely at low load (`100 req/s`, CPU `20%`, Latency `25 ms`). The learner grasps the basic flow. |
| 3. `bottleneck` | Break the simple model with high load or an edge case | Push load to `5,000 req/s` or cut one connection: the target node gets `heat: true` (CPU `99%`), `slow`/`drop` packets appear, p99 jumps to `1,800 ms`. |
| 4. `technique` | Apply the lesson's main concept exactly where it hurts | Add the new component (Cache, Queue, Index, Sharding, a second pointer...). The packet flow visibly reroutes, CPU cools to `25%`, p99 drops to `12 ms`. |
| 5. `tradeoff` | State the limits and the price, so the technique is not overused | Simulate the blind spots of the solution (e.g. mass Cache Miss / Thundering Herd, stale data within the TTL, slower writes after adding an Index). |

---

## 2. The "grow gradually" rule on the stage

- **Step 1 has at most 3 entities:** Do not show 9 microservices on the first screen. The learner needs a visual anchor first.
- **Keep the `[x, y]` position of existing entities fixed across steps:** If `db` sits at `[6, 0]` in step 2, keep it at `[6, 0]` (or move it back on purpose to `[8, 0]` to free `[4, 0]` for a `cache` in between). Avoid random shuffling, which makes the learner lose track of objects.
- **Each step changes one main idea:** If one step adds a Load Balancer, a Redis Cache and a Read Replica together, the learner cannot tell which component lowered the latency. Split it into 3 consecutive steps.

---

## 3. Designing a cause-and-effect `metrics` strip

The `metrics` strip (3 to 4 values) is the quantitative bridge between the diagram and engineering thinking:

- **Choose metrics that show the trade-off (tension):**
  - *Caching lesson example:* `Traffic` (`req/s`), `Cache Hit` (`%`), `DB Load` (`qps`), `p99 Latency` (`ms`).
  - *Message Queue lesson example:* `Incoming` (`jobs/s`), `Queue Depth` (`jobs`), `Worker CPU` (`%`), `User Wait` (`ms`).
  - *Binary Search vs Linear Search lesson example:* `Array Size` (`N`), `Step` (`#`), `Comparisons` (`count`), `Search Space` (`elements left`).
- **Numbers must match elementary math (napkin math):**
  If `Traffic = 2,000 req/s` and `Cache Hit = 90%`, then `DB Load` at that step must be about `200 qps` (10% pass through the cache). Do not fill in an invented number such as `850 qps`.

---

## 4. Writing sharp `changes` blocks (architecture diff) & `callout` boxes

- **Text length (`step.body`):** At most 2–3 short paragraphs (1–3 sentences each). The stage already carries the structural description. Use text only to explain **why the mechanism works**.
- **`changes` block (diff between step `i-1` and step `i`):**
  Lets the learner see in 2 seconds what this step just changed:
  - `+ Redis Cache (TTL 60s) placed in front of the DB`
  - `~ 90% of reads stop right at RAM (~1 ms)`
  - `- Stale data window of up to 60 seconds when a product price has just changed`
- **`callout` box (add only when it is worth it; do not use it on every step without a new idea):**
  - `tip` (*Field tip*): A config threshold or real operating experience.
  - `insight` (*Core idea*): A durable rule worth remembering (e.g. Little's Law $L = \lambda W$, the rule that latency rises exponentially once utilization passes 80%).
  - `warn` (*Common trap*): A frequent real-world design error (e.g. immediate retry without jitter causes a retry storm that takes down a system that has just recovered).
  - `next` (*Next step*): Put it at the last step of a lesson to link to the next lesson in the module.

---

## 5. Designing `Practice` items that resist rote learning

A good `Practice` item puts the learner in the role of the on-call operator / designer:
1. **Give the numbers and a broken diagram:** For example *"The payment system receives 800 orders/second. The partner bank API takes 1.2 seconds to respond, so every worker thread hangs waiting, and p99 reaches 9.5 seconds."*
2. **Distractor choices must be real mistakes people make:**
   - Wrong choice 1: *"Add a Redis Cache for the charge API"* → Explain directly on the diagram: each charge is a unique state write, so the cached result of another order cannot be returned.
   - Wrong choice 2: *"Lower the timeout to 100 ms and auto-retry 5 times"* → The diagram runs red packet flows that multiply the calls to the partner by 5, with a risk of double charges without an `Idempotency-Key`.
   - Correct choice: *"Move the partner call behind an asynchronous Message Queue + attach an `Idempotency-Key`, and return a `Pending` status to the user right away"* → The diagram switches to the new flow, `User Wait` drops to `35 ms`, and workers process steadily without blocking.
