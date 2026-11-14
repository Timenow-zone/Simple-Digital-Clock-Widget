# Immutable rollback build inputs

These two ZIP files are **offline test fixtures**, not new release outputs.
They are byte-for-byte copies of the inputs used for the accepted local
1.1.2.1 revision-2 build. They contain plugin files only: no site database,
configuration, accounts, credentials or lab logs.

| Fixture | Origin | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `public-1.1.2.zip` | Actual WordPress.org predecessor retained by the pinned lab | 61,476 | `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55` |
| `accepted-1.1.4-r8.zip` | Locally accepted streaming-r8 archive; unpublished | 69,772 | `cb60a5d20e6b87d2897f00aebf25568f292a53e8f5c613b3c5fc09f75d06bc37` |

Keeping the exact inputs here makes clean-checkout CI independent of private
`.local` paths, mutable public downloads, Docker and network access. The test
builds into a disposable directory and compares the resulting ZIP SHA, all
manifest fields, file bytes and repeat-build output with
[`docs/releases/1.1.2.1/manifest.json`](../../../docs/releases/1.1.2.1/manifest.json).
The original ZIPs remain under `.local`; no test overwrites them. Never update
these fixtures or the accepted manifest merely to make a changed recipe pass.
Use a separately identified candidate and its own acceptance for changed bytes.

Run `python3 tests/wordpress-rollback.test.py` from the repository root.
Python 3.9+ and PHP CLI are required. The tests also exercise rejection of corrupt
inputs, metadata drift (including the rejected revision-1 POT defect), unsafe
ZIP entries, overwritten output, unsafe lab inputs and state drift. Mocked lab
failures prove orchestration guards; they do not replace the recorded real
WordPress editor, resource, security or compatibility acceptance.
