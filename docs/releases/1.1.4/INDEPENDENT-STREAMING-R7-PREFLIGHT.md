# Independent streaming-r7 preliminary code review

**Result: NO-GO at preliminary code review; IND-STREAM-01 confirmed.** This is a preliminary read-only source/DOM review. Formal full exact-archive acceptance and reviewer performance benchmarks were **NOT RUN**. Review stopped after reproduction; no source fix or publication action was performed.

## Reviewed identity and close

- ZIP: `simple-digital-clock-1.1.4-streaming-r7-candidate.zip`, **69,574 bytes /17 files**.
- ZIP SHA-256: `e42b8ef1580c10a2b8164cb0f2b3dea50d8e29048c000719f51182e53d569e0a`.
- Manifest SHA-256: `250b49bdae179090ddfc4515b6ad36eb107bbfdbe005152415806d6f58346a3f`.
- Source base `f75c98776b6b1860e916123915bed8084c879153` plus uncommitted candidate bytes. All17 installable files exactly match source/manifest/ZIP,with safe unique regular paths and CRC verified. The installable set,original and copied ZIP,and manifest remained unchanged at close.
- Broad docs/tooling were explicitly **not frozen**. This receipt cannot be presented as full source-tree or release acceptance.

## IND-STREAM-01: valid SELECT/SCRIPT raw text is parsed as live markup

`includes/simple-digital-clock-output.php:38` gates raw-element recognition on `!$this->select`; lines45–48 therefore do not enter SCRIPT raw mode while inside SELECT. SCRIPT is a script-supporting element allowed inside SELECT. JavaScript text can contain a literal closing SELECT and custom-element markup without creating any DOM host:

```html
<select><script>var example="</select><timenow-zone-sdcw></timenow-zone-sdcw>";</script></select>
```

Independent tiny Chromium DOM check: **0 clock elements,0 page errors**. Paired control adding one genuine clock after SELECT: **1 clock element,0 page errors**. Exact source and observed script text are retained.

The actual r7 observer nevertheless returns `has_clock=true` for the inert case at **1,2,3,7 and4096-byte chunks**. With assets ready it returns insertion offset**125**,inside that legitimate JavaScript string,not at a safe HTML boundary. Raw offsets and surrounding source are in `select-script-probe.json`.

Consequences inferred directly from this code path: before footer,capture later delivers resources on a clock-free page; after capture,the insertion can corrupt a legitimate SCRIPT body. These are not malformed-tree-repair or foreign-namespace cases. Native WordPress HTTP resource counts were not run during this low-load preflight and are not falsely claimed as observed.

Evidence: `select-script-probe.php/.json`, `select-script-dom.mjs/.json`. Tiny browser activity ran **2026-11-02T17:22:57.969Z through 2026-11-02T17:22:58.427Z** (under half a second),then closed. No Docker/service/benchmark was started.

## Additional scoped observations

1. **REV-NONHTML:** `SDCW_capture_frontend_assets()` unconditionally echoes `<!-- -->`. Its non-HTML filter path returns bytes unchanged. A non-HTML endpoint reaching capture can therefore have JSON/text mutated. Narrow Core-output stubs produce `{"ok":true}<!-- -->`,which fails JSON decoding. This is source-level reproduction only; no native endpoint lifecycle is certified. Evidence:`nonhtml-capture-probe.php/.json`.
2. **REV-END-BOUNDARY:** after a clock has been seen and capture is ready while inside an inert template,the exact chunk `</template>` ends in safe data state but returns null; an empty final feed also returns null. The same closer with a following byte returns offset11. The API omits a safe end-of-chunk/empty-final insertion opportunity. This supplemental tiny probe was explicitly requested after the primary blocker. No broad claim about normal theme footer placement is made. Evidence:`end-boundary-probe.php/.json`.

## Preserved boundary

Accepted r6 was not modified or reclassified. Owner preview and author/performance projects were untouched by this reviewer. Root independently stopped its incomplete performance run; no full performance verdict is inferred here. r7 copies,receipts and all scoped probe outputs remain under this ignored directory. A corrected ZIP needs a new identity before performance and broad independent acceptance. This report supplies no GO or publication permission.
