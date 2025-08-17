// Deferred interactive JS (non-critical)
(function(){
  function trackEvent(name,detail){if(window.dataLayer){window.dataLayer.push({event:name,...detail});}console.log('[TRACK]',name,detail);} window.trackEvent=trackEvent;
  document.querySelectorAll('[data-cta]').forEach(btn=>btn.addEventListener('click',()=>trackEvent('cta_click',{id:btn.getAttribute('data-cta')})));
  document.querySelectorAll('a.btn-neon').forEach(btn=>btn.addEventListener('click',()=>trackEvent('btn_neon',{href:btn.getAttribute('href')})));
  // Metrics counter
  const metricObserver=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){const el=en.target;const targetVal=+el.dataset.target;let start=0;const inc=Math.max(1,Math.round(targetVal/80));const interval=setInterval(()=>{start+=inc;if(start>=targetVal){start=targetVal;clearInterval(interval);}el.textContent=start;},20);metricObserver.unobserve(el);}})},{threshold:.4});
  document.querySelectorAll('[data-metric]').forEach(m=>metricObserver.observe(m));
  // Result metrics
  const resultObserver=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){const el=en.target;const end=+el.dataset.target;let cur=0;const inc=Math.max(1,Math.round(end/100));const t=setInterval(()=>{cur+=inc;if(cur>=end){cur=end;clearInterval(t);}el.textContent=cur;},20);resultObserver.unobserve(el);}})},{threshold:.4});
  document.querySelectorAll('[data-result]').forEach(el=>resultObserver.observe(el));
  // Carousel
  const track=document.getElementById('testimonialTrack');
  const dotsContainer=document.getElementById('testimonialDots');
  if(track){const items=[...track.querySelectorAll('.testimonial-item')];items.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Ver depoimento '+(i+1));b.addEventListener('click',()=>goTo(i));dotsContainer.appendChild(b);});function goTo(i){current=i;update();}
    let current=0;function update(){const w=items[0].clientWidth+20;track.scrollTo({left:current*w,behavior:'smooth'});[...dotsContainer.children].forEach((d,i)=>d.classList.toggle('active',i===current));}
    function auto(){current=(current+1)%items.length;update();}
    let autoTimer=setInterval(auto,6000);track.addEventListener('pointerdown',()=>clearInterval(autoTimer));update();
    // Keyboard trap / arrows inside carousel focus
    track.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const total=items.length;if(e.key==='ArrowRight'){current=(current+1)%total;} else {current=(current-1+total)%total;} update();}});
  }
  // Lead submit enhanced (spinner)
  async function submitLead(form,msgEl,eventName){
    const btn=form.querySelector('button[type="submit"]');
    const original=btn.innerHTML;btn.disabled=true;btn.innerHTML='Enviando <span class="spinner" aria-hidden="true"></span>';
    const fd=new FormData(form);const data=Object.fromEntries(fd.entries());
    msgEl.textContent='Processando...';msgEl.className='lead-msg text-gray-400';
    try{await fetch(window.LEAD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),mode:'no-cors'});
      msgEl.textContent='Inscrição confirmada! Verifique seu e-mail.';msgEl.className='lead-msg ok';trackEvent(eventName,data);form.reset();
    }catch(err){console.warn('Falha envio',err);msgEl.textContent='Servidor indisponível. Registro local.';msgEl.className='lead-msg err';trackEvent(eventName+'_fallback',data);}finally{btn.disabled=false;btn.innerHTML=original;}
  }
  const leadForm=document.getElementById('leadForm');if(leadForm){leadForm.addEventListener('submit',e=>{e.preventDefault();submitLead(leadForm,document.getElementById('leadMsg'),'lead_submit');});}
  const leadMagnet=document.getElementById('leadMagnetForm');if(leadMagnet){leadMagnet.addEventListener('submit',e=>{e.preventDefault();submitLead(leadMagnet,document.getElementById('leadMagnetMsg'),'lead_magnet_submit');});}
  // Video lazy
  function setupVideo(wrapper){const src=wrapper.dataset.video;if(!src)return;const video=document.createElement('video');video.src=src;video.controls=true;video.playsInline=true;video.preload='none';video.poster='assets/Capa-ebook.jpg';wrapper.appendChild(video);}
  document.querySelectorAll('[data-play-author]').forEach(btn=>btn.addEventListener('click',()=>{const wrap=btn.closest('.video-wrapper');btn.remove();setupVideo(wrap);trackEvent('play_author',{});}));
  // Toasts
  const toastNames=['João','Marina','Edu','Patrícia','Rafa','Sandra','Leo','Bianca'];
  const toastCities=['SP','RJ','BH','POA','SSA','CUR','REC'];
  function pushToast(){const c=document.getElementById('toastStream');if(!c)return;const t=document.createElement('div');t.className='toast';const name=toastNames[Math.random()*toastNames.length|0];const city=toastCities[Math.random()*toastCities.length|0];t.innerHTML=`<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M5 12l5 5L20 7'/></svg><span><strong>${name}</strong> de ${city} acessou o guia agora</span>`;c.appendChild(t);setTimeout(()=>{t.style.transition='opacity .6s';t.style.opacity='0';setTimeout(()=>t.remove(),650);},6000);} 
  setTimeout(()=>pushToast(),4000);setInterval(()=>pushToast(),18000);
  // Chat
  const chatToggle=document.getElementById('chatToggle');
  const miniChat=document.getElementById('miniChat');
  const chatBody=document.getElementById('chatBody');
  const closeChat=document.getElementById('closeChat');
  const preset=[{q:'Como recebo o eBook?',a:'Link imediato por e-mail após confirmação.'},{q:'Tem garantia?',a:'Sim, 7 dias. Sem perguntas.'},{q:'Serve para iniciantes?',a:'Total. Explicações + modelos prontos.'},{q:'Forma de pagamento?',a:'Checkout seguro Cakto, cartão ou pix.'}];
  let lastFocus=null;
  function trap(e){if(e.key==='Tab'){const f=miniChat.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])');if(!f.length)return;const first=f[0];const last=f[f.length-1];if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}} if(e.key==='Escape'){close();}}
  function openChat(){lastFocus=document.activeElement;miniChat.classList.add('open');miniChat.setAttribute('aria-hidden','false');chatToggle.setAttribute('aria-expanded','true');if(!chatBody.dataset.loaded){seedChat();}miniChat.focus();document.addEventListener('keydown',trap);} 
  function close(){miniChat.classList.remove('open');miniChat.setAttribute('aria-hidden','true');chatToggle.setAttribute('aria-expanded','false');document.removeEventListener('keydown',trap);if(lastFocus){lastFocus.focus();}}
  chatToggle.addEventListener('click',()=>{miniChat.classList.contains('open')?close():openChat();});
  closeChat.addEventListener('click',close);
  function seedChat(){chatBody.dataset.loaded='1';const intro=document.createElement('div');intro.className='chat-msg bot';intro.textContent='Selecione uma dúvida:';chatBody.appendChild(intro);const box=document.createElement('div');box.className='chat-options';preset.forEach(p=>{const b=document.createElement('button');b.textContent=p.q;b.addEventListener('click',()=>showAnswer(p));box.appendChild(b);});chatBody.appendChild(box);} 
  function showAnswer(p){const ans=document.createElement('div');ans.className='chat-msg bot';ans.textContent=p.a;chatBody.appendChild(ans);chatBody.scrollTop=chatBody.scrollHeight;trackEvent('chat_answer',{q:p.q});}
  // Schemas
  const faqScript=document.createElement('script');faqScript.type='application/ld+json';faqScript.textContent=JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...document.querySelectorAll('#faq .accordion-item')].map(it=>({"@type":"Question","name":it.querySelector('.accordion-button span').textContent.trim(),"acceptedAnswer":{"@type":"Answer","text":it.querySelector('.accordion-content').textContent.trim()}}))});document.head.appendChild(faqScript);
  const offerScript=document.createElement('script');offerScript.type='application/ld+json';offerScript.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Book","name":"O Poder da Manipulação Positiva","author":{"@type":"Person","name":"Lucas"},"image":location.origin+location.pathname.replace(/index\.html?$/,'')+'assets/Capa-ebook.jpg',"description":"Guia prático de influência ética, narrativa e gatilhos calibrados para aumentar conversões com reputação.","workExample":[{"@type":"Book","bookFormat":"EBook","inLanguage":"pt-BR"}],"offers":{"@type":"Offer","priceCurrency":"BRL","price":"49.90","availability":"https://schema.org/InStock","url":location.origin+location.pathname,"validFrom":new Date().toISOString()}});document.head.appendChild(offerScript);
  trackEvent('exp_variant',{variant:window.__expVariant});
})();
