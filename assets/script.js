(()=>{
const d=document,root=d.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* live open/closed: America/Chicago, Mon–Fri 8 AM–6 PM. Google flags Thanksgiving + Black Friday as "hours might differ". */
const HOLI={'2026-11-26':'Thanksgiving','2026-11-27':'Black Friday'};
function ctNow(t=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(t);const o={};p.forEach(x=>o[x.type]=x.value);
 return{day:DN.indexOf(o.weekday),min:(+o.hour%24)*60+(+o.minute),date:`${o.year}-${o.month}-${o.day}`}}
const isWork=n=>n.day>=1&&n.day<=5;
function status(){const n=ctNow();const open=isWork(n)&&n.min>=480&&n.min<1080;let t;
 if(open)t='Open now · until 6 PM CT';
 else if(isWork(n)&&n.min<480)t='Closed · opens 8 AM CT';
 else{let k=1,nx;for(;k<8;k++){nx=ctNow(new Date(Date.now()+k*864e5));if(isWork(nx))break}
  t='Closed · opens '+(k===1?'tomorrow':DN[nx.day])+' 8 AM CT'}
 if(HOLI[n.date])t+=' · '+HOLI[n.date]+' hours may differ';
 $$('[data-status]').forEach(el=>{el.classList.toggle('open',open);el.classList.toggle('closed',!open);const s=$('span',el);if(s)s.textContent=t});
 $$('.hours tr').forEach(tr=>tr.classList.toggle('today',+tr.dataset.d===n.day))}
status();setInterval(status,60000);

/* header, tape-measure progress, mobile bar */
const hdr=$('.hdr'),tape=$('.tape i'),mbar=$('.mbar');
function onScroll(){const y=scrollY,h=root.scrollHeight-innerHeight;hdr&&hdr.classList.toggle('scrolled',y>30);if(tape)tape.style.transform=`scaleX(${h>0?Math.min(1,y/h):0})`;if(mbar)mbar.classList.toggle('show',y>260)}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* mobile nav */
const bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){const set=o=>{bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');mn.classList.toggle('open',o);mn.setAttribute('aria-hidden',!o);mn.inert=!o;d.body.style.overflow=o?'hidden':''};
 mn.inert=true;
 bg.addEventListener('click',()=>set(bg.getAttribute('aria-expanded')!=='true'));
 $$('a',mn).forEach(a=>a.addEventListener('click',()=>set(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open')){set(false);bg.focus()}})}

/* split headings into characters */
$$('.split-h').forEach(h=>{if(RM)return;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(d.createTextNode(w));return}const ws=d.createElement('span');ws.style.whiteSpace='nowrap';ws.style.display='inline-block';[...w].forEach(ch=>{const s=d.createElement('span');s.className='ch1';s.textContent=ch;ws.appendChild(s)});f.appendChild(ws)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};
 h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());walk(h);$$('span,em',h).forEach(s=>s.setAttribute('aria-hidden','true'));$$('.ch1',h).forEach((c,i)=>c.style.transitionDelay=(i*20)+'ms')});

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
$$('[data-r],.stagger,.split-h').forEach(el=>{if(RM)el.classList.add('in');else io.observe(el)});
$$('.stagger').forEach(g=>[...g.children].forEach((c,i)=>c.style.transitionDelay=(i*80)+'ms'));
const ph=$('.phero');if(ph)requestAnimationFrame(()=>ph.classList.add('go'));

/* blueprint ⇄ photo slider (hero) */
const bp=$('[data-bp]');let bpSweep=()=>{};
if(bp){const h=$('.bp-h',bp);let x=RM?50:100,drag=false;
 const set=v=>{x=Math.max(0,Math.min(100,v));bp.style.setProperty('--x',x+'%');h.setAttribute('aria-valuenow',Math.round(x));h.setAttribute('aria-valuetext',Math.round(x)+'% line drawing')};
 set(x);
 const fromE=e=>{const r=bp.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)};
 bp.addEventListener('pointerdown',e=>{if(e.target.closest('.pin'))return;drag=true;bp.setPointerCapture(e.pointerId);fromE(e)});
 bp.addEventListener('pointermove',e=>{if(drag)fromE(e)});
 bp.addEventListener('pointerup',()=>drag=false);bp.addEventListener('pointercancel',()=>drag=false);
 h.addEventListener('keydown',e=>{const k={ArrowLeft:-5,ArrowRight:5,ArrowDown:-5,ArrowUp:5,Home:-100,End:100}[e.key];if(k!==undefined){e.preventDefault();set(x+k)}});
 bpSweep=()=>{if(RM)return;const t0=performance.now(),D=2200,from=100,to=42;(function f(t){if(drag)return;const k=Math.min(1,(t-t0)/D),q=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;set(from+(to-from)*q);if(k<1)requestAnimationFrame(f)})(t0)}}

/* cabinet-door intro (home only, once per session) */
const hero=$('.hero'),doors=$('.doors');
function goHero(){hero&&hero.classList.add('go');setTimeout(bpSweep,500)}
if(doors){let seen=false;try{seen=sessionStorage.getItem('ht-doors')==='1';sessionStorage.setItem('ht-doors','1')}catch(e){}
 if(RM||seen){doors.classList.add('gone');goHero()}
 else{setTimeout(()=>doors.classList.add('open'),550);setTimeout(goHero,900);setTimeout(()=>doors.classList.add('gone'),1900)}}
else goHero();

/* parallax */
const px=$$('[data-px]');
if(!RM&&px.length){const tick=()=>{px.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;const f=+el.dataset.px;const c=r.top+r.height/2-innerHeight/2;el.style.transform=`translate3d(0,${(c*-f).toFixed(1)}px,0)`})};
 addEventListener('scroll',()=>requestAnimationFrame(tick),{passive:true});addEventListener('resize',tick);tick()}

