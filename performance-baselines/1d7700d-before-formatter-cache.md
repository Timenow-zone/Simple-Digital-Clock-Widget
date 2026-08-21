# Simple Digital Clock Widget — performance benchmark

- Date: 2026-08-21T11:22:53.845Z
- Chromium: 151.0.7922.34
- Runs: 5 measured + 1 warmup(s)
- Steady-state window: 1500 ms
- Legacy SHA256: `dc793b84d0d13be3907648f21a69f2aa130f57c5fecb5626a03fd1e9ba777513`
- Candidate SHA256: `c89c404a3a7b11a6c7a2ef0a7b296148b75c78bb764b745b65d94c23ce028b31`

## Scenario medians

| Scenario | Widgets | Mount ms | Task ms | Script ms | FPS | p95 frame ms | Max frame ms | Long tasks | Heap MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| legacy-second-1 | 1 | 10.4 | 26.8 | 5.9 | 120.0 | 9.0 | 9.4 | 0 | 1.7 |
| candidate-second-1 | 1 | 10.6 | 24.8 | 5.8 | 120.0 | 9.1 | 9.4 | 0 | 1.8 |
| legacy-second-25 | 25 | 15.1 | 30.8 | 7.9 | 119.3 | 9.1 | 16.7 | 0 | 1.7 |
| candidate-second-25 | 25 | 14.6 | 41.1 | 15.0 | 120.0 | 9.0 | 9.4 | 0 | 1.7 |
| legacy-second-100 | 100 | 27.1 | 47.5 | 21.9 | 119.3 | 9.0 | 15.8 | 0 | 2.5 |
| candidate-second-100 | 100 | 27.4 | 50.1 | 22.1 | 119.3 | 8.9 | 16.7 | 0 | 2.5 |
| candidate-hundredths-1 | 1 | 10.9 | 118.5 | 43.4 | 120.0 | 9.1 | 9.4 | 0 | 2.1 |
| candidate-hundredths-25 | 25 | 15.6 | 352.3 | 212.8 | 120.0 | 8.8 | 9.3 | 0 | 2.7 |
| candidate-hundredths-50 | 50 | 19.0 | 461.6 | 283.9 | 120.0 | 8.4 | 9.3 | 0 | 2.9 |
| candidate-hundredths-100 | 100 | 28.2 | 731.4 | 455.3 | 120.0 | 8.4 | 9.3 | 0 | 4.0 |

## Candidate legacy-mode vs immutable 0.6.0

| Widgets | Metric | Legacy | Candidate | Δ | Ratio | Direction |
|---:|---|---:|---:|---:|---:|---|
| 1 | mount | 10.4 | 10.6 | 0.2 | 1.02× | ≈ same |
| 1 | task | 26.8 | 24.8 | -2.0 | 0.93× | ≈ same |
| 1 | script | 5.9 | 5.8 | -0.1 | 0.98× | ≈ same |
| 1 | frame p95 | 9.0 | 9.1 | 0.1 | 1.01× | ≈ same |
| 25 | mount | 15.1 | 14.6 | -0.5 | 0.97× | ≈ same |
| 25 | task | 30.8 | 41.1 | 10.3 | 1.33× | worse |
| 25 | script | 7.9 | 15.0 | 7.0 | 1.89× | worse |
| 25 | frame p95 | 9.1 | 9.0 | -0.1 | 0.99× | ≈ same |
| 100 | mount | 27.1 | 27.4 | 0.3 | 1.01× | ≈ same |
| 100 | task | 47.5 | 50.1 | 2.7 | 1.06× | ≈ same |
| 100 | script | 21.9 | 22.1 | 0.1 | 1.01× | ≈ same |
| 100 | frame p95 | 9.0 | 8.9 | -0.1 | 0.99× | ≈ same |

## Runtime errors

None.

> Direction is deliberately conservative: differences under the absolute noise floor are reported as ≈ same; otherwise ≥10% is marked better/worse. Final release judgment should use the raw medians and repeatability, not the label alone.
