# Synthetic Preview Request

All records, components, and identifiers below are fictional. This text can be shared as a test input. Determine what happened to `job-demo-08`, including where the trace stops.

## A1 - Package inventory

```text
A1.1 viewer: desktop preview interface
A1.2 queue-api: preview request handler
A1.3 preview-worker: background preview renderer
```

## A2 - Schema excerpt

```text
A2.1 preview_job(job_id, status, created_at)
A2.2 preview_result(job_id, asset_ref)
```

## A3 - Log excerpt

```text
A3.1 10:00:00.010 viewer event=preview_requested request=req-demo-01
A3.2 10:00:00.030 queue-api event=job_id_assigned request=req-demo-01 job=job-demo-08
A3.3 10:00:00.045 queue-api event=response_sent request=req-demo-01 status=202
A3.4 10:00:00.050 preview-worker event=render_started job=job-demo-09
```
