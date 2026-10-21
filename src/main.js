import './tokens.css';
import './style.css';
import { articles } from './articles.js';
import { startWorld } from './world.js';

const paths={arrow:'M7 17 17 7M7 7h10v10',right:'M5 12h14m-6-6 6 6-6 6',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',spark:'m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',pause:'M9 5v14M15 5v14',play:'m8 4 12 8-12 8Z',close:'m6 6 12 12M6 18 18 6',book:'M5 4h14v17l-7-4-7 4Z',check:'m5 12 4 4L19 6',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',volume:'m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',muted:'m11 5-6 4H2v6h3l6 4Zm5 4 5 6m0-6-5 6',flip:'M4 10a8 8 0 0 1 14-5l3 3m0-6v6h-6M20 14A8 8 0 0 1 6 19l-3-3m0 6v-6h6',menu:'M4 7h16M4 12h16M4 17h16'};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.spark}"/></svg>`;
const orbitLogo=`<svg viewBox="0 0 42 42" fill="none" aria-hidden="true"><circle cx="21" cy="21" r="11" stroke="currentColor" stroke-width="1.7"/><ellipse cx="21" cy="21" rx="20" ry="8" transform="rotate(-35 21 21)" stroke="currentColor" stroke-width="1.7"/><circle cx="34" cy="10" r="3" fill="currentColor"/></svg>`;
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let saved=new Set(readStore('offbeat-saved',[]));
let filter='全部文章',showAll=false,query='';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let motion=readStore('offbeat-motion',!reduced.matches),sound=false;
document.body.classList.toggle('still',!motion);
document.querySelector('#app').innerHTML=`
  <div class="ambient" aria-hidden="true"><span></span><span></span></div>
  <div class="reading-progress" id="reading-progress"></div>
  <header class="site-header shell">
    <a class="brand" href="#" aria-label="OFFBEAT 首页">${orbitLogo}<span>OFFBEAT<span class="brand-dot">.</span></span></a>
    <nav class="main-nav" aria-label="主导航"><a href="#" class="active">首页</a><a href="#journal">文章<span class="tiny-dot"></span></a><a href="#playground">游乐场</a><button data-open="about">关于我 ${icon('arrow')}</button></nav>
    <div class="header-actions"><button class="icon-button" id="search-open" aria-label="搜索文章">${icon('search')}</button><span class="divider"></span><button class="icon-button" id="motion-toggle" aria-label="${motion?'暂停动效':'开启动效'}" title="${motion?'暂停动效':'开启动效'}" aria-pressed="${motion}">${icon(motion?'pause':'play')}</button><button class="icon-button sound-toggle" aria-label="开启环境音" title="开启环境音" aria-pressed="false">${icon('muted')}</button></div>
  </header>

  <main>
    <section class="hero shell" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="eyebrow"><span class="live-dot"></span> A SMALL CORNER OF THE INTERNET <span class="eyebrow-rule"></span></div>
        <h1 id="hero-title">不循常规<span class="title-period">.</span><br><span class="serif-title">保持<span class="italic-word">好奇</span>。</span></h1>
        <p class="hero-subtitle">写代码，也写生活。<br>把脑海里的奇思妙想，变成这个世界的一小部分。</p>
        <div class="hero-cta"><a class="primary-button" href="#journal">探索我的宇宙 ${icon('arrow')}</a><button class="text-button" data-open="about">认识一下 ${icon('right')}</button></div>
        <div class="hero-note"><span class="note-cross">✳</span><span>灵感在漂浮，好奇心永不下线。</span><span class="note-handwriting">stay curious</span></div>
      </div>
      <div class="hero-art" id="hero-art" role="img" aria-label="实时旋转的珠光流体雕塑，环绕着星轨与光点">
        <div class="art-grid"></div>
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div class="orbit-caption"><span class="live-dot"></span> LIVE IN MY OWN ORBIT</div>
        <div class="glass-note glass-note-top"><span class="small-star">✧</span><div>把想象力放出来<small>Ideas have no gravity.</small></div></div>
        <div class="glass-note glass-note-bottom">${icon('code')}<span>code. create. repeat.</span></div>
        <div class="art-coordinate">EST. 2026 <span>↗</span> ALWAYS EXPLORING</div>
        <span class="art-star star-one">✦</span><span class="art-star star-two">✧</span>
      </div>
      <div class="hero-bottom"><a href="#journal" class="scroll-hint"><span class="mouse-shape"></span> 向下滚动，发现更多</a><div class="hero-topics"><span>CREATIVE CODING</span><b>✳</b><span>DESIGN</span><b>✳</b><span>LITTLE THINGS</span></div><span class="edition">VOL. 01 / 2026</span></div>
    </section>

    <section class="journal shell" id="journal" aria-labelledby="journal-title">
      <div class="section-heading"><div><div class="section-kicker">THE JOURNAL <span>01 —</span></div><h2 id="journal-title">最近在想<span class="heading-star">✳</span></h2></div><p>一些思考，一些实验。<br>还有一些，生活留下的痕迹。</p><button class="text-button all-posts">全部文章 ${icon('arrow')}</button></div>
      <div class="filter-row"><div class="filter-tabs" role="group" aria-label="文章分类">${['全部文章','代码实验','设计灵感','生活碎片','我的收藏'].map((x,i)=>`<button class="filter ${i===0?'selected':''}" data-filter="${x}" aria-pressed="${i===0}">${x}${i===0?'<span>06</span>':''}</button>`).join('')}</div><span class="tilt-hint">${icon('flip')} 悬停，让灵感转个身</span></div>
      <div class="article-grid" id="article-grid"></div>
      <div class="journal-bottom"><span id="article-count"></span><button class="text-button" id="load-more">再看一些 ${icon('right')}</button></div>
    </section>

    <section class="playground shell" id="playground">
      <div class="playground-card"><div class="playground-label">${icon('spark')} THE PLAYGROUND</div><h2>认真生活，<br><span>也认真玩。</span></h2><p>这里存放着那些「要不试试看」的念头。<br>给宇宙换一种颜色，或者陪小柯基踢一会儿球。</p><button class="primary-button secondary" id="remix">给宇宙换个心情 ${icon('spark')}</button><div class="playground-orbit" aria-hidden="true"><div></div><div></div><div></div><span>PLAY<br><i>is a way of learning.</i></span></div><span class="lab-caption">NO RULES. JUST CURIOSITY. ↗</span></div>
    </section>
    <section class="closing shell"><span class="closing-spark">✳</span><p>世界很大，<span>很高兴在这里遇见你。</span></p><button class="text-button" data-open="about">保持好奇，保持联系 ${icon('arrow')}</button></section>
  </main>

  <footer class="site-footer shell"><a class="brand" href="#">${orbitLogo}<span>OFFBEAT<span class="brand-dot">.</span></span></a><span>© 2026 OFFBEAT · 用好奇心搭建的小小宇宙</span><a href="#" class="text-button">回到星球顶部 ↑</a></footer>

  <aside class="pet" id="pet" aria-label="柯基看板娘麻薯"><div class="pet-bubble" id="pet-bubble" role="status">嗨！我叫麻薯，陪我踢球吗？<span>点击小球，传给我！</span></div><button id="pet-action" class="pet-stage" aria-label="和柯基麻薯踢球"><canvas id="pet-canvas" aria-hidden="true"></canvas><span class="pet-fallback" hidden>麻薯正在等你，点我一起玩！</span></button><div class="pet-name"><span class="live-dot"></span> 麻薯 <span>· 首席快乐官</span><button id="pet-minimize" aria-label="收起柯基">−</button></div></aside>
  <button class="pet-restore" id="pet-restore" aria-label="展开柯基麻薯" hidden>${icon('heart')} 麻薯</button>
  <div class="toast" id="toast" role="status"></div>

  <dialog id="search-dialog" class="search-dialog"><form method="dialog" class="search-top"><label for="search-input">${icon('search')}</label><input type="search" id="search-input" placeholder="搜一个灵感、一段生活……" autocomplete="off" aria-label="搜索文章"/><button class="icon-button" aria-label="关闭搜索">${icon('close')}</button></form><div id="search-results" class="search-results"></div><div class="search-footer"><span>在这个小宇宙里找找看</span><kbd>ESC 关闭</kbd></div></dialog>
  <dialog id="reader-dialog" class="reader-dialog"><button class="icon-button dialog-close" aria-label="关闭文章">${icon('close')}</button><div id="reader-content"></div></dialog>
  <dialog id="about-dialog" class="about-dialog"><button class="icon-button dialog-close" aria-label="关闭介绍">${icon('close')}</button><div class="section-kicker">THE PERSON BEHIND THE PIXELS</div><span class="about-symbol">✳</span><h2>你好，<br>欢迎来到我的<span>小宇宙。</span></h2><p>这是一个留给好奇心的地方。写下关于代码、设计和生活的想法，也收集那些暂时没有答案的问题。</p><p>旁边那只一直在玩球的柯基叫麻薯。它负责提醒我们：写得累了，记得起来玩一会儿。</p><div class="about-tags"><span>创造一点东西</span><span>观察日常</span><span>永远好奇</span></div><div class="demo-note">这是一套可自定义的个人博客。当前文章为原创示例内容；你可以在源码中替换为自己的介绍与文章。</div><button class="primary-button" id="about-read">从一篇文章开始 ${icon('right')}</button></dialog>
`;

