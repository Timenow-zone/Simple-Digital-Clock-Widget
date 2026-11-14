<?php
require '/audit/harness/guard.php';
if (!defined('WP_CLI') || !WP_CLI || !isset($args[0]) || !is_file($args[0])) { throw new RuntimeException('Owned WP-CLI and an explicit candidate source are required.'); }
require $args[0];
wp_set_current_user(get_user_by('login', 'audit_author')->ID);
kses_init();
$GLOBALS['sdcw_comment_checks'] = array();
$diagnostics = array();
add_action('sdcw_metadata_diagnostic', function ($message) use (&$diagnostics) { $diagnostics[] = $message; });
function sdcw_comment_check($name, $pass, $actual = null) { $GLOBALS['sdcw_comment_checks'][] = array('name' => $name, 'passed' => (bool) $pass, 'actual' => $actual); }
function sdcw_comment_nodes($html) { $p = new WP_HTML_Tag_Processor($html); $n = 0; while ($p->next_tag('TIMENOW-ZONE-SDCW')) { $n++; } return $n; }
$cases = json_decode(<<<'FIXTURES'
[
  {
    "name": "quoted-attribute",
    "input": "<p title=\"> <!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> -->\">literal</p>"
  },
  {
    "name": "script",
    "input": "<script>const sample=\"<!-- <timenow-zone-sdcw caption=\\\"Audit \\ud83d\\udd52 &amp; text\\\" time-zone=\\\"Europe/Kyiv\\\" second=\\\"true\\\"></timenow-zone-sdcw> -->\";</script>"
  },
  {
    "name": "xmp",
    "input": "<xmp><!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --></xmp>"
  },
  {
    "name": "noscript",
    "input": "<noscript><!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --></noscript>"
  },
  {
    "name": "plaintext",
    "input": "<plaintext><!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> -->"
  },
  {
    "name": "unterminated",
    "input": "<!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw>"
  },
  {
    "name": "incorrect-closer",
    "input": "<!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --!>"
  },
  {
    "name": "svg-cdata",
    "input": "<svg><![CDATA[ > <!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --> ]]></svg>"
  },
  {
    "name": "math-cdata",
    "input": "<math><![CDATA[ > <!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --> ]]></math>"
  },
  {
    "name": "malformed-html-cdata",
    "input": "<![CDATA[ > <!-- <timenow-zone-sdcw caption=\"Audit 🕒 &amp; text\" time-zone=\"Europe/Kyiv\" second=\"true\"></timenow-zone-sdcw> --> ]]>"
  }
]
FIXTURES
, true);
$real = '<timenow-zone-sdcw caption="Real &amp; independent" second="true" width="230" time-zone="Pacific/Chatham"></timenow-zone-sdcw>';
$foreign = '<p class="foreign">Before <strong>safe &amp; text</strong></p>';
foreach ($cases as $case) {
    $first = wp_unslash(apply_filters('content_save_pre', wp_slash($case['input'])));
    $again = wp_unslash(apply_filters('content_save_pre', wp_slash($first)));
    $mixed = wp_unslash(apply_filters('content_save_pre', wp_slash($foreign . $real . $real . $case['input'])));
    sdcw_comment_check($case['name'] . ': no unintended clock nodes', 0 === sdcw_comment_nodes($first), $first);
    sdcw_comment_check($case['name'] . ': repeated filtered save is stable', $first === $again, $again);
    sdcw_comment_check($case['name'] . ': actual clocks remain', 2 === sdcw_comment_nodes($mixed), $mixed);
    sdcw_comment_check($case['name'] . ': actual settings and foreign prefix remain exact', 0 === strpos($mixed, $foreign . $real . $real), $mixed);
}
$comment = '<!-- <timenow-zone-sdcw caption="Example"></timenow-zone-sdcw> -->';
foreach (array('remove-comments','escape-all','remove-clocks') as $policy) {
    $callback = function ($html) use ($policy) {
        if ('remove-comments' === $policy) { return preg_replace('/<!--.*?-->/s', '', $html); }
        if ('escape-all' === $policy) { return esc_html($html); }
        return preg_replace('~</?timenow-zone-sdcw\b[^>]*>~i', '', $html);
    };
    add_filter('pre_kses', $callback, 10);
    try { $actual = wp_kses_post($comment . $real); } finally { remove_filter('pre_kses', $callback, 10); }
    sdcw_comment_check($policy . ': stricter callback remains effective', sdcw_comment_nodes($actual) === ('remove-comments' === $policy ? 1 : 0), $actual);
}
$malicious = '<!-- <timenow-zone-sdcw></timenow-zone-sdcw> --!><timenow-zone-sdcw onclick="alert(1)" background="url(javascript:alert(2))" caption="safe"></timenow-zone-sdcw><script>alert(3)</script><a href="javascript:alert(4)">link</a>';
$clean = wp_kses_post($malicious);
sdcw_comment_check('Dangerous markup remains filtered and actual clock remains', 1 === sdcw_comment_nodes($clean) && !preg_match('/onclick|javascript:|<script|background=/i', $clean), $clean);
$nested = null; $inside = false;
$callback = function ($html) use (&$nested, &$inside, $comment) { if (!$inside) { $inside = true; $nested = wp_kses_post($comment); $inside = false; } return $html; };
add_filter('pre_kses', $callback, 10);
try { $outer = wp_kses_post($comment . $real); } finally { remove_filter('pre_kses', $callback, 10); }
sdcw_comment_check('Recursive KSES remains independent', 1 === sdcw_comment_nodes($outer) && 0 === sdcw_comment_nodes($nested));
sdcw_comment_check('Caption frames remain balanced', array() === SDCW_clock_kses_frames() && array() === SDCW_clock_save_caption_frames());

