"""Summarize preserved benchmark observations without rerunning the measurement."""
import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import random
import statistics


def percentile(values, q):
    values = sorted(values)
    index = (len(values) - 1) * q
    low = int(index)
    fraction = index - low
    return values[low] * (1 - fraction) + values[min(low + 1, len(values) - 1)] * fraction


def interval(values):
    rng = random.Random(114112)
    medians = [statistics.median(rng.choices(values, k=len(values))) for _ in range(2000)]
    return [percentile(medians, .025), percentile(medians, .975)]


def stats(values):
    return {'median': statistics.median(values), 'p95': percentile(values, .95), 'min': min(values), 'max': max(values)}


def write_csv(path, rows):
    with path.open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def analyze(directory):
    completion = json.loads((directory / 'completion.json').read_text())
    assert completion['completed']
    rows = json.loads((directory / 'observations.json').read_text())
    assert len(rows) == completion['requests']
    grouped = defaultdict(list)
    phase_counts = Counter()
    for row in rows:
        phase_counts[row['phase']] += 1
        if row['phase'] != 'warmup':
            grouped[(row['phase'], row['site'], row['theme'], row['body_kib'], row['clocks'], row['variant'])].append(row)
    summaries = []
    for key, values in sorted(grouped.items()):
        phase, site, theme, size, clocks, variant = key
        assert len(values) == (completion['samples_per_condition'] if phase == 'measured' else 10)
        d = dict(zip(['phase','site','theme','body_kib','clocks','variant'], key))
        d['samples'] = len(values)
        for name, getter in {
            'ttfb_ms': lambda r: r['ttfb_ms'], 'total_ms': lambda r: r['total_ms'],
            'server_ms': lambda r: r['server']['server_ms'],
            'peak_used_mib': lambda r: r['server']['peak_used_bytes'] / 1048576,
            'peak_allocated_mib': lambda r: r['server']['peak_allocated_bytes'] / 1048576,
            'peak_before_flush_mib': lambda r: r['server']['peak_before_flush'] / 1048576,
            'usage_before_flush_mib': lambda r: r['server']['usage_before_flush'] / 1048576,
            'usage_after_flush_mib': lambda r: r['server']['usage_after_flush'] / 1048576,
            'queries': lambda r: r['server']['queries'],
            'response_kib': lambda r: r['response_bytes']/1024,
        }.items():
            for statistic, result in stats([getter(r) for r in values]).items():
                d[name + '_' + statistic] = result
        summaries.append(d)
    paired = []
    for key, values in sorted(grouped.items()):
        phase, site, theme, size, clocks, variant = key
        if variant != 'candidate': continue
        for reference in [v for v in completion.get('variants', ['legacy', 'candidate', 'control']) if v != 'candidate']:
            comparison = {r['repetition']: r for r in grouped[(*key[:-1], reference)]}
            d = dict(zip(['phase','site','theme','body_kib','clocks'], key[:-1]))
            d['comparison'] = 'candidate_minus_' + reference
            d['pairs'] = len(values)
            for metric, getter in {
                'ttfb_ms': lambda r: r['ttfb_ms'],
                'server_ms': lambda r: r['server']['server_ms'],
                'peak_used_mib': lambda r: r['server']['peak_used_bytes']/1048576,
                'peak_allocated_mib': lambda r: r['server']['peak_allocated_bytes']/1048576,
            }.items():
                deltas = [getter(row)-getter(comparison[row['repetition']]) for row in values]
                ci = interval(deltas)
                d[metric + '_paired_median_delta'] = statistics.median(deltas)
                d[metric + '_paired_median_ci95_low'] = ci[0]
                d[metric + '_paired_median_ci95_high'] = ci[1]
            paired.append(d)
    result = {'completion': completion, 'phase_counts': dict(phase_counts), 'conditions': summaries, 'paired': paired,
        'runtime_observations': sorted({(r['site'],r['server']['wordpress'],r['server']['php'],r['server']['architecture'],r['server']['opcache_enabled']) for r in rows}),
        'worker_pids': {site: sorted({r['server']['pid'] for r in rows if r['site']==site}) for site in ['minimum','current']},
        'php_errors': dict(Counter(json.dumps(r['server']['last_error'],sort_keys=True) for r in rows)),
        'all_after_flush_zero_buffers': all(r['server']['buffers_after_flush']==0 for r in rows),
        'bootstrap_method':'2000 deterministic resamples of within-round paired differences; median percentile CI; local indicative uncertainty',
        'raw_sha256': hashlib.sha256((directory/'observations.json').read_bytes()).hexdigest()}
    (directory/'summary.json').write_text(json.dumps(result,indent=2)+'\n')
    write_csv(directory/'conditions.csv',summaries)
    write_csv(directory/'paired-deltas.csv',paired)
    normal = [r for r in summaries if r['phase']=='measured']
    print(f'PASS: {len(rows)} observations; {len(normal)} ordinary conditions; {len(paired)} paired comparisons; output={directory}')
    print('Current reference / 64 KiB body: median TTFB ms and used peak MiB')
    for row in normal:
        if row['site']=='current' and row['body_kib']==64:
            print(row['theme'],row['clocks'],row['variant'],round(row['ttfb_ms_median'],3),round(row['peak_used_mib_median'],3))
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory',type=Path)
    args=parser.parse_args()
    assert percentile([1,2,3],.5)==2 and interval([3]*10)==[3,3]
    analyze(args.directory)
