# Expected Report

## Observed

- The viewer logged preview request `req-demo-01` (`A3.1`). The API assigned `job-demo-08` to that request and logged a `202` response (`A3.2`, `A3.3`). This is the last observed event for the request.
- The worker logged a render start for `job-demo-09` (`A3.4`), not for `job-demo-08`. The schema describes job and result tables but contains no rows or write events (`A2.1`, `A2.2`).

## Inferred

- The component inventory and job/result schema suggest a background preview workflow (`A1.2`, `A1.3`, `A2.1`, `A2.2`). This is not proof of a worker handoff for this request.

## Unknown

- Whether `job-demo-08` was queued, rendered, or persisted. A redacted excerpt keyed to `job-demo-08` with its handoff, completion, or storage event would resolve the corresponding question.

The test fails if the report treats `202` as completion, joins the other job to this request, treats a schema as proof of writes, or claims failure just because the trace ends.