const grid=document.querySelector('#article-grid');
let world;
function card(a,i){return `<article class="article-card ${i===0?'featured':''}" data-id="${a.id}" style="--entry-delay:${i*.08}s"><div class="card-rotator"><div class="card-front"><button class="article-art art-${a.art}" data-read="${a.id}" aria-label="阅读：${a.title}"><canvas data-art="${a.art}" aria-hidden="true"></canvas><span class="art-index">FIELD NOTES / 0${articles.indexOf(a)+1}</span><span class="art-word">${a.art==='ribbon'?'FLOW':a.art==='glass'?'less, but better.':'slow down.'}</span><span class="art-label">${a.art==='ribbon'?'EXPERIMENT IN LIGHT':a.art==='glass'?'SPACE TO BREATHE':'A MOMENT, OFFLINE'}</span><span class="art-open">${icon('arrow')}</span></button><div class="card-content"><div class="card-meta"><span class="category-dot ${a.color}"></span><span>${a.category}</span><span class="card-date">${a.date}</span></div><button class="card-title" data-read="${a.id}"><h3>${a.title}</h3></button><p>${a.subtitle}</p><div class="card-bottom"><span>${icon('clock')} ${a.minutes} 分钟阅读</span><div><button class="icon-button flip-button" data-flip="${a.id}" aria-label="翻转卡片查看 ${a.title} 摘要" title="翻转卡片">${icon('flip')}</button><button class="icon-button save-button ${saved.has(a.id)?'is-saved':''}" data-save="${a.id}" aria-label="${saved.has(a.id)?'取消收藏':'收藏'}：${a.title}" aria-pressed="${saved.has(a.id)}">${icon('book')}</button></div></div></div></div><div class="card-back" inert><div class="section-kicker">BEHIND THE NOTE</div><span class="back-spark">✳</span><h3>${a.title}</h3><p>${a.body[0][1]}</p><button class="primary-button" data-read="${a.id}">开始阅读 ${icon('arrow')}</button><button class="text-button" data-flip="${a.id}">${icon('flip')} 回到封面</button></div></div></article>`}
function renderArticles(){
 world?.clearThumbnails();
 let list=articles.filter(a=>filter==='全部文章'||(filter==='我的收藏'?saved.has(a.id):a.category===filter));
 const count=list.length;if(!showAll&&filter==='全部文章')list=list.slice(0,3);
 grid.innerHTML=list.length?list.map(card).join(''):`<div class="empty-state">${icon('book')}<h3>这里还空着，等一个喜欢。</h3><p>点击文章上的书签，把灵感留在这里。</p><button class="text-button" id="back-all">去发现文章 ${icon('right')}</button></div>`;
 document.querySelector('#article-count').textContent=`${String(list.length).padStart(2,'0')} / ${String(count).padStart(2,'0')} 篇灵感手记`;
 document.querySelector('#load-more').hidden=filter!=='全部文章'||showAll;
 document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('selected',b.dataset.filter===filter);b.setAttribute('aria-pressed',b.dataset.filter===filter)});
 bindTilt();world?.addThumbnails();
}
function bindTilt(){
 grid.querySelectorAll('.article-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(!motion||e.pointerType==='touch'||card.classList.contains('flipped'))return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--rx',`${(0.5-y)*8}deg`);card.style.setProperty('--ry',`${(x-.5)*10}deg`);card.style.setProperty('--shine-x',`${x*100}%`);card.style.setProperty('--shine-y',`${y*100}%`)});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')});
 });
}
renderArticles();
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2800)}
function toggleSave(id){saved.has(id)?saved.delete(id):saved.add(id);writeStore('offbeat-saved',[...saved]);toast(saved.has(id)?'已把这份灵感收进书签。':'已取消收藏。');document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>{b.classList.toggle('is-saved',saved.has(id));b.setAttribute('aria-pressed',saved.has(id));b.setAttribute('aria-label',`${saved.has(id)?'取消收藏':'收藏'}：${articles.find(a=>a.id===id).title}`)});if(filter==='我的收藏')renderArticles()}
function openDialog(id){const d=document.querySelector(`#${id}-dialog`);if(!d.open){d.showModal();document.body.classList.add('dialog-open')}}
function openArticle(id){const a=articles.find(a=>a.id===id);if(!a)return;document.querySelector('#search-dialog').close();document.querySelector('#reader-content').innerHTML=`<div class="section-kicker">${a.tag}</div><h2>${a.title}</h2><div class="reader-meta"><span>${a.category}</span><span>${a.date}</span><span>${a.minutes} 分钟阅读</span><button class="icon-button save-button ${saved.has(id)?'is-saved':''}" data-save="${id}" aria-label="收藏：${a.title}" aria-pressed="${saved.has(id)}">${icon('book')}</button></div><p class="reader-lead">${a.subtitle}</p><div class="reader-body">${a.body.map(([h,p])=>`<h3>${h}</h3><p>${p}</p>`).join('')}</div><div class="reader-end">✳ <span>谢谢你读到这里。愿好奇心与你同在。</span></div><div class="demo-note">原创示例文章 · 可在 src/articles.js 中替换为你的内容</div><button class="text-button next-article" data-read="${articles[(articles.indexOf(a)+1)%articles.length].id}">下一篇 · ${articles[(articles.indexOf(a)+1)%articles.length].title} ${icon('arrow')}</button>`;openDialog('reader');document.querySelector('#reader-dialog').scrollTop=0}
document.addEventListener('click',e=>{
 const read=e.target.closest('[data-read]');if(read)openArticle(read.dataset.read);
 const save=e.target.closest('[data-save]');if(save)toggleSave(save.dataset.save);
 const flip=e.target.closest('[data-flip]');if(flip){const c=flip.closest('.article-card');const isFlipped=c.classList.toggle('flipped');c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');c.querySelector('.card-front').inert=isFlipped;c.querySelector('.card-back').inert=!isFlipped;c.querySelector(isFlipped?'.card-back [data-flip]':'.card-front [data-flip]').focus({preventScroll:true})}
 const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;showAll=true;renderArticles()}
 if(e.target.closest('.all-posts')||e.target.closest('#load-more')||e.target.closest('#back-all')){filter='全部文章';showAll=true;renderArticles();if(e.target.closest('.all-posts'))document.querySelector('#journal').scrollIntoView({behavior:motion?'smooth':'instant'})}
 const op=e.target.closest('[data-open]');if(op)openDialog(op.dataset.open);
 if(e.target.closest('.dialog-close'))e.target.closest('dialog').close();
});
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open')})});
document.querySelector('#about-read').addEventListener('click',()=>{document.querySelector('#about-dialog').close();openArticle('light')});
function renderSearch(){const list=articles.filter(a=>`${a.title}${a.subtitle}${a.category}${a.body.flat().join('')}`.toLowerCase().includes(query.toLowerCase()));document.querySelector('#search-results').innerHTML=`<div class="search-label">${query?`找到 ${list.length} 篇文章`:'从这些灵感开始'}</div>${list.length?list.map(a=>`<button class="search-result" data-read="${a.id}"><span><small>${a.category}</small><strong>${a.title}</strong></span>${icon('arrow')}</button>`).join(''):'<div class="search-empty">这片宇宙里暂时没有找到。试试「设计」或「生活」？</div>'}`}
document.querySelector('#search-open').addEventListener('click',()=>{query='';document.querySelector('#search-input').value='';renderSearch();openDialog('search');document.querySelector('#search-input').focus()});
document.querySelector('#search-input').addEventListener('input',e=>{query=e.target.value.trim();renderSearch()});
document.querySelector('.search-top').addEventListener('submit',e=>{if(e.submitter?.tagName!=='BUTTON'){e.preventDefault();const first=document.querySelector('.search-result');if(first)first.click()}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.querySelector('#search-open').click()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const dialog=document.querySelector('dialog[open]');if(dialog){e.preventDefault();dialog.close()}}},true);
function updateMotion(value){motion=value;writeStore('offbeat-motion',motion);document.body.classList.toggle('still',!motion);const b=document.querySelector('#motion-toggle');b.innerHTML=icon(motion?'pause':'play');b.setAttribute('aria-pressed',motion);b.setAttribute('aria-label',motion?'暂停动效':'开启动效');b.title=motion?'暂停动效':'开启动效';world?.setMotion(motion)}
document.querySelector('#motion-toggle').addEventListener('click',()=>{updateMotion(!motion);toast(motion?'宇宙继续慢慢转动。':'动效已暂停，安心读一会儿。')});
reduced.addEventListener('change',e=>{if(e.matches)updateMotion(false)});
let audioContext,audioGain;
document.querySelector('.sound-toggle').addEventListener('click',async()=>{
 try{if(!audioContext){audioContext=new AudioContext();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);[130.81,196,261.63,329.63].forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=.025/(i+1);o.connect(g).connect(audioGain);o.start()})}await audioContext.resume();sound=!sound;audioGain.gain.setTargetAtTime(sound?.5:0,audioContext.currentTime,.8);const b=document.querySelector('.sound-toggle');b.innerHTML=icon(sound?'volume':'muted');b.setAttribute('aria-pressed',sound);b.setAttribute('aria-label',sound?'关闭环境音':'开启环境音');b.title=sound?'关闭环境音':'开启环境音';toast(sound?'环境音已开启 · 一点点宇宙的声音':'环境音已关闭')}catch{toast('当前浏览器暂不支持环境音。')}
});
document.addEventListener('visibilitychange',()=>{if(audioContext){if(document.hidden)audioContext.suspend();else if(sound)audioContext.resume()}});
let petCount=0,petTimer;
document.querySelector('#pet-action').addEventListener('click',()=>{petCount++;world?.kick();const lines=['接住啦！再来一脚！','汪！这球传得漂亮！','短腿也有足球梦！','球可以停，好奇心不可以！'];const bubble=document.querySelector('#pet-bubble');bubble.innerHTML=`${lines[(petCount-1)%lines.length]}<span>我们已经传了 ${petCount} 次球</span>`;bubble.classList.add('talking');clearTimeout(petTimer);petTimer=setTimeout(()=>bubble.classList.remove('talking'),4000)});
document.querySelector('#pet-minimize').addEventListener('click',()=>{document.querySelector('#pet').hidden=true;document.querySelector('#pet-restore').hidden=false});
document.querySelector('#pet-restore').addEventListener('click',()=>{document.querySelector('#pet').hidden=false;document.querySelector('#pet-restore').hidden=true});
let mood=0;document.querySelector('#remix').addEventListener('click',()=>{mood=(mood+1)%3;document.body.dataset.mood=String(mood);world?.setMood(mood);toast(['此刻的宇宙：玫瑰星云','此刻的宇宙：薄荷漫游','此刻的宇宙：落日来信'][mood]);document.querySelector('.hero').scrollIntoView({behavior:motion?'smooth':'instant'})});
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('#reading-progress').style.width=`${max>0?scrollY/max*100:0}%`},{passive:true});
const navObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const href=entry.target.id?`#${entry.target.id}`:'#';document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===href))}}},{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('.hero,#journal,#playground').forEach(el=>navObserver.observe(el));
try{world=startWorld({motion});}catch(error){console.warn('3D enhancement unavailable:',error);document.body.classList.add('no-webgl');document.querySelector('.pet-fallback').hidden=false;document.querySelector('#hero-art').setAttribute('aria-label','珠光星球插画（当前设备使用静态模式）')}
