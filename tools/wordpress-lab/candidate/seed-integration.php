<?php
require __DIR__.'/guard.php';if(!defined('WP_CLI'))throw new RuntimeException('WP-CLI required');
if(get_option('audit_pattern_content',null)!==null)throw new RuntimeException('Refuse to overwrite integration fixtures');
wp_set_current_user(get_user_by('login','audit_admin')->ID);
$catalog=json_decode(file_get_contents('/audit/evidence/baseline112-seed-chromium/'.$args[0].'-catalog.json'),true);$normal=null;$pattern=null;$template=null;
foreach($catalog as $c){if(isset($c['type'])&&$c['role']==='admin'){if($c['group']==='normal')$normal=$c;if($c['type']==='blocks')$pattern=$c;if($c['type']==='template-parts')$template=$c;}}
if(!$normal)throw new RuntimeException('No native baseline');$content=get_post($normal['id'])->post_content;$blocks=parse_blocks($content);$clock='';foreach($blocks as $b)if($b['blockName']==='simple-digital-clock-block/widget-block'){$clock=$b['innerHTML'];break;}
$blockWidget=new WP_Widget_Block();$widgets=array('_multiwidget'=>1);$ids=array();$number=2;foreach($blocks as $block)if($block['blockName']==='simple-digital-clock-block/widget-block'){$widgets[$number]=$blockWidget->update(array('content'=>serialize_block($block)),array());$ids[]='block-'.$number;$number++;}if(count($ids)!==3)throw new RuntimeException('Expected three canonical widgets');update_option('widget_block',$widgets);
$textWidget=new WP_Widget_Text();$tw=$textWidget->update(array('title'=>'Classic Text clock','text'=>$clock,'filter'=>true,'visual'=>true),array());update_option('widget_text',array(2=>$tw,'_multiwidget'=>1));
$htmlWidget=new WP_Widget_Custom_HTML();$hw=$htmlWidget->update(array('title'=>'Classic Custom HTML clock','content'=>$clock),array());update_option('widget_custom_html',array(2=>$hw,'_multiwidget'=>1));
update_option('sidebars_widgets',array('wp_inactive_widgets'=>array(),'candidate-sidebar'=>array_merge($ids,array('text-2','custom_html-2')),'array_version'=>3));
update_option('audit_pattern_content',$content);if($pattern)update_option('audit_reusable_id',(int)$pattern['id']);if($template){update_option('audit_template_content',$template['stored']);update_option('audit_native_template_id',$template['id']);}
update_post_meta($normal['id'],'audit_foreign_metadata',array('nested'=>array('quotes'=>'" \' \\ terminal\\','unicode'=>'Київ 🕒','numbers'=>array(0,1,42))));
wp_set_post_terms($normal['id'],array('Audit compatibility','Clock fixtures'),'post_tag');
$raw=wp_insert_post(wp_slash(array('post_type'=>'page','post_status'=>'publish','post_title'=>'Audit Custom HTML and shortcode','post_content'=>'<!-- wp:html -->'.$clock.'<!-- /wp:html -->' . "\n" . '<!-- wp:shortcode -->[audit_integration_clock]<!-- /wp:shortcode -->')),true);
echo json_encode(array('normal_post'=>$normal['id'],'custom_html_page'=>$raw,'widgets'=>array_merge($ids,array('text-2','custom_html-2')),'reusable'=>$pattern,'template'=>$template),JSON_PRETTY_PRINT),"\n";
