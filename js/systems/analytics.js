/* Basic consent mode: no Google request before opt-in; no game state in analytics. */
(function(){
 'use strict';
 const ID='G-L2VZCN5S7Y',KEY='ra_usage_analytics_consent_v1';
 const publicPage=location.protocol==='https:'&&location.hostname==='ubseoul.github.io'&&/^\/rich_alucard\/(?:index\.html)?$/.test(location.pathname);
 if(!publicPage||window.RABuild?.source||new URLSearchParams(location.search).has('dev')||navigator.webdriver)return;
 const safePage='https://ubseoul.github.io/rich_alucard/';
 let consent=null,loaded=false,sent=false,dialog=null,previousFocus=null;
 try{const v=localStorage.getItem(KEY);if(v==='granted'||v==='denied')consent=v;}catch{}
 window['ga-disable-'+ID]=consent!=='granted';
 function tag(){window.dataLayer=window.dataLayer||[];window.dataLayer.push(arguments);}
 function start(){
  if(consent!=='granted')return;window['ga-disable-'+ID]=false;
  if(!loaded){
   loaded=true;window.gtag=tag;
   tag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   tag('set',{ads_data_redaction:true,url_passthrough:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:safePage,page_referrer:'',page_title:'Rich Alucard: Before The Fame'});
   tag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   tag('js',new Date());
   tag('config',ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:safePage,page_referrer:'',ignore_referrer:true,page_title:'Rich Alucard: Before The Fame',cookie_prefix:'ra',cookie_path:'/rich_alucard/',cookie_domain:'ubseoul.github.io'});
   const script=document.createElement('script');script.async=true;script.id='ra-google-tag';script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);
  }else tag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!sent){sent=true;tag('event','page_view',{send_to:ID,page_location:safePage,page_referrer:'',page_title:'Rich Alucard: Before The Fame'});}
 }
 function optOut(){
  window['ga-disable-'+ID]=true;
  if(loaded)tag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  for(const part of document.cookie.split(';')){const name=part.trim().split('=')[0];if(!/^ra_ga(?:_|$)/.test(name))continue;for(const domain of ['', '; domain=ubseoul.github.io','; domain=.ubseoul.github.io'])for(const path of ['/','/rich_alucard/'])document.cookie=name+'=; max-age=0; path='+path+domain+'; SameSite=Lax; Secure';}
 }
 function choose(value){consent=value;try{localStorage.setItem(KEY,value);}catch{}if(value==='granted')start();else optOut();close();}
 function node(tagName,text,cls){const n=document.createElement(tagName);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function close(){dialog?.remove();dialog=null;if(previousFocus?.isConnected)previousFocus.focus();}
 function open(){
  if(dialog)return;previousFocus=document.activeElement;
  dialog=node('section',null,'ra-analytics-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','ra-analytics-title');
  const card=node('div',null,'ra-analytics-card'),title=node('h2','Usage analytics');title.id='ra-analytics-title';
  card.append(title,node('p','Allow Google Analytics cookies to help us understand visits? No game saves or dialogue are sent. Ads and personalization stay off.'));
  const choices=node('div',null,'ra-analytics-choices');
  for(const [label,value]of [['No thanks','denied'],['Allow analytics','granted']]){const b=node('button',label);b.type='button';b.addEventListener('click',()=>choose(value));choices.append(b);}
  card.append(choices);const policy=node('a','Google privacy policy');policy.href='https://policies.google.com/privacy';policy.target='_blank';policy.rel='noopener noreferrer';card.append(policy);dialog.append(card);document.body.append(dialog);choices.firstChild.focus();
 }
 function attach(){
  for(const parent of [document.querySelector('#startOverlay .start-card'),document.querySelector('#phoneContent .phone-settings')]){
   if(!parent||parent.querySelector('.ra-privacy-settings'))continue;const b=node('button','Privacy','ra-privacy-settings');b.type='button';b.addEventListener('click',open);parent.append(b);
  }
 }
 const style=node('style');style.textContent='.ra-analytics-dialog{position:fixed;inset:0;z-index:10020;display:grid;place-items:center;padding:16px;background:#000b}.ra-analytics-card{width:min(100%,390px);max-height:100%;overflow:auto;padding:20px;border:2px solid #d9c995;background:#17101f;color:#f6efd9;font:12px/1.8 var(--font-system,monospace);box-shadow:6px 6px 0 #392b45}.ra-analytics-card h2{font:14px/1.8 var(--font-system,monospace);margin:0}.ra-analytics-card p{margin:14px 0}.ra-analytics-choices{display:grid;gap:10px}.ra-analytics-card button,.ra-privacy-settings{min-height:44px;padding:10px;border:2px solid #d9c995;border-radius:0;background:#24182d;color:#f6efd9;font:11px/1.6 var(--font-system,monospace);cursor:pointer}.ra-analytics-card button:last-child{background:#bd294c}.ra-analytics-card a{display:block;margin-top:14px;color:#d9c995;font-size:10px}.ra-analytics-card :focus-visible,.ra-privacy-settings:focus-visible{outline:3px solid #f1c861;outline-offset:3px}.ra-privacy-settings{width:100%;margin-top:10px}.ra-analytics-card button{width:100%}';document.head.append(style);
 document.addEventListener('keydown',e=>{
  if(!dialog||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'){e.preventDefault();choose('denied');}
  if(e.key==='Tab'){const a=[...dialog.querySelectorAll('button,a')],i=a.indexOf(document.activeElement);e.preventDefault();a[(i+(e.shiftKey?-1:1)+a.length)%a.length].focus();}e.stopImmediatePropagation();
 },true);
 const phone=document.getElementById('phoneContent');if(phone)new MutationObserver(attach).observe(phone,{childList:true});
 attach();if(consent==='granted')start();else if(consent==null)open();
 window.RAAnalytics=Object.freeze({openSettings:open,status:()=>({measurementId:ID,consent,loaded,pageViewSent:sent,scope:'Public visits only; no purchase events or game-state fields.'})});
})();