/* counters */
function runCount(el){const end=+el.dataset.count,dec=+(el.dataset.dec||0),out=$('b',el)||el;
 if(RM){out.textContent=end.toFixed(dec);return}
 const t0=performance.now(),D=1800;(function f(t){const k=Math.min(1,(t-t0)/D),q=1-Math.pow(1-k,4);out.textContent=(end*q).toFixed(dec);if(k<1)requestAnimationFrame(f);else out.textContent=end.toFixed(dec)})(t0)}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target)}}),{threshold:.3});
$$('[data-count]').forEach(el=>cio.observe(el));

/* tilt cards */
if(FINE&&!RM)$$('.door-card').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty('--ry',(x*10).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*10).toFixed(2)+'deg')});c.addEventListener('pointerleave',()=>{c.style.setProperty('--ry','0deg');c.style.setProperty('--rx','0deg')})});

/* magnetic buttons */
if(FINE&&!RM)$$('.btn.mag').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${(x*.2).toFixed(1)}px,${(y*.3).toFixed(1)}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* tape-measure timeline: tape pulls out as you scroll */
$$('.tl').forEach(tl=>{const tp=$('.tape-line i',tl),steps=$$('.step',tl);
 function upd(){const r=tl.getBoundingClientRect(),H=r.height;const k=RM?1:Math.min(1,Math.max(0,(innerHeight*.62-r.top)/H));tp.style.setProperty('--h',(k*100).toFixed(2)+'%');
  steps.forEach(s=>{const sr=s.getBoundingClientRect();if(RM||sr.top+sr.height*.3<innerHeight*.62)s.classList.add('lit')})}
 addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);upd()});

/* reviews carousel */
$$('.car').forEach(c=>{const tr=$('.car-track',c),sl=$$('.slide',c),dots=$('.dots',c);let i=0,tm;
 sl.forEach((s,k)=>{const b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show review '+(k+1));b.onclick=()=>go(k,1);dots.appendChild(b)});
 function go(k,user){i=(k+sl.length)%sl.length;tr.style.transform=`translateX(${-100*i}%)`;$$('button',dots).forEach((b,j)=>b.setAttribute('aria-current',j===i));sl.forEach((s,j)=>{s.setAttribute('aria-hidden',j!==i);s.inert=j!==i});if(user)auto()}
 function auto(){clearInterval(tm);if(!RM)tm=setInterval(()=>go(i+1),7000)}
 $('.car-p',c).onclick=()=>go(i-1,1);$('.car-n',c).onclick=()=>go(i+1,1);
 c.addEventListener('mouseenter',()=>clearInterval(tm));c.addEventListener('mouseleave',auto);c.addEventListener('focusin',()=>clearInterval(tm));c.addEventListener('focusout',auto);
 let sx=null;tr.addEventListener('pointerdown',e=>sx=e.clientX);addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1),1)});
 go(0);auto()});