// Assert whole native filtered saves, including Core's block-attribute pass.
$ordinary = array(
    'ordinary' => $comment,
    'multiline' => "<!--\n" . $real . "\n" . $real . "\n-->",
    'nested' => '<!-- outer ' . $comment,
    'foreign-markup' => '<!-- <strong>Example</strong>' . $real . ' -->',
);
foreach ($ordinary as $name => $input) {
    $saved = wp_unslash(apply_filters('content_save_pre', wp_slash($input)));
    sdcw_comment_check($name . ': inert after native save', 0 === sdcw_comment_nodes($saved), $saved);
    sdcw_comment_check($name . ': stable repeated native save', $saved === wp_unslash(apply_filters('content_save_pre', wp_slash($saved))));
}
$boundaries = array(
    'abrupt-empty' => array('<!-->' . $real . '<!--->' . $real, 2),
    'incorrect-closer-neighbor' => array('<!-- ' . $real . ' --!>' . $real, 1),
    'bare-cdata-prefix' => array('<![CDATA[ <!-- <timenow-zone-sdcw></timenow-zone-sdcw> --> ]]>' . $real, 1),
);
foreach ($boundaries as $name => $case) {
    $saved = wp_unslash(apply_filters('content_save_pre', wp_slash($case[0])));
    sdcw_comment_check($name . ': live clocks survive native save', $case[1] === sdcw_comment_nodes($saved), $saved);
    sdcw_comment_check($name . ': native repeated save is stable', $saved === wp_unslash(apply_filters('content_save_pre', wp_slash($saved))));
}
foreach (array('<!-- wp:vendor/example {"caption":"<timenow-zone-sdcw>"} -->', '<!-- wp:simple-digital-clock-block/widget-block {"caption":"<timenow-zone-sdcw>"} -->', '<!-- <timenow-zone-sdcw-example> -->') as $input) {
    sdcw_comment_check('Unrelated block metadata and different tag names remain native', SDCW_escape_clock_comments($input) === $input, $input);
}
$benchmarks = array();
$units = array('comments'=>$comment,'rawtext'=>'<script>'.$comment.'</script>','quoted'=>'<p title=\''.$comment.'\'>x</p>','xmp'=>'<xmp>'.$comment.'</xmp>','noscript'=>'<noscript>'.$comment.'</noscript>','cdata'=>'<![CDATA[ > '.$comment.' ]]>','cdata-fake-script'=>'<svg><![CDATA[ ><script>'.$comment.' ]]></svg>','cdata-fake-quote'=>'<svg><![CDATA[ ><div title="'.$comment.' ]]></svg>');
foreach ($units as $name => $unit) {
    foreach (array(1024,4096) as $count) {
        $input = str_repeat($unit, $count);$start = microtime(true);$normalized = SDCW_escape_clock_comments($input);$elapsed = microtime(true)-$start;
        $benchmarks[] = array('name'=>$name,'count'=>$count,'bytes'=>strlen($input),'seconds'=>$elapsed);
        sdcw_comment_check($name . $count . ': bounded under five seconds', $elapsed < 5, $elapsed);
        sdcw_comment_check($name . $count . ': normalization is stable', $normalized === SDCW_escape_clock_comments($normalized));
    }
}
sdcw_comment_check('No lexical diagnostics during stress probes', array() === $diagnostics, $diagnostics);
$checks=$GLOBALS['sdcw_comment_checks'];$failed=count(array_filter($checks,function($r){return !$r['passed'];}));
echo wp_json_encode(array('core'=>get_bloginfo('version'),'php'=>PHP_VERSION,'source_sha256'=>hash_file('sha256',$args[0]),'checks'=>$checks,'failed'=>$failed,'benchmarks'=>$benchmarks,'boundary'=>'Actual Core filtered save/KSES callbacks; no native HTTP persistence or browser rendering claim. Clock node count includes foreign namespaces; browser checks distinguish active custom elements.')) . "\n";
WP_CLI::halt($failed ? 1 : 0);
