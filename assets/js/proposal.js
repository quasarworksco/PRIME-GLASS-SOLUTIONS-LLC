(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function(n){ return Math.round(n).toLocaleString('en-US'); };
  var $ = function(id){ return document.getElementById(id); };
  var root = document.documentElement;

  /* ---- Language ---- */
  var lang = root.lang === 'en' ? 'en' : 'es';
  var langHandlers = [];
  function onLang(fn){ langHandlers.push(fn); }
  function setLang(l, save){
    lang = l === 'en' ? 'en' : 'es';
    root.lang = lang;
    var t = root.getAttribute('data-title-' + lang); if(t) document.title = t;
    var d = root.getAttribute('data-desc-' + lang), m = document.querySelector('meta[name="description"]');
    if(d && m) m.setAttribute('content', d);
    [].forEach.call(document.querySelectorAll('[data-lang]'), function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang); });
    [].forEach.call(document.querySelectorAll('a[data-xpage]'), function(a){ a.href = a.getAttribute('data-xpage') + (lang === 'en' ? '?lang=en' : ''); });
    if(save){ try{ localStorage.setItem('pg-lang', lang); }catch(e){} }
    langHandlers.forEach(function(fn){ fn(lang); });
  }
  [].forEach.call(document.querySelectorAll('[data-lang]'), function(b){
    b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang'), true); });
  });

  /* ---- Role matrix ---- */
  var tb = $('matrix');
  if(tb){
    var L = {f:['f','i-check'],r:['r','i-eye'],o:['o','i-user'],x:['x','i-lock']};
    var rows = [
      ['Clientes y oportunidades','Clients and opportunities','f','f','f','o'],
      ['Estimados y precios','Estimates and pricing','f','f','f','x'],
      ['Costos y márgenes','Costs and margins','f','r','f','x'],
      ['Proyectos y calendario','Projects and calendar','f','r','f','o'],
      ['Asignaciones de campo','Field assignments','f','x','f','o'],
      ['Documentos y fotos','Documents and photos','f','f','f','o'],
      ['Comunicación interna','Internal communication','f','f','f','f'],
      ['Facturación y cobros','Invoicing and collections','f','r','f','x'],
      ['Reportes financieros','Financial reports','f','x','f','x'],
      ['Usuarios y configuración','Users and settings','f','x','r','x']
    ];
    var h = '';
    rows.forEach(function(r,ri){
      h += '<tr><td><x-es>'+r[0]+'</x-es><x-en>'+r[1]+'</x-en></td>';
      for(var c=2;c<6;c++){ var l=L[r[c]]; h += '<td><i class="lv '+l[0]+'" style="transition-delay:'+(ri*.05+c*.04).toFixed(2)+'s"><svg class="i"><use href="#'+l[1]+'"/></svg></i></td>'; }
      h += '</tr>';
    });
    tb.innerHTML = h;
  }

  /* ---- Pause off-screen animations ---- */
  var pio = new IntersectionObserver(function(es){
    es.forEach(function(e){ e.target.classList.toggle('off', !e.isIntersecting); });
  },{rootMargin:'100px 0px'});
  document.querySelectorAll('main > section, .marquee').forEach(function(el){ pio.observe(el); });

  /* ---- Reveal ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* ---- Counters ---- */
  function count(el){
    var to = +el.dataset.count, dur = reduce ? 0 : 1600, t0 = null;
    if(!dur){ el.textContent = fmt(to); return; }
    function step(t){ if(!t0) t0=t; var p=Math.min((t-t0)/dur,1); el.textContent = fmt(to*(1-Math.pow(1-p,4))); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ setTimeout(function(){count(e.target);}, e.target.closest('.hero')?1500:150); cio.unobserve(e.target); } });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  /* ---- Scroll progress, nav state, timeline fill ---- */
  var bar = $('progress');
  var links = [].slice.call(document.querySelectorAll('.navlinks a[href^="#"]'));
  var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  var tl = $('tl'), days = tl ? [].slice.call(tl.querySelectorAll('.day')) : [];
  var ticking = false;
  function onScroll(){
    var st = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX('+(max>0?st/max:0)+')';
    var cur = -1;
    secs.forEach(function(s,i){ if(s && s.getBoundingClientRect().top < innerHeight*.4) cur = i; });
    links.forEach(function(a,i){ a.classList.toggle('on', i===cur); });
    if(tl){
      var r = tl.getBoundingClientRect(), mid = innerHeight*.6;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      tl.style.setProperty('--tp', p.toFixed(3));
      days.forEach(function(d){ d.classList.toggle('lit', d.getBoundingClientRect().top + 32 < mid); });
    }
    ticking = false;
  }
  addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  addEventListener('resize', onScroll);
  onScroll();

  /* ---- Hero tilt ---- */
  var stage = $('stage'), mock = $('mock');
  if(stage && mock && !reduce && matchMedia('(hover:hover)').matches){
    stage.addEventListener('pointermove', function(e){
      var r = stage.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
      mock.style.transform = 'rotateY('+(x*14-6)+'deg) rotateX('+(-y*10+3)+'deg)';
    });
    stage.addEventListener('pointerleave', function(){ mock.style.transform = ''; });
  }

  /* ---- Flow pipeline ---- */
  var flow = $('flow');
  if(flow){
    var steps = [].slice.call(document.querySelectorAll('.step'));
    var fill = $('trackFill'), fdIcon = $('fdIcon'), fdTxt = $('fdTxt');
    var info = {
      es: [
        ['Lead','El contacto llega por teléfono, sitio web o referido. Se registra con su origen y se asigna a un vendedor con recordatorio de seguimiento.'],
        ['Visita y medición','Se agenda la visita. El técnico captura medidas, notas y fotos desde el celular, directo en la ficha del cliente.'],
        ['Cotización','El estimado se arma con el catálogo de precios y la plantilla de la empresa. Se calcula el margen antes de enviarlo.'],
        ['Aprobación','El cliente recibe el estimado por correo y lo aprueba con un enlace. El estado se actualiza solo.'],
        ['Proyecto programado','El estimado aprobado se convierte en proyecto con fecha, materiales y cuadrilla asignada en el calendario.'],
        ['Instalación','La cuadrilla ve su asignación en la app, marca avances, sube fotos y reporta órdenes de cambio.'],
        ['Cierre','Revisión final con fotos de entrega y conformidad del cliente. El proyecto queda documentado.'],
        ['Factura y cobro','Se registra la factura y los pagos. Los reportes muestran facturado, cobrado y pendiente al instante.']
      ],
      en: [
        ['Lead','The contact comes in by phone, website or referral. It is logged with its source and assigned to a salesperson with a follow-up reminder.'],
        ['Site visit and measurement','The visit is scheduled. The technician captures measurements, notes and photos from a phone, straight into the client record.'],
        ['Estimate','The estimate is built from the price catalog and the company template. The margin is calculated before it is sent.'],
        ['Approval','The client receives the estimate by email and approves it through a link. The status updates automatically.'],
        ['Scheduled project','The approved estimate becomes a project with a date, materials and an assigned crew on the calendar.'],
        ['Installation','The crew sees its assignment in the app, marks progress, uploads photos and reports change orders.'],
        ['Closeout','Final walkthrough with delivery photos and client sign-off. The project is fully documented.'],
        ['Invoice and payment','Invoices and payments are recorded. Reports show invoiced, collected and outstanding amounts instantly.']
      ]
    };
    var cur = 0, flowTimer = null;
    var renderInfo = function(i){
      fdIcon.innerHTML = steps[i].querySelector('.dot').innerHTML;
      fdTxt.innerHTML = '<b>'+info[lang][i][0]+'</b><span>'+info[lang][i][1]+'</span>';
    };
    var setStep = function(i){
      cur = i;
      steps.forEach(function(s,k){ s.classList.toggle('done', k<i); s.classList.toggle('now', k===i); });
      fill.style.setProperty('--p', (i/(steps.length-1)).toFixed(3));
      fdTxt.classList.add('swap');
      setTimeout(function(){ renderInfo(i); fdTxt.classList.remove('swap'); }, 250);
    };
    var restartFlow = function(){ clearInterval(flowTimer); if(!reduce) flowTimer = setInterval(function(){ setStep((cur+1)%steps.length); }, 2400); };
    steps.forEach(function(s,k){ s.style.cursor='pointer'; s.addEventListener('click', function(){ setStep(k); restartFlow(); }); });
    new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ setStep(cur); restartFlow(); } else clearInterval(flowTimer); });
    },{threshold:.3}).observe(flow);
    onLang(function(){ renderInfo(cur); });
  }

  /* ---- Estimate email demo ---- */
  var est = $('estDemo');
  if(est){
    var msgs = {
      es: 'Hola, familia Rodríguez:\n\nAdjuntamos el estimado para su puerta de ducha frameless. Puede revisarlo y aprobarlo en línea desde el enlace incluido.\n\nGracias por confiar en Prime Glass Solutions.',
      en: 'Hello, Rodríguez family:\n\nPlease find attached the estimate for your frameless shower door. You can review and approve it online using the included link.\n\nThank you for trusting Prime Glass Solutions.'
    };
    var btnTxt = { es:['Enviar','Enviado'], en:['Send','Sent'] };
    var typed = $('typed'), sendBtn = $('sendBtn'), stamp = $('stamp');
    var stats = [].slice.call(document.querySelectorAll('#mailStatus > span'));
    var running = false, timers = [];
    var later = function(fn, ms){ timers.push(setTimeout(fn, ms)); };
    var setTyped = function(n){ typed.innerHTML = msgs[lang].slice(0,n).replace(/\n/g,'<br>'); };
    var runMail = function(){
      if(running) return; running = true;
      timers.forEach(clearTimeout); timers = [];
      setTyped(0); sendBtn.className = 'sendbtn'; sendBtn.lastElementChild.textContent = btnTxt[lang][0];
      stats.forEach(function(s){ s.classList.remove('on'); }); stamp.classList.remove('on');
      if(reduce){ setTyped(msgs[lang].length); stats.forEach(function(s){s.classList.add('on');}); stamp.classList.add('on'); return; }
      var i = 0;
      (function tick(){ setTyped(++i); if(i < msgs[lang].length) later(tick, 18 + Math.random()*26); else later(send, 700); })();
      function send(){
        sendBtn.classList.add('go');
        later(function(){ sendBtn.classList.add('sent'); sendBtn.lastElementChild.textContent = btnTxt[lang][1]; stats[0].classList.add('on'); }, 500);
        later(function(){ stats[1].classList.add('on'); }, 1700);
        later(function(){ stats[2].classList.add('on'); stamp.classList.add('on'); }, 2900);
        later(function(){ running = false; runMail(); }, 7500);
      }
    };
    var visible = false;
    new IntersectionObserver(function(es){
      es.forEach(function(e){ visible = e.isIntersecting; if(visible) runMail(); else { running = false; timers.forEach(clearTimeout); } });
    },{threshold:.25}).observe(est);
    onLang(function(){ running = false; timers.forEach(clearTimeout); if(visible) runMail(); else { setTyped(0); sendBtn.lastElementChild.textContent = btnTxt[lang][0]; } });
  }

  /* ---- Phone screens ---- */
  var scrs = [].slice.call(document.querySelectorAll('[data-scr]')), tabs = [].slice.call(document.querySelectorAll('[data-tab]')), si = 0;
  if(scrs.length && !reduce) setInterval(function(){
    var prev = scrs[si]; prev.classList.remove('on'); prev.classList.add('out');
    setTimeout(function(){ prev.classList.remove('out'); }, 700);
    si = (si+1) % scrs.length; scrs[si].classList.add('on');
    tabs.forEach(function(t,k){ t.classList.toggle('on', k===si); });
  }, 3800);

  /* ---- Pricing toggle ---- */
  var tg = $('webToggle');
  if(tg){
    var tn = $('totalNum'), wl = $('webLine'), shown = 789;
    var animTo = function(v){
      var from = shown, t0 = null; shown = v;
      if(reduce){ tn.textContent = fmt(v); return; }
      (function f(t){ if(!t0) t0=t; var p=Math.min((t-t0)/600,1), e=1-Math.pow(1-p,3); tn.textContent = fmt(from+(v-from)*e); if(p<1) requestAnimationFrame(f); })(performance.now());
    };
    var flip = function(){
      var on = tg.getAttribute('aria-checked') !== 'true';
      tg.setAttribute('aria-checked', on);
      wl.classList.toggle('off', !on);
      var t = on ? 789 : 654;
      animTo(t);
      $('pay60').textContent = (t*.6).toFixed(2);
      $('pay40').textContent = (t*.4).toFixed(2);
    };
    tg.addEventListener('click', flip);
    tg.addEventListener('keydown', function(e){ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); flip(); } });
  }

  setLang(lang, false);
})();