/* draggable strip */
$$('.gal-track').forEach(t=>{let down=false,sx=0,sl=0,moved=0,v=0,lx=0,raf;
 t.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=0;sx=lx=e.clientX;sl=t.scrollLeft;cancelAnimationFrame(raf)});
 addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>6)t.classList.add('drag');v=e.clientX-lx;lx=e.clientX;t.scrollLeft=sl-dx});
 addEventListener('pointerup',()=>{if(!down)return;down=false;setTimeout(()=>t.classList.remove('drag'),0);if(!RM&&moved>6){(function m(){v*=.92;t.scrollLeft-=v;if(Math.abs(v)>.5)raf=requestAnimationFrame(m)})()}});
 t.addEventListener('click',e=>{if(moved>6){e.preventDefault();e.stopPropagation();moved=0}},true)});

/* filter chips */
const chipsF=$$('.chip-f');
chipsF.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;chipsF.forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.mason .gal-item').forEach(it=>it.classList.toggle('hide',f!=='all'&&it.dataset.cat!==f))}));

/* lightbox: cycles through the visible photos */
const lb=$('.lbx');
if(lb){const im=$('img',lb),cap=$('figcaption',lb),cnt=$('.lbx-c',lb),btns=$$('button',lb);let list=[],k=0,last=null;
 const vis=it=>[...it.parentElement.children].filter(i=>i.classList.contains('gal-item')&&!i.classList.contains('hide'));
 function show(n){k=(n+list.length)%list.length;const it=list[k],ti=$('img',it);im.src=it.dataset.full;im.alt=ti.alt;cap.textContent=ti.alt;cnt.textContent=(k+1)+' / '+list.length}
 $$('.gal-item').forEach(it=>it.addEventListener('click',()=>{list=vis(it);last=it;show(list.indexOf(it));lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';$('.lbx-x',lb).focus()}));
 const close=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';last&&last.focus()};
 $('.lbx-x',lb).onclick=close;$('.lbx-p',lb).onclick=()=>show(k-1);$('.lbx-n',lb).onclick=()=>show(k+1);
 lb.addEventListener('click',e=>{if(e.target===lb)close()});
 let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)show(k+(dx<0?1:-1))});
 addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1);
  if(e.key==='Tab'){const i=btns.indexOf(d.activeElement);e.preventDefault();btns[(i+(e.shiftKey?-1:1)+btns.length)%btns.length].focus()}})}

/* plan-your-call notes (nothing is sent anywhere) */
const pf=$('.planner');
if(pf){const out=$('.out',pf),pre=$('pre',out),cp=$('.copy',pf);
 pf.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(pf);const ty=fd.getAll('type');const lines=[];
  lines.push('Project: '+(ty.length?ty.join(', '):'Not sure yet'));if(fd.get('room'))lines.push('Room / size: '+fd.get('room'));lines.push('Timing: '+(fd.get('when')||'Not sure yet'));if(fd.get('notes'))lines.push('Notes: '+fd.get('notes'));
  pre.textContent=lines.join('\n');out.hidden=false;cp.hidden=false});
 cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent);$('.lbl',cp).textContent='Copied'}catch(e){$('.lbl',cp).textContent='Select & copy'}})}

/* demo pill */
const dm=$('.demo');if(dm){try{if(sessionStorage.getItem('ht-demo')==='x')dm.remove()}catch(e){};const x=$('button',dm);x&&x.addEventListener('click',()=>{dm.remove();try{sessionStorage.setItem('ht-demo','x')}catch(e){}})}
})();
