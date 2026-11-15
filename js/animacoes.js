// Animações do portfólio. Cada uma tem um motivo:
// 1. entrada do topo: mostra primeiro o título, depois o resto (hierarquia)
// 2. blocos que aparecem ao rolar: leitura em ordem
// 3. números que contam: chamam atenção para os resultados
// 4. pilha de projetos: um projeto empurra o outro, em sequência
// 5. botão do contato que segue o mouse: resposta ao gesto
(function () {
  var html = document.documentElement;
  var nav = document.getElementById('nav');
  var reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // O menu ganha fundo depois que a pessoa sai do topo (IntersectionObserver, sem ouvir o scroll).
  var sentinela = document.createElement('div');
  sentinela.setAttribute('aria-hidden', 'true');
  sentinela.style.cssText = 'position:absolute;top:0;left:0;height:40px;width:1px;pointer-events:none';
  document.body.prepend(sentinela);
  new IntersectionObserver(function (e) { nav.classList.toggle('solida', !e[0].isIntersecting); }).observe(sentinela);

  if (reduzir || !window.gsap || !window.ScrollTrigger) { html.classList.remove('js-anim'); return; }

  gsap.registerPlugin(ScrollTrigger);
  var temSplit = !!window.SplitText;
  if (temSplit) gsap.registerPlugin(SplitText);
  var suave = 'expo.out';

  // Rolagem suave (Lenis) sincronizada com o ScrollTrigger.
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var alvo = document.querySelector(a.getAttribute('href'));
        if (!alvo) return;
        ev.preventDefault();
        lenis.scrollTo(alvo, { offset: -80, duration: 1.4 });
      });
    });
  }

  // 1. Entrada do topo.
  var h1 = document.querySelector('.hero h1');
  gsap.set([h1, '.hero .sub', '.hero .acoes', '.foto'], { visibility: 'visible' });
  var tl = gsap.timeline({ defaults: { ease: suave } });
  if (temSplit) {
    var partes = SplitText.create(h1, { type: 'lines', mask: 'lines' });
    tl.from(partes.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 });
  } else {
    tl.from(h1, { y: 40, autoAlpha: 0, duration: 1.1 });
  }
  tl.from('.foto', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
    .from('.foto img', { scale: 1.25, duration: 1.8 }, 0.1)
    .from('.hero .sub', { y: 24, autoAlpha: 0, duration: 1 }, 0.55)
    .from('.hero .acoes > *', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.7);

  // A foto anda um pouco mais devagar que a página.
  gsap.to('.foto img', {
    yPercent: -10, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // 2. Blocos aparecem ao entrar na tela.
  ScrollTrigger.batch('[data-revelar]', {
    start: 'top 88%',
    once: true,
    onEnter: function (els) {
      gsap.fromTo(els, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: suave, stagger: 0.08, overwrite: true });
    }
  });

  // 3. Números contam quando aparecem.
  document.querySelectorAll('[data-contar]').forEach(function (el) {
    var fim = parseFloat(el.dataset.contar);
    var inicio = parseFloat(el.dataset.de || 0);
    var casas = parseInt(el.dataset.decimais || 0, 10);
    var sufixo = el.dataset.sufixo || '';
    var obj = { v: inicio };
    var escrever = function () { el.textContent = obj.v.toFixed(casas).replace('.', ',') + sufixo; };
    escrever();
    gsap.to(obj, {
      v: fim, duration: 1.8, ease: 'power3.out', onUpdate: escrever,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  // 4. Pilha de projetos: só em telas grandes, onde o cartão cabe inteiro.
  var mm = gsap.matchMedia();
  mm.add('(min-width: 960px) and (min-height: 700px)', function () {
    var cartoes = gsap.utils.toArray('.cartao-projeto');
    cartoes.forEach(function (cartao, i) {
      if (i === cartoes.length - 1) return;
      gsap.to(cartao.querySelector('.dentro'), {
        scale: 0.92, autoAlpha: 0.45, ease: 'none',
        scrollTrigger: { trigger: cartoes[i + 1], start: 'top bottom', end: 'top 96px', scrub: true }
      });
    });
  });
  mm.add('(max-width: 959px), (max-height: 699px)', function () {
    gsap.utils.toArray('.cartao-projeto').forEach(function (c) {
      gsap.from(c, { y: 48, autoAlpha: 0, duration: 1, ease: suave, scrollTrigger: { trigger: c, start: 'top 88%', once: true } });
    });
  });

  // 5. Botão do contato puxa levemente para o mouse (só com mouse de verdade).
  if (matchMedia('(pointer: fine)').matches) {
    var caixa = document.querySelector('.magnetico');
    var btn = caixa && caixa.querySelector('.btn');
    if (btn) {
      caixa.style.padding = '24px';
      caixa.style.margin = '-24px';
      var mx = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      var my = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      caixa.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.35);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      caixa.addEventListener('pointerleave', function () { mx(0); my(0); });
    }
  }

  // Recalcula posições depois que fontes e imagens terminam de carregar.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
