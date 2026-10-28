import fs from 'node:fs/promises';
import path from 'node:path';
import { openEditor, launchLabBrowser } from './browser-helpers.mjs';
import { compareClockRenders, freezeDate } from './visual-helpers.mjs';

const [mode, stage, engine = 'chromium', only = 'all', label = 'final-acceptance-921', reference = label] = process.argv.slice(2);
if (!['seed', 'baseline', 'check', 'save'].includes(mode) || !/^[a-z0-9-]+$/.test(stage || '') || !/^[a-z0-9-]+$/.test(label) || !/^[a-z0-9-]+$/.test(reference)) throw new Error('Invalid acceptance arguments');
const directory = path.resolve('.local/wordpress-lab', label);
const sites = JSON.parse(await fs.readFile(path.join(directory, 'sites.json'), 'utf8')).filter(site => only === 'all' || site.key === only);
const allowed = new Set(['http://localhost:10003', ...[19427,19428,19429,19430,19528,19529,19530,19531,19533,19534].map(port => `http://127.0.0.1:${port}`), 'http://127.0.0.1:19531/clock-child']);
if (!sites.length || sites.some(site => !allowed.has(site.url))) throw new Error('Refusing a non-lab target');
const accounts = JSON.parse(await fs.readFile(path.join(directory, 'accounts.json'), 'utf8'));
const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/1.1.1.json', 'utf8'));
const captions = JSON.parse(await fs.readFile('.local/wordpress-lab/numeric-fix/caption-seeds.json', 'utf8'))[0].records[0].expected.map(row => row.caption);
const browser = await launchLabBrowser(engine);
const started = Date.now();
const name = 'simple-digital-clock-block/widget-block';
const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,canonical(v)])) : value;
const equal = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

async function visitor(site, post, widgetId) {
  const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 1000 } });
  try {
    await context.route('**/*', route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const page = await context.newPage();
    await freezeDate(page, '2026-10-28T12:34:56.780Z');
    const response = await page.goto(`${site.url}/?p=${post}`, { waitUntil: 'domcontentloaded' });
    const selector = widgetId ? `#${widgetId}` : '.wp-block-post-content, .entry-content';
    await page.waitForFunction(selector => {
      const root = document.querySelector(selector);
      const clocks = root ? [...root.querySelectorAll('timenow-zone-sdcw')] : [];
      return clocks.length && clocks.every(node => node.shadowRoot?.querySelector('a')?.textContent.length);
    }, selector);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const clocks = await page.locator(selector).first().locator('timenow-zone-sdcw').evaluateAll(nodes => nodes.map(node => {
      const main = node.shadowRoot.querySelector('.widget');
      const anchor = node.shadowRoot.querySelector('a');
      const style = element => {
        const css = getComputedStyle(element);
        return Object.fromEntries(['display','position','color','backgroundColor','backgroundImage','borderRadius','borderWidth','boxShadow','fontFamily','fontSize','textAlign','transform'].map(key => [key,css[key]]));
      };
      return { attrs: Object.fromEntries([...node.attributes].map(attr => [attr.name,attr.value])), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, main: style(main), anchor: style(anchor), text: anchor.textContent };
    }));
    return { status: response.status(), clocks };
  } finally { await context.close(); }
}

