<?php
// This fixture is installed only in an owned disposable candidate lab.
if (!defined('SDCW_CANDIDATE_PROJECT') || wp_get_environment_type() !== 'local') {
    throw new RuntimeException('Candidate fixture cannot run outside its lab');
}
add_action('widgets_init', function () {
    register_sidebar(array('name' => 'Candidate acceptance sidebar', 'id' => 'candidate-sidebar', 'before_widget' => '<section>', 'after_widget' => '</section>'));
});
