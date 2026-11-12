"""Candidate lab safety controls independent of Docker and product execution."""

import hashlib
import importlib.util
import json
from pathlib import Path
import stat
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import zipfile

SOURCE = Path(__file__).resolve().parents[1] / 'tools/wordpress-lab/candidate/run.py'
SPEC = importlib.util.spec_from_file_location('candidate_lab', SOURCE)
lab = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lab)


def candidate(directory):
    archive = directory / 'candidate.zip'
    data = b'<?php\n/*\nVersion: 1.1.6\n*/\n'
    with zipfile.ZipFile(archive, 'x') as handle:
        handle.writestr('simple-digital-clock/widget_init.php', data)
    sha = lab.digest(archive)
    manifest = directory / 'manifest.json'
    manifest.write_text(json.dumps({'version': '1.1.6', 'file_count': 1, 'files': {'widget_init.php': hashlib.sha256(data).hexdigest()}, 'archive_sha256': sha, 'archive_bytes': archive.stat().st_size}))
    return archive, manifest, sha


class CandidateLabSafetyTests(unittest.TestCase):
    def test_prepare_is_exclusive_and_freezes_exact_inputs_without_docker(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            (root / '.local').mkdir()
            cache = root / 'cache'
            cache.mkdir()
            archive, manifest, sha = candidate(root)
            downloads = {}
            for site in lab.SITES:
                path = cache / ('wordpress-' + site + '.zip')
                with zipfile.ZipFile(path, 'x') as handle:
                    handle.writestr('wordpress/index.php', b'<?php')
                downloads[path.name] = {'sha256': lab.digest(path), 'bytes': path.stat().st_size}
            lock = {'downloads': downloads, 'versions': {'minimum_core': '6.3.14', 'current_core': '7.1.4', 'minimum_php': '7.0.33', 'current_php': '8.3.35'}, 'images': {name: 'sha256:' + '0' * 64 for name in ('db', *lab.SITES)}}
            args = SimpleNamespace(run_dir=root / '.local/candidate-test-a', project='sdcw-candidate-test-a', zip=archive, manifest=manifest, sha256=sha, cache=cache, minimum_port=65481, current_port=65482)
            with patch.object(lab, 'ROOT', root), patch.object(lab, 'LOCK', lock), patch.object(lab, 'check_ports'), patch.object(lab.subprocess, 'run') as execute:
                lab.prepare(args)
                runner = lab.Lab(args.run_dir)
                self.assertEqual(runner.receipt['archive_sha256'], sha)
                self.assertEqual(runner.receipt['matrix_status'], 'NOT_RUN')
                execute.assert_not_called()
                with self.assertRaises(ValueError):
                    lab.prepare(args)
                self.assertEqual(lab.digest(args.run_dir / 'inputs/candidate.zip'), sha)
                frozen = args.run_dir / 'inputs/wordpress-current.zip'
                frozen.chmod(0o644)
                frozen.write_bytes(b'changed input')
                with self.assertRaises(ValueError):
                    lab.Lab(args.run_dir)

    def test_candidate_verification_uses_explicit_frozen_manifest(self):
        with tempfile.TemporaryDirectory() as temporary:
            archive, manifest, sha = candidate(Path(temporary))
            self.assertEqual(lab.verify_candidate(archive, manifest, sha)['version'], '1.1.6')
            with self.assertRaises(ValueError):
                lab.verify_candidate(archive, manifest, '0' * 64)
            value = json.loads(manifest.read_text())
            value['files']['unexpected.php'] = '0' * 64
            manifest.write_text(json.dumps(value))
            with self.assertRaises(ValueError):
                lab.verify_candidate(archive, manifest, sha)

    def test_stage_preserves_original_inputs_and_refuses_reuse(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            archive, manifest_path, sha = candidate(root)
            manifest = json.loads(manifest_path.read_text())
            runner = lab.Lab.__new__(lab.Lab)
            runner.directory = root / 'run'
            (runner.directory / 'evidence').mkdir(parents=True)
            (runner.directory / 'inputs').mkdir()
            original = runner.directory / 'inputs/candidate.zip'
            original.write_bytes(b'original frozen input')
            runner.receipt = {'archive_sha256': '0' * 64}
            runner.assert_owned = Mock()
            before = {'plugin': '1.1.6', 'files': {}, 'active': True, 'options': {}, 'tables': {}}
            after = dict(before, files=manifest['files'])
            runner.snapshot = Mock(side_effect=[before, after, before, after])
            runner.wp = Mock()
            runner.stage('rc3-test', archive, manifest_path, sha)
            self.assertEqual(original.read_bytes(), b'original frozen input')
            frozen = runner.directory / 'stages/rc3-test/candidate.zip'
            self.assertEqual(lab.digest(frozen), sha)
            receipt = json.loads((frozen.parent / 'stage.json').read_text())
            self.assertEqual(receipt['initial_archive_sha256'], '0' * 64)
            self.assertEqual(runner.wp.call_count, 2)
            with self.assertRaises(ValueError):
                runner.stage('rc3-test', archive, manifest_path, sha)
            self.assertEqual(runner.wp.call_count, 2)
            for label in ('../escape', 'Bad', 'x/y'):
                with self.assertRaises(ValueError):
                    runner.stage(label, archive, manifest_path, sha)

    def test_duplicate_traversal_symlink_and_nonregular_archives_fail(self):
        cases = [('simple-digital-clock/../../escape', 0), ('/simple-digital-clock/file', 0), ('simple-digital-clock/file\\escape', 0), ('simple-digital-clock/.secret', 0), ('simple-digital-clock/link', stat.S_IFLNK | 0o777), ('simple-digital-clock/device', stat.S_IFCHR | 0o600)]
        for name, mode in cases:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                archive = Path(temporary) / 'bad.zip'
                info = zipfile.ZipInfo(name)
                info.external_attr = mode << 16
                with zipfile.ZipFile(archive, 'x') as handle:
                    handle.writestr(info, b'bad')
                with self.assertRaises(ValueError):
                    lab.extract_new(archive, Path(temporary) / 'output', lab.SLUG)
                self.assertFalse((Path(temporary) / 'output').exists())
        with tempfile.TemporaryDirectory() as temporary:
            archive, _, _ = candidate(Path(temporary))
            with zipfile.ZipFile(archive, 'a') as handle:
                with self.assertWarns(UserWarning):
                    handle.writestr('simple-digital-clock/widget_init.php', b'duplicate')
            with self.assertRaises(ValueError):
                lab.archive_files(archive, lab.SLUG)

    def test_existing_extraction_directory_and_evidence_are_preserved(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            archive, _, _ = candidate(root)
            destination = root / 'kept'
            destination.mkdir()
            (destination / 'marker').write_text('retained')
            with self.assertRaises(ValueError):
                lab.extract_new(archive, destination, lab.SLUG)
            self.assertEqual((destination / 'marker').read_text(), 'retained')
            runner = lab.Lab.__new__(lab.Lab)
            runner.directory = root
            (root / 'evidence').mkdir()
            (root / 'evidence/kept.json').write_text('original failure')
            with patch.object(lab.subprocess, 'run') as execute:
                with self.assertRaises(ValueError):
                    runner.command('kept', ['must-not-run'])
                execute.assert_not_called()

    def test_official_core_hidden_configuration_is_preserved(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            archive = root / 'wordpress.zip'
            with zipfile.ZipFile(archive, 'x') as handle:
                handle.writestr('wordpress/wp-content/plugins/akismet/.htaccess', b'deny')
            lab.extract_new(archive, root / 'core', 'wordpress')
            self.assertEqual((root / 'core/wp-content/plugins/akismet/.htaccess').read_bytes(), b'deny')

    def test_run_and_project_boundaries_reject_old_or_escaped_runs(self):
        for name in ('../escape', 'independent-116-rc1-20261112', 'candidate-UPPER', 'candidate-a/child'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                lab.validate_directory(lab.ROOT / '.local' / name)
        for name in ('sdcw-independent-116-rc1-20261112', 'unrelated', '../escape', 'sdcw-candidate-UPPER'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                lab.validate_project(name)

    def test_stop_checks_ownership_and_only_stops_owned_services(self):
        runner = lab.Lab.__new__(lab.Lab)
        runner.directory = Path('/tmp/test-candidate')
        runner.compose = ['docker', 'compose', '--project-name', 'sdcw-candidate-test']
        runner.assert_owned = Mock()
        runner.command = Mock(side_effect=[SimpleNamespace(stdout=''), SimpleNamespace(stdout='')])
        runner.stop('finish')
        runner.assert_owned.assert_called_once()
        for call in runner.command.call_args_list:
            self.assertEqual(call.args[1][:len(runner.compose)], runner.compose)
            self.assertFalse(set(('down', 'prune', '--volumes')) & set(call.args[1]))
        runner.command = Mock(side_effect=[SimpleNamespace(stdout=''), SimpleNamespace(stdout='still-running')])
        with self.assertRaises(RuntimeError):
            runner.stop('retry')

    def test_another_runs_project_is_rejected(self):
        runner = lab.Lab.__new__(lab.Lab)
        runner.directory = Path('/tmp/candidate-new')
        runner.receipt = {'project': 'sdcw-candidate-test'}
        runner.command = Mock(side_effect=[SimpleNamespace(stdout='container-id\n'), SimpleNamespace(stdout=json.dumps({'org.timenow.sdcw.candidate-run': '/tmp/candidate-old'}))])
        with self.assertRaises(ValueError):
            runner.assert_owned()

    def test_timed_out_commands_preserve_failure_receipt(self):
        with tempfile.TemporaryDirectory() as temporary:
            runner = lab.Lab.__new__(lab.Lab)
            runner.directory = Path(temporary)
            (runner.directory / 'evidence').mkdir()
            with patch.object(lab.subprocess, 'run', side_effect=subprocess.TimeoutExpired(['slow'], 1, output=b'partial')):
                with self.assertRaises(RuntimeError):
                    runner.command('timeout-control', ['slow'], timeout=1)
            receipt = json.loads((runner.directory / 'evidence/timeout-control.json').read_text())
            self.assertIsNone(receipt['exit'])
            self.assertEqual(receipt['stdout'], 'partial')

    def test_plugin_check_command_precedes_global_flags(self):
        runner = lab.Lab.__new__(lab.Lab)
        runner.compose = ['docker', 'compose']
        runner.command = Mock()
        runner.wp('current', 'checker', 'plugin', 'check', 'simple-digital-clock')
        command = runner.command.call_args.args[1]
        offset = command.index('/audit/inputs/wp-cli.phar')
        self.assertEqual(command[offset + 1:offset + 3], ['plugin', 'check'])


if __name__ == '__main__':
    unittest.main()
