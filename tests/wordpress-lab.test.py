"""Safety controls for the disposable lab's archive and run boundaries."""

import importlib.util
from pathlib import Path
import stat
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock
import zipfile

source = Path(__file__).resolve().parents[1] / 'tools/wordpress-lab/repro/run.py'
spec = importlib.util.spec_from_file_location('wordpress_repro', source)
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)


class LabSafetyTests(unittest.TestCase):
    def test_checker_accepts_only_json_or_the_pinned_zero_finding_message(self):
        success = 'Success: Checks complete. No errors found.\n'
        self.assertEqual(lab.checker_findings(SimpleNamespace(returncode=0, stdout=success)), [])
        self.assertEqual(lab.checker_findings(SimpleNamespace(returncode=0, stdout='[{"type":"WARNING"}]')), [{'type': 'WARNING'}])
        for status, output in [(1, success), (0, 'Fatal error'), (0, '{}'), (0, '[{}]')]:
            with self.assertRaises(ValueError):
                lab.checker_findings(SimpleNamespace(returncode=status, stdout=output))

    def test_checker_command_precedes_global_flags_for_real_runtime_detection(self):
        runner = lab.Lab('safety-test')
        runner.command = Mock(return_value=SimpleNamespace(stdout=''))
        runner.wp('current', 'plugin', 'check', 'simple-digital-clock')
        command = runner.command.call_args.args[1]
        offset = command.index('/lab/downloads/wp-cli.phar')
        self.assertEqual(command[offset + 1:offset + 3], ['plugin', 'check'])

    def test_stop_verifies_the_owned_project_and_rejects_running_containers(self):
        for running in ['', 'still-running-container']:
            with self.subTest(running=running):
                runner = lab.Lab('safety-test')
                runner.command = Mock(side_effect=[SimpleNamespace(stdout=''), SimpleNamespace(stdout=running)])
                if running:
                    with self.assertRaises(RuntimeError):
                        runner.stop()
                else:
                    runner.stop()
                for call in runner.command.call_args_list:
                    self.assertEqual(call.args[1][:len(runner.compose)], runner.compose)
                    self.assertNotIn('down', call.args[1])
                    self.assertNotIn('prune', call.args[1])

    def test_subnet_selection_preserves_existing_networks(self):
        self.assertEqual(lab.free_subnet([[{'Subnet': '10.253.200.0/24'}]]), '10.253.201.0/24')
        with self.assertRaises(ValueError):
            lab.free_subnet([[{'Subnet': '10.253.0.0/16'}]])

    def test_run_ids_cannot_escape_the_owned_directory(self):
        for invalid in ['../old-lab', '/tmp/lab', 'UPPERCASE', '', 'a' * 49, 'x/y']:
            with self.assertRaises(ValueError):
                lab.Lab(invalid)

    def test_existing_runs_are_never_reinstalled(self):
        with tempfile.TemporaryDirectory() as directory:
            runner = lab.Lab('safety-test')
            runner.directory = Path(directory)
            marker = runner.directory / 'retained-evidence'
            marker.write_text('untouched')
            with self.assertRaises(ValueError):
                runner.prepare(Path('missing-candidate.zip'), None)
            self.assertEqual(marker.read_text(), 'untouched')

    def test_archive_traversal_and_symlinks_are_rejected(self):
        for name, mode in [('wordpress/../../outside', 0), ('/wordpress/x', 0),
                           ('other/file', 0), ('wordpress/link', stat.S_IFLNK | 0o777),
                           ('wordpress/..\\outside', 0)]:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                archive = root / 'input.zip'
                entry = zipfile.ZipInfo(name)
                entry.external_attr = mode << 16
                with zipfile.ZipFile(archive, 'w') as handle:
                    handle.writestr(entry, 'payload')
                with self.assertRaises(ValueError):
                    lab.extract(archive, root / 'output', 'wordpress')
                self.assertFalse((root / 'outside').exists())

    def test_existing_files_are_never_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / 'input.zip'
            target = root / 'output'
            target.mkdir()
            (target / 'wp-config.php').write_text('retained')
            with zipfile.ZipFile(archive, 'w') as handle:
                handle.writestr('wordpress/wp-config.php', 'replacement')
            with self.assertRaises(ValueError):
                lab.extract(archive, target, 'wordpress')
            self.assertEqual((target / 'wp-config.php').read_text(), 'retained')

    def test_download_mismatch_fails_before_execution(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            runner = lab.Lab('safety-test')
            runner.directory = root / 'run'
            (runner.directory / 'downloads').mkdir(parents=True)
            cache = root / 'cache'
            cache.mkdir()
            (cache / 'wp-cli.phar').write_bytes(b'untrusted')
            with self.assertRaises(ValueError):
                runner.download('wp-cli.phar', {'bytes': 9, 'sha256': '0' * 64}, cache)


if __name__ == '__main__':
    unittest.main()
