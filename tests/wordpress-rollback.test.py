"""Offline regression gates for the accepted editable rollback recipe and lab."""

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import warnings
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools/wordpress-lab/rollback'
FIXTURES = ROOT / 'tests/fixtures/wordpress-rollback'
PREDECESSOR = FIXTURES / 'public-1.1.2.zip'
ACCEPTED = FIXTURES / 'accepted-1.1.4-r8.zip'
RELEASE = ROOT / 'docs/releases/1.1.2.1'


def load(name, source):
    spec = importlib.util.spec_from_file_location(name, source)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load('rollback_builder_test', SOURCE / 'build.py')
runner = load('rollback_runner_test', SOURCE / 'run.py')


class RollbackTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.temporary.cleanup)
        cls.directory = Path(cls.temporary.name)
        cls.expected = json.loads((RELEASE / 'manifest.json').read_text())
        cls.output = cls.directory / 'build'
        with contextlib.redirect_stdout(io.StringIO()):
            cls.actual = builder.build(PREDECESSOR, ACCEPTED, cls.output)
        cls.archive = cls.output / cls.actual['archive']
        cls.files = builder.read_archive(cls.archive, cls.expected['archive_sha256'])

    def test_exact_inputs_and_recipe_match_accepted_manifests(self):
        main = json.loads((ROOT / 'docs/releases/1.1.4/manifest-streaming-r8.json').read_text())
        self.assertEqual(builder.sha(ACCEPTED.read_bytes()), main['archive_sha256'])
        self.assertEqual(builder.ACCEPTED_SHA, main['archive_sha256'])
        self.assertEqual(builder.sha(PREDECESSOR.read_bytes()), self.expected['inputs']['public_1_1_2'])
        self.assertEqual(builder.sha((SOURCE / 'build.py').read_bytes()), self.expected['builder_sha256'])
        current = builder.read_archive(ACCEPTED, builder.ACCEPTED_SHA)
        self.assertEqual({name: builder.sha(data) for name, data in current.items()}, main['files'])

    def test_real_build_matches_every_accepted_manifest_field_and_zip_byte(self):
        self.assertEqual(self.actual, self.expected)
        self.assertEqual(json.loads((self.output / 'manifest.json').read_text()), self.expected)
        self.assertEqual(builder.sha(self.archive.read_bytes()), self.expected['archive_sha256'])
        self.assertEqual(len(self.files), 17)

    def test_repeated_build_is_identical_and_keeps_input_bytes(self):
        before = [p.read_bytes() for p in (PREDECESSOR, ACCEPTED)]
        with tempfile.TemporaryDirectory() as temporary, contextlib.redirect_stdout(io.StringIO()):
            output = Path(temporary) / 'repeat'
            manifest = builder.build(PREDECESSOR, ACCEPTED, output)
            self.assertEqual(manifest, self.actual)
            self.assertEqual((output / manifest['archive']).read_bytes(), self.archive.read_bytes())
        self.assertEqual([p.read_bytes() for p in (PREDECESSOR, ACCEPTED)], before)

    def test_legacy_runtime_is_preserved_and_css_is_inline_only(self):
        name = 'assets/public/js/simple-digital-clock.min.js'
        old = builder.read_archive(PREDECESSOR, builder.PREDECESSOR_SHA)
        self.assertEqual(self.files[name], old[name])
        self.assertEqual(self.files[name], (ROOT / 'dist/0.7.0.min.js').read_bytes())
        self.assertFalse(any(name.endswith('.css') for name in self.files))
        self.assertIn(b'display:block;', self.files['includes/simple-digital-clock-assets.php'])

    def test_archive_layout_crc_modes_and_order_are_stable(self):
        with zipfile.ZipFile(self.archive) as archive:
            self.assertIsNone(archive.testzip())
            entries = archive.infolist()
            self.assertEqual([p.filename for p in entries], sorted(p.filename for p in entries))
            for entry in entries:
                self.assertTrue(entry.filename.startswith(builder.PREFIX))
                self.assertEqual(entry.date_time, (2026, 11, 3, 0, 0, 0))
                self.assertEqual(entry.external_attr >> 16, stat.S_IFREG | 0o644)
                self.assertFalse(entry.flag_bits & 1)

    def test_corrupted_inputs_fail_before_creating_output(self):
        for index, original in enumerate((PREDECESSOR, ACCEPTED)):
            with self.subTest(input=original.name), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                altered = root / 'corrupt.zip'
                altered.write_bytes(original.read_bytes() + b'changed')
                inputs = [PREDECESSOR, ACCEPTED]
                inputs[index] = altered
                with self.assertRaisesRegex(ValueError, 'Unexpected immutable input'):
                    builder.build(*inputs, root / 'output')
                self.assertFalse((root / 'output').exists())

    def test_existing_output_is_not_overwritten(self):
        before = {p.name: p.read_bytes() for p in self.output.iterdir()}
        with self.assertRaises(FileExistsError):
            builder.build(PREDECESSOR, ACCEPTED, self.output)
        self.assertEqual({p.name: p.read_bytes() for p in self.output.iterdir()}, before)

    def test_metadata_guard_rejects_old_pot_and_inconsistent_versions(self):
        mutations = [
            ('languages/simple-digital-clock.pot', b'1.1.2.1', b'1.1.2'),
            ('widget_init.php', b'Version: 1.1.2.1', b'Version: 1.1.2'),
            ('readme.txt', b'Stable tag: 1.1.2.1', b'Stable tag: 1.1.2'),
            ('block.js', b'@version 1.1.2.1', b'@version 1.1.4'),
            ('includes/simple-digital-clock-assets.php', b"'1.1.2.1'", b"'1.1.4'"),
            ('includes/simple-digital-clock-assets.php', b"'0.7.0'", b"'0.8.1'"),
            ('readme.txt', b'Bundled upstream version: 0.7.0', b'Bundled upstream version: 0.8.1'),
            ('readme.txt', b'= 1.1.2.1 =', b'= 1.1.2 ='),
            ('widget_init.php', b'Requires PHP: 7.0', b'Requires PHP: 8.3'),
            ('readme.txt', b'Requires at least: 6.3', b'Requires at least: 7.1'),
        ]
        builder.validate_metadata(self.files)
        for name, before, after in mutations:
            with self.subTest(file=name, marker=before):
                changed = dict(self.files)
                self.assertIn(before, changed[name])
                changed[name] = changed[name].replace(before, after)
                with self.assertRaises(ValueError):
                    builder.validate_metadata(changed)

    def test_exact_replacements_fail_on_missing_or_ambiguous_markers(self):
        for data in (b'no marker', b'version version'):
            with self.assertRaises(ValueError):
                builder.replace_once(data, b'version', b'replacement')

    def test_unsafe_archive_entries_fail_even_with_matching_input_hash(self):
        cases = [
            ['../outside'], ['/simple-digital-clock/file'], ['other/file'],
            ['simple-digital-clock/../../outside'], ['simple-digital-clock/..\\outside'],
            ['simple-digital-clock/file', 'simple-digital-clock/file'],
            ['simple-digital-clock/file', 'simple-digital-clock/./file'],
            ['simple-digital-clock/link'], ['simple-digital-clock/encrypted'],
        ]
        for names in cases:
            with self.subTest(entries=names), tempfile.TemporaryDirectory() as temporary:
                archive = Path(temporary) / 'unsafe.zip'
                with warnings.catch_warnings(), zipfile.ZipFile(archive, 'w') as handle:
                    warnings.simplefilter('ignore', UserWarning)
                    for name in names:
                        entry = zipfile.ZipInfo(name)
                        entry.external_attr = ((stat.S_IFLNK if name.endswith('/link') else stat.S_IFREG) | 0o644) << 16
                        handle.writestr(entry, b'payload')
                if names[0].endswith('/encrypted'):
                    data = bytearray(archive.read_bytes())
                    data[6] |= 1
                    data[data.index(b'PK\x01\x02') + 8] |= 1
                    archive.write_bytes(data)
                with self.assertRaisesRegex(ValueError, 'Unsafe archive entry'):
                    builder.read_archive(archive, builder.sha(archive.read_bytes()))

    def args(self, archive=None, accepted=None):
        return SimpleNamespace(id='rollback-ci-test', rollback=archive or self.archive,
                               accepted=accepted or ACCEPTED, cache=self.directory / 'unused-cache')

    def test_wrong_rollback_identity_fails_before_constructing_a_lab(self):
        for key, value in [('version', '1.1.2'), ('archive_sha256', '0' * 64), ('inputs', {}), ('files', {})]:
            with self.subTest(field=key), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                archive = root / self.archive.name
                shutil.copyfile(self.archive, archive)
                manifest = dict(self.actual, **{key: value})
                (root / 'manifest.json').write_text(json.dumps(manifest))
                with patch.object(runner.repro, 'Lab') as create_lab, self.assertRaises(ValueError):
                    runner.run(self.args(archive=archive))
                create_lab.assert_not_called()

    def test_wrong_upgrade_input_fails_before_downloads_or_directory_creation(self):
        with tempfile.TemporaryDirectory() as temporary:
            lab = runner.repro.Lab('rollback-ci-test')
            lab.directory = Path(temporary) / 'not-created'
            invalid = Path(temporary) / 'invalid.zip'
            invalid.write_bytes(b'invalid')
            with patch.object(runner.repro, 'Lab', return_value=lab), patch.object(lab, 'download') as download:
                with self.assertRaises(ValueError), contextlib.redirect_stdout(io.StringIO()):
                    runner.run(self.args(accepted=invalid))
            download.assert_not_called()
            self.assertFalse(lab.directory.exists())

    def test_start_failure_stops_owned_lab_and_retains_failure_receipt(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'downloads').mkdir()
            lab = Mock(directory=root, compose=['docker', 'compose', '--project-name', 'owned-test'])
            lab.prepare.return_value = {'minimum': {}}
            lab.command.side_effect = RuntimeError('simulated startup failure')
            with patch.object(runner.repro, 'Lab', return_value=lab):
                with self.assertRaisesRegex(RuntimeError, 'simulated startup failure'):
                    runner.run(self.args())
            lab.stop.assert_called_once_with()
            receipt = json.loads((root / 'rollback-summary.json').read_text())
            self.assertFalse(receipt['passed'])
            self.assertTrue(receipt['stopped'])
            self.assertEqual(receipt['error'], 'simulated startup failure')
            self.assertTrue((root / 'rollback-harness/update.php').is_file())

    def test_state_drift_stops_before_post_transition_editor_writes(self):
        for field in ['posts_sha256', 'options_sha256', 'files', 'version', 'active']:
            with self.subTest(field=field), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                (root / 'downloads').mkdir()
                shutil.copyfile(PREDECESSOR, root / 'downloads/predecessor.zip')
                shutil.copyfile(ACCEPTED, root / 'downloads/candidate.zip')
                old = {'version': '1.1.2', 'active': True, 'files': runner.repro.package_files(PREDECESSOR),
                       'posts_sha256': 'posts-before', 'options_sha256': 'options-before'}
                after = dict(old, version='1.1.4', files=runner.repro.package_files(ACCEPTED))
                after[field] = False if field == 'active' else {} if field == 'files' else 'changed'
                lab = Mock(directory=root, compose=['docker', 'compose', '--project-name', 'owned-test'])
                lab.prepare.return_value = {'minimum': {}}
                lab.command.return_value = SimpleNamespace(returncode=0)
                lab.snapshot.side_effect = [old, old, after]
                with patch.object(runner.repro, 'Lab', return_value=lab):
                    with self.assertRaisesRegex(ValueError, 'File transition failed'):
                        runner.run(self.args())
                lab.stop.assert_called_once_with()
                labels = [call.args[0] for call in lab.command.call_args_list]
                self.assertIn('writer-legacy', labels)
                self.assertNotIn('writer-update', labels)
                receipt = json.loads((root / 'rollback-summary.json').read_text())
                self.assertFalse(receipt['passed'])
                self.assertEqual(len(receipt['transitions']), 1)

    def test_private_update_script_rejects_non_wordpress_execution(self):
        result = subprocess.run(['php', str(SOURCE / 'update.php')], capture_output=True, text=True, timeout=10)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Wrong rollback test environment', result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main(verbosity=2)