async function runSite(site) {
  const target = path.join(directory, `${stage}-${site.key}-${engine}.json`);
  await fs.access(target).then(() => { throw new Error('Refusing to overwrite acceptance evidence'); }, error => { if(error.code!=='ENOENT') throw error; });
  const seedPath = path.join(directory, `seed-${site.key}.json`);
  const seed = mode === 'seed' ? null : JSON.parse(await fs.readFile(seedPath,'utf8'));
  if(seed){
    for(const record of seed.records.filter(record=>record.kind==='template-part')){
      const url=new URL(record.url);
      if(url.searchParams.get('rest_route')==='/'){
        // Core 6.3 returns the API root as a template-part self link.
        const match=seed.records.find(record=>record.kind==='layout').content.match(/<!-- wp:template-part (\{[^\n]*?\}) \/-->/);
        if(!match)throw new Error('Missing template-part reference');
        const {theme,slug}=JSON.parse(match[1]);
        url.searchParams.set('rest_route',`/wp/v2/template-parts/${theme}//${slug}`);
        record.url=url.href;
      }
    }
  }
  const row = { key: site.key, engine, mode, stage, checks: [], records: [], widgets: [], renders: [], errors: [] };
  const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
  const roles = site.multisite ? ['administrator','siteadmin','editor','author'] : ['administrator','editor','author'];
  const context = await browser.newContext({ timezoneId: ['seed','baseline'].includes(mode) ? 'UTC' : 'America/New_York' });
  try {
    const page = await openEditor(context, site, accounts[site.key].administrator);
    const guide = page.getByRole('dialog').getByRole('button',{name:'Close',exact:true});
    if (await guide.count()) await guide.click();
    if (mode === 'seed') {
      const created = await page.evaluate(async ({ name, fixtures, captions, site, roles }) => {
        const inspect = content => {
          const blocks = wp.blocks.parse(content);
          const leaves = nodes => nodes.flatMap(node => [node,...leaves(node.innerBlocks || [])]);
          const template = document.createElement('template');template.innerHTML=content;
          return { valid: leaves(blocks).every(block => block.isValid), attrs: leaves(blocks).filter(block => block.name===name).map(block => block.attributes), dom: [...template.content.querySelectorAll('timenow-zone-sdcw')].map(node => Object.fromEntries([...node.attributes].map(attr=>[attr.name,attr.value]))) };
        };
        const corpus = '<!-- wp:paragraph --><p>Adjacent &amp; preserved acceptance text</p><!-- /wp:paragraph -->\n\n'+wp.blocks.serialize(captions.map(caption=>wp.blocks.createBlock(name,{caption,timeZone:'UTC'})))+'\n\n'+fixtures.map(fixture=>fixture.content).join('\n\n');
        if(!inspect(corpus).valid || inspect(corpus).attrs.length!==103)throw new Error('Official baseline fixtures are not valid');
        const create = async (url,data) => wp.apiFetch({path:url,method:'POST',data});
        const records=[];
        for(const role of roles){
          const post=await create('/wp/v2/posts',{title:`Clock acceptance ${role}`,status:'publish',author:site.users[role].id,content:corpus});
          const saved=await wp.apiFetch({path:`/wp/v2/posts/${post.id}?context=edit`});
          if(saved.content.raw!==corpus)throw new Error('Baseline changed input bytes');
          records.push({id:post.id,role,kind:'native',url:saved._links.self[0].href,content:saved.content.raw,expected:inspect(saved.content.raw)});
        }
        const reusable=await create('/wp/v2/blocks',{title:'Clock acceptance synced pattern',status:'publish',content:fixtures[0].content+'\n'+fixtures[4].content});
        records.push({id:reusable.id,role:'administrator',kind:'pattern',url:reusable._links.self[0].href,content:reusable.content.raw,expected:inspect(reusable.content.raw)});
        let part=null;
        if(site.block_theme){
          part=await create('/wp/v2/template-parts',{slug:'sdcw-acceptance-'+Date.now(),theme:site.theme,area:'footer',title:'Clock acceptance template part',status:'publish',content:fixtures[0].content+'\n'+fixtures[6].content});
          records.push({id:part.wp_id,role:'administrator',kind:'template-part',url:part._links.self[0].href,content:part.content.raw,expected:inspect(part.content.raw)});
        }
        const mixed=[wp.blocks.createBlock('core/paragraph',{content:'Unrelated <strong>content</strong> &amp; structure'}),wp.blocks.createBlock('core/group',{},[wp.blocks.parse(fixtures[3].content)[0],wp.blocks.createBlock('core/columns',{},[wp.blocks.createBlock('core/column',{},[wp.blocks.parse(fixtures[4].content)[0]]),wp.blocks.createBlock('core/column',{},[wp.blocks.parse(fixtures[6].content)[0]])])]),wp.blocks.createBlock('core/block',{ref:reusable.id})];
        if(part)mixed.push(wp.blocks.createBlock('core/template-part',{slug:part.slug,theme:site.theme}));
        const layout=await create('/wp/v2/posts',{title:'Clock acceptance mixed layout',status:'publish',content:wp.blocks.serialize(mixed)});
        records.push({id:layout.id,role:'administrator',kind:'layout',url:layout._links.self[0].href,content:layout.content.raw,expected:inspect(layout.content.raw)});
        // Core 7 marks HTML content as a local editor attribute; parse stored markup instead.
        const raw=wp.blocks.serialize(wp.blocks.parse('<!-- wp:html -->\n'+fixtures[4].html+'\n<!-- /wp:html -->'));
        const html=await create('/wp/v2/posts',{title:'Clock acceptance custom HTML',status:'publish',author:site.users.author.id,content:raw});
        records.push({id:html.id,role:'author',kind:'html',url:html._links.self[0].href,content:html.content.raw,expected:inspect(html.content.raw)});
        const sidebars=await wp.apiFetch({path:'/wp/v2/sidebars?context=edit'});
        const active=sidebars.some(row=>row.id==='sidebar-1')?'sidebar-1':'sdcw-acceptance';
        const widgets=[];
        for(const sidebar of [active,'wp_inactive_widgets']){
          const input=fixtures.map(fixture=>fixture.content).join('\n\n');
          const widget=await create('/wp/v2/widgets',{id_base:'block',sidebar,instance:{raw:{content:input}}});
          widgets.push({id:widget.id,sidebar,content:widget.instance.raw.content,expected:inspect(widget.instance.raw.content)});
        }
        const text=await create('/wp/v2/widgets',{id_base:'text',sidebar:active,instance:{raw:{title:'Adjacent legacy text',text:'<p>Unrelated <strong>widget</strong> &amp; preserved</p>',filter:false,visual:false}}});
        // Reconcile fresh fixture placement after Core discovers newly created widget instances.
        const current=await wp.apiFetch({path:`/wp/v2/sidebars/${active}?context=edit&_sdcw=${Date.now()}`});
        await create(`/wp/v2/sidebars/${active}`,{widgets:[...new Set([...current.widgets,widgets[0].id,text.id])]});
        for(const item of [...widgets,{id:text.id,sidebar:active}]){
          const actual=await wp.apiFetch({path:`/wp/v2/widgets/${item.id}?context=edit&_sdcw=${Date.now()}`});
          if(actual.sidebar!==item.sidebar)throw new Error('Fresh fixture sidebar assignment failed: '+item.id);
        }
        return {records,widgets,textWidget:{id:text.id,sidebar:active,raw:text.instance.raw},classicWidgetFront:active==='sidebar-1',postId:records[0].id};
      }, { name, fixtures: fixtures.blocks, captions, site, roles });
      Object.assign(row,created);
      check('All fresh baseline records are valid',row.records.every(record=>record.expected.valid));
      for (const kind of ['native','layout','html']) {
        const record=row.records.find(record=>record.kind===kind);
        row.renders.push({kind,...await visitor(site,record.id)});
      }
      if(row.classicWidgetFront)row.renders.push({kind:'widget',...await visitor(site,row.postId,row.widgets[0].id)});
      for(const render of row.renders)check(`${render.kind}: baseline clock count`,render.clocks.length===({native:103,layout:site.block_theme?7:5,html:1,widget:7})[render.kind],render.clocks.length);
      await fs.writeFile(seedPath,JSON.stringify(row,null,2)+'\n',{flag:'wx'});
    } else if(mode==='baseline') {
      for(const item of seed.renders){
        const record=seed.records.find(record=>record.kind===item.kind);
        row.renders.push({kind:item.kind,...await visitor(site,record?.id||seed.postId,item.kind==='widget'?seed.widgets[0].id:null)});
      }
    } else {
      for(const role of roles){
        const mine=seed.records.filter(record=>record.role===role);
        const actorContext=role==='administrator'?context:await browser.newContext({timezoneId:'America/New_York'});
        try{
          const actor=role==='administrator'?page:await openEditor(actorContext,{...site,post_id:mine.find(record=>record.kind==='native').id},accounts[site.key][role]);
          const records=await actor.evaluate(async ({mine,mode,name,owner})=>{
            const me=await wp.apiFetch({path:'/wp/v2/users/me?context=edit'});if(me.id!==owner)throw new Error('Wrong fixture owner');
            const inspect=content=>{
              const blocks=wp.blocks.parse(content);const leaves=nodes=>nodes.flatMap(node=>[node,...leaves(node.innerBlocks||[])]);
              const template=document.createElement('template');template.innerHTML=content;
              return {valid:leaves(blocks).every(block=>block.isValid),attrs:leaves(blocks).filter(block=>block.name===name).map(block=>block.attributes),dom:[...template.content.querySelectorAll('timenow-zone-sdcw')].map(node=>Object.fromEntries([...node.attributes].map(attr=>[attr.name,attr.value])))};
            };
            const neighbors=content=>{
              // Core 7.2 sorts HTML attributes. Compare exact DOM/text for Custom HTML.
              const html=value=>{
                const template=document.createElement('template');template.innerHTML=value;
                const node=value=>value.nodeType===1?{name:value.tagName,attrs:[...value.attributes].map(a=>[a.name,a.value]).sort(([a],[b])=>a.localeCompare(b)),children:[...value.childNodes].map(node)}:{type:value.nodeType,text:value.nodeValue};
                return [...template.content.childNodes].map(node);
              };
              const walk=nodes=>nodes.flatMap(block=>{
                const custom=block.name==='core/html';
                const attrs={...block.attributes};if(custom&&typeof attrs.content==='string')attrs.content=html(attrs.content);
                return [...(block.name===name?[]:[{name:block.name,attrs,html:custom?html(block.originalContent):block.originalContent}]),...walk(block.innerBlocks||[])];
              });
              return walk(wp.blocks.parse(content));
            };
            const rows=[];
            for(const record of mine){
              const url=record.url+(record.url.includes('?')?'&':'?')+'context=edit';
              const before=await wp.apiFetch({url});
              if(mode==='save')await wp.apiFetch({url:record.url,method:'POST',data:{title:'Clock acceptance refreshed '+record.role+' '+record.kind}});
              const titled=await wp.apiFetch({url});
              if(mode==='save')await wp.apiFetch({url:record.url,method:'POST',data:{content:wp.blocks.serialize(wp.blocks.parse(titled.content.raw))}});
              const full=await wp.apiFetch({url});
              if(mode==='save')await wp.apiFetch({url:record.url,method:'POST',data:{content:full.content.raw}});
              const repeated=await wp.apiFetch({url});
              rows.push({id:record.id,kind:record.kind,role:record.role,before:before.content.raw,content:repeated.content.raw,title:inspect(titled.content.raw),full:inspect(full.content.raw),repeat:inspect(repeated.content.raw),stable:full.content.raw===repeated.content.raw,neighborsUnchanged:JSON.stringify(neighbors(record.content))===JSON.stringify(neighbors(repeated.content.raw))});
            }return rows;
          },{mine,mode,name,owner:site.users[role].id});
          for(const record of records){
            const expected=mine.find(input=>input.id===record.id);
            for(const step of ['title','full','repeat'])check(`${role}/${record.kind}/${step}: all stored settings and markup retained`,equal(record[step],expected.expected),{expected:expected.expected,actual:record[step]});
            check(`${role}/${record.kind}: repeated save stable`,record.stable);
            check(`${role}/${record.kind}: unrelated blocks, text, HTML and layout retained`,record.neighborsUnchanged);
            if(mode==='check')check(`${role}/${record.kind}: read leaves bytes unchanged`,record.content===record.before);
            row.records.push(record);
          }
          const native=mine.find(record=>record.kind==='native');
          if(native){
            await actor.goto(`${site.url}/wp-admin/post.php?post=${native.id}&action=edit`,{waitUntil:'domcontentloaded'});
            await actor.waitForFunction(id=>wp.data.select('core/editor').getCurrentPostId()===id&&wp.data.select('core/block-editor').getBlocks().length>0,native.id);
            const editor=await actor.evaluate(()=>({valid:wp.data.select('core/block-editor').getBlocks().every(block=>block.isValid),dirty:wp.data.select('core/editor').isEditedPostDirty()}));
            check(`${role}: actual editor opens old post valid and clean`,editor.valid&&!editor.dirty,editor);
          }
        }finally{if(actorContext!==context)await actorContext.close();}
      }
      const widgetActor=site.multisite?'siteadmin':'administrator';
      const widgetContext=widgetActor==='administrator'?context:await browser.newContext({timezoneId:'UTC'});
      try{
        const widgetPage=widgetActor==='administrator'?page:await openEditor(widgetContext,{...site,post_id:seed.records.find(record=>record.role===widgetActor).id},accounts[site.key][widgetActor]);
        row.widgets=await widgetPage.evaluate(async({widgets,textWidget,mode,name})=>{
          const inspect=content=>{const blocks=wp.blocks.parse(content);const template=document.createElement('template');template.innerHTML=content;return {valid:blocks.every(block=>block.isValid),attrs:blocks.map(block=>block.attributes),dom:[...template.content.querySelectorAll('timenow-zone-sdcw')].map(node=>Object.fromEntries([...node.attributes].map(attr=>[attr.name,attr.value])))};};
          const rows=[];
          for(const widget of widgets){
            const current=await wp.apiFetch({path:`/wp/v2/widgets/${widget.id}?context=edit`});
            if(mode==='save'){
              await wp.apiFetch({path:`/wp/v2/widgets/${widget.id}`,method:'POST',data:{instance:{raw:{content:wp.blocks.serialize(wp.blocks.parse(current.instance.raw.content))}}}});
              const full=await wp.apiFetch({path:`/wp/v2/widgets/${widget.id}?context=edit`});
              await wp.apiFetch({path:`/wp/v2/widgets/${widget.id}`,method:'POST',data:{instance:{raw:full.instance.raw}}});
            }
            const after=await wp.apiFetch({path:`/wp/v2/widgets/${widget.id}?context=edit`});
            rows.push({id:widget.id,sidebar:after.sidebar,content:after.instance.raw.content,actual:inspect(after.instance.raw.content)});
          }
          if(mode==='save')await wp.apiFetch({path:`/wp/v2/widgets/${textWidget.id}`,method:'POST',data:{instance:{raw:textWidget.raw}}});
          const text=await wp.apiFetch({path:`/wp/v2/widgets/${textWidget.id}?context=edit`});
          rows.push({id:textWidget.id,sidebar:text.sidebar,raw:text.instance.raw,text:true});return rows;
        },{widgets:seed.widgets,textWidget:seed.textWidget,mode,name});
        for(const record of row.widgets){
          const expected=record.text?seed.textWidget:seed.widgets.find(widget=>widget.id===record.id);
          check(`${record.id}: sidebar retained`,record.sidebar===expected.sidebar,record.sidebar);
          check(`${record.id}: widget settings and markup retained`,record.text?equal(record.raw,expected.raw):equal(record.actual,expected.expected),record.actual);
        }
      }finally{if(widgetContext!==context)await widgetContext.close();}
      for(const before of seed.renders){
        const record=seed.records.find(record=>record.kind===before.kind);
        const after=await visitor(site,record?.id||seed.postId,before.kind==='widget'?seed.widgets[0].id:null);
        const expectedPath=path.resolve('.local/wordpress-lab',reference,`visual-baseline-${site.key}-${engine}.json`);
        const baseline=JSON.parse(await fs.readFile(expectedPath,'utf8')).find(record=>record.kind===before.kind);
        check(`${before.kind}: visitor HTTP 200`,after.status===200);
        const comparison=compareClockRenders(baseline.clocks,after.clocks);
        check(`${before.kind}: every clock's DOM, displayed time, dimensions and styles unchanged`,comparison.equal,{comparison,before:baseline.clocks,after:after.clocks});
        row.renders.push({kind:before.kind,comparison,...after});
      }
    }
    if(['seed','baseline'].includes(mode))await fs.writeFile(path.join(directory,`visual-baseline-${site.key}-${engine}.json`),JSON.stringify(row.renders,null,2)+'\n',{flag:'wx'});
  }catch(error){row.error=error.stack;check('Acceptance scenario completes',false,error.stack);}
  finally{await context.close();row.failed=row.checks.filter(check=>!check.passed).length;await fs.writeFile(target,JSON.stringify(row,null,2)+'\n');}
  return row;
}

try{
  for(const [i,site] of sites.entries()){
    const row=await runSite(site);results.push(row);
    const elapsed=(Date.now()-started)/1000;const rate=(i+1)/elapsed;
    console.log(`[${i+1}/${sites.length}] ${Math.round(100*(i+1)/sites.length)}% ${stage}/${engine}/${site.key}: failed=${row.failed}; elapsed=${elapsed.toFixed(1)}s; ETA=${((sites.length-i-1)/rate).toFixed(1)}s`);
  }
}finally{await browser.close();}
if(results.some(row=>row.failed))process.exitCode=1;
