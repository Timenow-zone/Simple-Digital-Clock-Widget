<?php
// All mutations are limited to a newly provisioned local candidate lab.
$sdcw_run = json_decode(file_get_contents('/audit/run.json'), true);
if (!is_array($sdcw_run) || wp_get_environment_type() !== 'local' ||
    !defined('SDCW_CANDIDATE_PROJECT') || SDCW_CANDIDATE_PROJECT !== $sdcw_run['project']) {
    throw new RuntimeException('Wrong candidate lab identity');
}
