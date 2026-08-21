# Simple Digital Clock Widget — performance benchmark

- Date: 2026-08-21T11:34:01.157Z
- Chromium: 151.0.7922.34
- Runs: 5 measured + 1 warmup(s)
- Steady-state window: 1500 ms
- Legacy SHA256: `dc793b84d0d13be3907648f21a69f2aa130f57c5fecb5626a03fd1e9ba777513`
- Candidate SHA256: `566c884e1fd8b79a96ff00fa2456947a0c7ec42fa7ce660ea3986b7708f7964c`

## Scenario medians

| Scenario | Widgets | Mount ms | Task ms | Script ms | FPS | p95 frame ms | Max frame ms | Long tasks | Heap MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| legacy-second-1 | 1 | 10.8 | 25.8 | 5.3 | 119.4 | 9.3 | 15.7 | 0 | 1.7 |
| candidate-second-1 | 1 | 10.8 | 28.0 | 5.8 | 119.4 | 9.2 | 16.5 | 0 | 1.8 |
| legacy-second-25 | 25 | 15.3 | 40.6 | 12.5 | 119.4 | 9.1 | 16.7 | 0 | 1.7 |
| candidate-second-25 | 25 | 14.6 | 40.8 | 12.7 | 119.4 | 9.1 | 15.9 | 0 | 1.7 |
| legacy-second-100 | 100 | 26.5 | 52.5 | 22.8 | 119.4 | 9.0 | 16.0 | 0 | 2.5 |
| candidate-second-100 | 100 | 27.2 | 50.9 | 20.8 | 119.4 | 9.1 | 16.7 | 0 | 2.6 |
| candidate-hundredths-1 | 1 | 11.9 | 93.6 | 12.9 | 120.0 | 9.1 | 9.3 | 0 | 2.1 |
| candidate-hundredths-25 | 25 | 15.9 | 218.5 | 32.2 | 120.0 | 9.1 | 9.3 | 0 | 2.4 |
| candidate-hundredths-50 | 50 | 20.3 | 221.5 | 33.3 | 120.0 | 9.0 | 9.3 | 0 | 2.3 |
| candidate-hundredths-100 | 100 | 30.0 | 291.6 | 41.8 | 120.0 | 8.8 | 9.3 | 0 | 4.6 |

## Candidate legacy-mode vs immutable 0.6.0

| Widgets | Metric | Legacy | Candidate | Δ | Ratio | Direction |
|---:|---|---:|---:|---:|---:|---|
| 1 | mount | 10.8 | 10.8 | 0.0 | 1.00× | ≈ same |
| 1 | task | 25.8 | 28.0 | 2.3 | 1.09× | ≈ same |
| 1 | script | 5.3 | 5.8 | 0.5 | 1.09× | ≈ same |
| 1 | frame p95 | 9.3 | 9.2 | -0.1 | 0.99× | ≈ same |
| 25 | mount | 15.3 | 14.6 | -0.7 | 0.95× | ≈ same |
| 25 | task | 40.6 | 40.8 | 0.2 | 1.01× | ≈ same |
| 25 | script | 12.5 | 12.7 | 0.2 | 1.02× | ≈ same |
| 25 | frame p95 | 9.1 | 9.1 | -0.0 | 1.00× | ≈ same |
| 100 | mount | 26.5 | 27.2 | 0.7 | 1.03× | ≈ same |
| 100 | task | 52.5 | 50.9 | -1.7 | 0.97× | ≈ same |
| 100 | script | 22.8 | 20.8 | -2.0 | 0.91× | ≈ same |
| 100 | frame p95 | 9.0 | 9.1 | 0.1 | 1.01× | ≈ same |

## Runtime errors

None.

> Direction is deliberately conservative: differences under the absolute noise floor are reported as ≈ same; otherwise ≥10% is marked better/worse. Final release judgment should use the raw medians and repeatability, not the label alone.
