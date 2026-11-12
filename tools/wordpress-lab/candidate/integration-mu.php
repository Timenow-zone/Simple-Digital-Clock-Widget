<?php
// This integration fixture has no effect outside the dedicated local audit sites.
if(wp_get_environment_type()!=='local'||!defined('SDCW_CANDIDATE_PROJECT'))return;
add_action('widgets_init',function(){register_sidebar(array('name'=>'Candidate acceptance sidebar','id'=>'candidate-sidebar','before_widget'=>'<section>','after_widget'=>'</section>','before_title'=>'<h2>','after_title'=>'</h2>'));});
add_shortcode('audit_integration_clock',function(){return '<timenow-zone-sdcw caption="Custom integration shortcode" time-zone="UTC" locale="en-GB"></timenow-zone-sdcw>';});
add_action('init',function(){if(function_exists('register_block_pattern'))register_block_pattern('audit/stored-clock',array('title'=>'Audit stored clock','content'=>get_option('audit_pattern_content','')));});
add_action('template_redirect',function(){
 if(!isset($_GET['audit_case']))return;$case=(string)$_GET['audit_case'];
 if(!in_array($case,array('widgets','raw','pattern','template-part','native-pattern','native-template-part','late','explicit','late-explicit','dependencies','capture-dependencies','empty','escaped','json','xml'),true))return;
 if($case==='json'||$case==='xml'){header('Content-Type: '.($case==='json'?'application/json':'application/xml'));wp_footer();echo $case==='json'?'{"clock":"safe"}':'<clock>safe</clock>';exit;}
 header('Content-Type: text/html; charset=UTF-8');header('Cache-Control: no-store');
 if(in_array($case,array('explicit','dependencies'),true))wp_enqueue_script('simple-digital-clock');
 if(in_array($case,array('dependencies','capture-dependencies'),true))add_action('wp_enqueue_scripts',function(){
  wp_register_script('audit-dependency',home_url('/audit-dependency.js'),array(),'1',true);wp_scripts()->registered['simple-digital-clock']->deps[]='audit-dependency';
  wp_add_inline_script('simple-digital-clock','window.auditOrder.push("before");','before');wp_localize_script('simple-digital-clock','AuditData',array('message'=>'Localized caption'));
  wp_add_inline_script('simple-digital-clock','window.auditOrder.push("after");window.auditAfter={defined:!!customElements.get("timenow-zone-sdcw"),data:AuditData.message};','after');
 },20);
 if(in_array($case,array('late','late-explicit'),true))add_action('wp_footer',function()use($case){if($case==='late-explicit')wp_enqueue_script('simple-digital-clock');echo '<timenow-zone-sdcw caption="Late footer PHP" time-zone="UTC"></timenow-zone-sdcw>';},PHP_INT_MAX-1);
 echo '<!doctype html><html><head><meta charset="utf-8">';wp_head();echo '</head><body><main><h1>Audit '.esc_html($case).'</h1>';
 if($case==='widgets')dynamic_sidebar('candidate-sidebar');
 if($case==='raw'){echo '<timenow-zone-sdcw caption="PHP raw HTML" width="280" date="true" second="true" time-zone="Europe/Kyiv"></timenow-zone-sdcw>';echo do_shortcode('[audit_integration_clock]');}
 if($case==='pattern'){echo do_blocks(get_option('audit_pattern_content',''));$id=(int)get_option('audit_reusable_id');if($id)echo do_blocks('<!-- wp:block {"ref":'.$id.'} /-->');}
 if($case==='template-part')echo do_blocks(get_option('audit_template_content',''));
 if($case==='native-pattern')echo do_blocks('<!-- wp:pattern {"slug":"audit/stored-clock"} /-->');
 if($case==='native-template-part'){
  $id=get_option('audit_native_template_id','');if($id){$parts=explode('//',$id);echo do_blocks('<!-- wp:template-part '.wp_json_encode(array('theme'=>$parts[0],'slug'=>$parts[1])).' /-->');}
 }

 if($case==='escaped')echo '<pre>&lt;timenow-zone-sdcw&gt;&lt;/timenow-zone-sdcw&gt;</pre><template><timenow-zone-sdcw></timenow-zone-sdcw></template><script type="text/plain"><timenow-zone-sdcw></timenow-zone-sdcw></script>';
 if(in_array($case,array('explicit','dependencies','capture-dependencies','late-explicit'),true))echo '<timenow-zone-sdcw caption="Core explicit clock" time-zone="UTC"></timenow-zone-sdcw>';
 echo '</main>';wp_footer();echo '</body></html>';exit;
},2);
