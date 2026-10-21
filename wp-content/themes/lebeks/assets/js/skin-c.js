/* Скин C «Подбор»: шапка (компактный режим, указатель мега-меню), подбор на первом экране, вкладки и аккордеоны главной,
   число подходящих моделей под расчётом, категория (ящик параметров, классы, сортировка, лоток и окно сравнения),
   карточка товара (вкладки на компьютере, аккордеон на телефоне). Без библиотек. Движение только transform и opacity,
   при prefers-reduced-motion цифры и панели переключаются без анимации. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var NBSP = ' ';

  var fmt = function (n) {
    if (n === null || n === undefined || isNaN(n)) return '';
    var r = Math.round(n * 10) / 10;
    return r.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  };
  var plural = function (n, f) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  };
  var el = function (tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  };
  var readJson = function (id) {
    var s = doc.getElementById(id);
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  };
  var withUnit = function (v, unit) { return fmt(v) + (unit ? NBSP + unit : ''); };

  /* ---------- шапка: компактный режим и указатель мега-меню ---------- */
  var head = $('.ck-head');
  if (head) {
    var r1 = $('.ck-head__r1', head);
    var wide = window.matchMedia('(min-width: 1180px)');
    var onScroll = function () {
      var y = window.pageYOffset || root.scrollTop || 0;
      var limit = (r1 ? r1.offsetHeight : 76) - 4;
      head.classList.toggle('is-compact', wide.matches && y > limit);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    var rqCount = $('[data-rq-count]');
    var mirror = $('[data-ck-count]');
    if (rqCount && mirror) {
      var sync = function () { var n = parseInt(rqCount.textContent, 10) || 0; mirror.textContent = n ? String(n) : ''; };
      if ('MutationObserver' in window) new MutationObserver(sync).observe(rqCount, { childList: true, characterData: true, subtree: true });
      sync();
    }
  }

  var mtabs = $('.ck-mtabs');
  if (mtabs) {
    var place = function () {
      var cur = $('.mega__root[aria-expanded="true"]', mtabs);
      if (!cur || !cur.parentNode.offsetWidth) return;
      var li = cur.parentNode;
      mtabs.style.setProperty('--mu-x', li.offsetLeft + 'px');
      mtabs.style.setProperty('--mu-s', (li.offsetWidth / 100).toFixed(3));
    };
    place();
    window.addEventListener('resize', place);
    if ('MutationObserver' in window) {
      new MutationObserver(place).observe(mtabs, { attributes: true, subtree: true, attributeFilter: ['aria-expanded'] });
    }
    var catItem = mtabs.closest('.nav__item');
    if (catItem && 'MutationObserver' in window) {
      new MutationObserver(function () { setTimeout(place, 20); }).observe(catItem, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ---------- переключатели-сегменты ---------- */
  var segSet = function (seg, btn) {
    var bs = $$('.ck-seg__b', seg);
    var i = bs.indexOf(btn);
    if (i < 0) return;
    seg.style.setProperty('--i', String(i));
    bs.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  /* задача на первом экране: ссылки на технологию и технику */
  var task = $('[data-ck-task]');
  if (task) {
    var tseg = $('[data-ck-seg]', task);
    var lt = $('[data-ck-tech]', task);
    var le = $('[data-ck-equip]', task);
    if (tseg) {
      $$('.ck-seg__b', tseg).forEach(function (b) {
        b.addEventListener('click', function () {
          segSet(tseg, b);
          if (lt && b.getAttribute('data-tu')) { lt.href = b.getAttribute('data-tu'); lt.textContent = b.getAttribute('data-tt'); }
          if (le && b.getAttribute('data-eu')) { le.href = b.getAttribute('data-eu'); le.textContent = b.getAttribute('data-et'); }
        });
      });
    }
  }

  /* ---------- подбор: ползунки, привод, число моделей ---------- */
  var pickBox = $('[data-ck-pick]');
  var pickData = readJson('ck-pick-data');
  if (pickBox && pickData && pickData.items && pickData.a) {
    (function () {
      var items = pickData.items, A = pickData.a, B = pickData.b, D = pickData.d;
      var inA = $('[data-ck-a]', pickBox), inB = $('[data-ck-b]', pickBox);
      var st = { ai: pickData.ai || 0, bi: 0, k: '' };
      var elAv = $('[data-ck-av]', pickBox), elBv = $('[data-ck-bv]', pickBox);
      var rows = $('[data-ck-rows]', pickBox), none = $('[data-ck-none]', pickBox);
      var roll = $('[data-ck-roll]', pickBox), live = $('[data-ck-live]', pickBox), word = $('[data-ck-word]', pickBox);
      var go = $('[data-ck-go]', pickBox), chip = $('[data-ck-chip]', pickBox), pimg = $('.ck-pimg', pickBox), pic = $('[data-ck-pic]', pickBox);
      var drive = $('[data-ck-drive]', pickBox);
      var classes = $$('.ck-ct', doc);
      var hubHref = go ? go.getAttribute('href') : '';
      var forms = pickData.forms || ['модель', 'модели', 'моделей'];
      var unitA = A.unit, unitB = B ? B.unit : '';

      var match = function (it) {
        if (it.a < A.steps[st.ai]) return false;
        if (B && st.bi > 0 && (it.b === null || it.b < B.steps[st.bi])) return false;
        if (st.k && it.d !== st.k) return false;
        return true;
      };
      var setRange = function (input, i, max) {
        input.parentNode.style.setProperty('--p', max ? (i / max).toFixed(4) : '0');
      };
      var rollTo = function (n) {
        if (!roll) return;
        var s = String(n);
        var cols = $$('.ck-roll__c', roll);
        if (cols.length !== s.length) {
          roll.textContent = '';
          cols = [];
          for (var c = 0; c < s.length; c++) {
            var col = el('span', 'ck-roll__c'), stack = el('span', 'ck-roll__s');
            for (var d = 0; d < 10; d++) stack.appendChild(el('i', '', String(d)));
            col.appendChild(stack);
            roll.appendChild(col);
            cols.push(col);
          }
          void roll.offsetWidth;
        }
        cols.forEach(function (col, idx) { $('.ck-roll__s', col).style.setProperty('--n', s.charAt(idx)); });
      };
      var imgs = {};
      $$('img', pimg).forEach(function (im) { imgs[im.getAttribute('src')] = im; });
      var showImage = function (url) {
        if (!pimg) return;
        Object.keys(imgs).forEach(function (u) { imgs[u].classList.toggle('is-on', u === url); });
        if (url && !imgs[url]) {
          var im = doc.createElement('img');
          im.alt = '';
          im.decoding = 'async';
          im.src = url;
          imgs[url] = im;
          pimg.insertBefore(im, chip || null);
          requestAnimationFrame(function () { requestAnimationFrame(function () { im.classList.add('is-on'); }); });
        }
      };
      var update = function () {
        var ok = items.filter(match);
        var n = ok.length;
        elAv.textContent = withUnit(A.steps[st.ai], unitA);
        inA.setAttribute('aria-valuetext', elAv.textContent);
        setRange(inA, st.ai, A.steps.length - 1);
        if (B && inB) {
          elBv.textContent = withUnit(B.steps[st.bi], unitB);
          inB.setAttribute('aria-valuetext', elBv.textContent);
          setRange(inB, st.bi, B.steps.length - 1);
        }
        rows.textContent = '';
        ok.slice(0, 3).forEach(function (it) {
          var li = el('li'), a = el('a');
          a.href = it.u;
          a.appendChild(el('span', 'ck-mono', it.s));
          a.appendChild(el('em', '', it.n));
          a.appendChild(el('b', '', withUnit(it.a, unitA)));
          li.appendChild(a);
          rows.appendChild(li);
        });
        if (none) none.hidden = n > 0;
        rollTo(n);
        if (live) live.textContent = n + ' ' + plural(n, forms);
        if (word) word.textContent = plural(n, forms);
        var best = null;
        for (var i = 0; i < ok.length; i++) { if (ok[i].i >= 0) { best = ok[i]; break; } }
        showImage(best ? pickData.imgs[best.i] : '');
        var shown = best || ok[0] || null;
        if (pimg) pimg.classList.toggle('is-sch', !best);
        if (pic) {
          var pu = !best && shown && pickData.pics ? pickData.pics[shown.g] : '';
          pic.hidden = !pu;
          if (pu && pic.getAttribute('src') !== pu) pic.src = pu;
        }
        if (chip) {
          chip.hidden = !shown;
          if (shown) chip.textContent = shown.s + ' · ' + withUnit(shown.a, unitA);
        }
        if (go) {
          var cnt = {}, top = -1, topN = 0;
          ok.forEach(function (it) { if (it.c >= 0) { cnt[it.c] = (cnt[it.c] || 0) + 1; if (cnt[it.c] > topN) { topN = cnt[it.c]; top = it.c; } } });
          go.href = top >= 0 && pickData.cats[top] ? pickData.cats[top].u : hubHref;
        }
        classes.forEach(function (c) {
          var lo = parseFloat(c.getAttribute('data-lo')), hi = parseFloat(c.getAttribute('data-hi'));
          var k = items.filter(function (it) { return match(it) && it.a >= lo && it.a <= hi; }).length;
          c.classList.toggle('is-dim', k === 0);
          var nn = $('.ck-ct__n', c);
          if (nn) nn.textContent = k + ' ' + plural(k, forms);
        });
      };
      inA.addEventListener('input', function () { st.ai = parseInt(inA.value, 10) || 0; update(); });
      if (inB) inB.addEventListener('input', function () { st.bi = parseInt(inB.value, 10) || 0; update(); });
      if (drive) {
        $$('.ck-seg__b', drive).forEach(function (b) {
          b.addEventListener('click', function () { segSet(drive, b); st.k = b.getAttribute('data-k') || ''; update(); });
        });
      }
      classes.forEach(function (c) {
        c.addEventListener('click', function () {
          var lo = parseFloat(c.getAttribute('data-lo'));
          var idx = 0;
          for (var i = 0; i < A.steps.length; i++) { if (A.steps[i] >= lo) { idx = i; break; } idx = i; }
          st.ai = idx;
          inA.value = String(idx);
          update();
        });
      });
      // стартовое состояние уже в разметке; JS подхватывает его и ставит катящиеся цифры
      inA.value = String(st.ai);
      update();
    })();
  }

  /* ---------- вкладки главной ---------- */
  $$('[data-ck-tabs]').forEach(function (box) {
    var bar = $('.ck-tabs__bar', box);
    var tabs = $$('[role="tab"]', box);
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
    var mark = function () {
      var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
      if (!cur || !bar) return;
      bar.style.setProperty('--ux', cur.offsetLeft + 'px');
      bar.style.setProperty('--us', (cur.offsetWidth / 100).toFixed(3));
    };
    var select = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) panels[k].hidden = !on;
      });
      mark();
      if (focus) tabs[i].focus();
      if (!reduce && bar && bar.scrollTo) {
        var t = tabs[i], left = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
        if (bar.scrollWidth > bar.clientWidth + 2) bar.scrollTo({ left: left, behavior: 'smooth' });
      }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, to = -1;
        if (k === 'ArrowRight') to = (i + 1) % n;
        else if (k === 'ArrowLeft') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to >= 0) { e.preventDefault(); select(to, true); }
      });
    });
    mark();
    window.addEventListener('resize', mark);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(mark);
    window.addEventListener('load', mark);
  });

  /* ---------- аккордеон: одна открытая строка ---------- */
  $$('[data-ck-acc]').forEach(function (acc) {
    var rows = $$('.ck-ac', acc);
    rows.forEach(function (row) {
      var btn = $('.ck-ac__h button', row);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var open = !row.classList.contains('is-open');
        rows.forEach(function (r) {
          var on = r === row && open;
          r.classList.toggle('is-open', on);
          var b = $('.ck-ac__h button', r);
          if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      });
    });
  });

  /* ---------- расчёт усилия: сколько моделей подходит ---------- */
  var md = $('[data-ck-md]');
  var outEl = $('.js-calc-out');
  if (md && outEl && pickData && pickData.items && /^к?н$/i.test(String(pickData.a.unit || '').replace(/\s/g, ''))) {
    var calcModels = function () {
      var t = parseFloat(String(outEl.textContent).replace(/\s/g, '').replace(',', '.'));
      if (!isFinite(t) || t <= 0 || outEl.classList.contains('is-empty')) { md.hidden = true; return; }
      var n = pickData.items.filter(function (it) { return it.a >= t; }).length;
      md.textContent = n
        ? 'Моделей с усилием от ' + fmt(Math.ceil(t * 10) / 10) + ' ' + pickData.a.unit + ': ' + n
        : 'С таким усилием моделей в каталоге нет, нужна индивидуальная проработка.';
      md.hidden = false;
    };
    if ('MutationObserver' in window) new MutationObserver(calcModels).observe(outEl, { childList: true, characterData: true, subtree: true });
    calcModels();
  }

  /* ---------- категория: ящик параметров, классы, сортировка, сравнение ---------- */
  var cat = $('[data-ck-cat]');
  var cdata = readJson('ck-cat-data');
  if (cat && cdata) {
    (function () {
      var list = $('.pgrid', cat);
      if (!list) return;
      var lis = $$(':scope > li', list);
      var byLi = lis.map(function (li, i) {
        var card = $('.ck-card', li);
        return { li: li, card: card, sku: card ? card.getAttribute('data-sku') : '', i: i };
      });
      var flt = cdata.flt || {};
      var A = cdata.a || null, B = cdata.b || null, D = cdata.d || null;
      var st = { ai: 0, bi: 0, k: '', lo: null, hi: null, sort: 'def' };
      var found = $('[data-ck-found]', cat), empty = $('[data-ck-empty]', cat);
      var openBtn = $('[data-ck-open]', cat), fn = $('[data-ck-fn]', cat);
      var drw = $('[data-ck-drw]', cat), scrim = $('[data-ck-scrim]', cat), body = $('[data-ck-drw-body]', cat);
      var showBtn = $('[data-ck-show]', cat), resetBtn = $('[data-ck-reset]', cat);
      var sortSel = $('[data-ck-sort]', cat), sortWrap = sortSel ? sortSel.closest('.ck-srt') : null;
      var scale = $$('.ck-sc', cat);
      var unitA = A ? A.unit : '', unitB = B ? B.unit : '';
      var total = byLi.length;
      var drwInputs = {};

      var active = function () {
        var n = 0;
        if (A && st.ai > 0) n++;
        if (B && st.bi > 0) n++;
        if (st.k) n++;
        if (st.lo !== null) n++;
        return n;
      };
      var pass = function (r) {
        var f = flt[r.sku];
        if (!f) return !(active());
        if (A && st.ai > 0 && (f[0] === null || f[0] < A.steps[st.ai])) return false;
        if (B && st.bi > 0 && (f[1] === null || f[1] < B.steps[st.bi])) return false;
        if (st.k && f[2] !== st.k) return false;
        if (st.lo !== null && (f[0] === null || f[0] < st.lo || f[0] > st.hi)) return false;
        return true;
      };
      var apply = function () {
        var n = 0;
        byLi.forEach(function (r) {
          var ok = pass(r);
          r.li.hidden = !ok;
          if (ok) n++;
        });
        var act = active();
        if (found) found.textContent = act ? 'Подходит ' + n + ' из ' + total + ' на этой странице' : found.getAttribute('data-base');
        if (empty) empty.hidden = n > 0;
        if (fn) { fn.hidden = !act; fn.textContent = String(act); }
        if (showBtn) showBtn.textContent = 'Показать ' + n;
        if (drw) {
          if (A && drwInputs.a) { drwInputs.a.v.textContent = withUnit(A.steps[st.ai], unitA); drwInputs.a.i.parentNode.style.setProperty('--p', (A.steps.length > 1 ? st.ai / (A.steps.length - 1) : 0).toFixed(4)); drwInputs.a.i.setAttribute('aria-valuetext', drwInputs.a.v.textContent); }
          if (B && drwInputs.b) { drwInputs.b.v.textContent = withUnit(B.steps[st.bi], unitB); drwInputs.b.i.parentNode.style.setProperty('--p', (B.steps.length > 1 ? st.bi / (B.steps.length - 1) : 0).toFixed(4)); drwInputs.b.i.setAttribute('aria-valuetext', drwInputs.b.v.textContent); }
          $$('[data-ck-d]', drw).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ck-d') === st.k ? 'true' : 'false'); });
        }
        scale.forEach(function (c) {
          c.setAttribute('aria-pressed', st.lo !== null && parseFloat(c.getAttribute('data-lo')) === st.lo && parseFloat(c.getAttribute('data-hi')) === st.hi ? 'true' : 'false');
        });
      };
      var order = function () {
        var rows = byLi.slice();
        if (st.sort !== 'def') {
          rows.sort(function (x, y) {
            var fx = flt[x.sku] ? flt[x.sku][0] : null, fy = flt[y.sku] ? flt[y.sku][0] : null;
            if (fx === null && fy === null) return x.i - y.i;
            if (fx === null) return 1;
            if (fy === null) return -1;
            return st.sort === 'asc' ? fx - fy || x.i - y.i : fy - fx || x.i - y.i;
          });
        }
        rows.forEach(function (r) { list.appendChild(r.li); });
      };

      /* параметры, видимые только с JS */
      if (openBtn) openBtn.hidden = false;
      if (sortWrap) sortWrap.hidden = false;

      /* классы */
      scale.forEach(function (c) {
        c.addEventListener('click', function () {
          var lo = parseFloat(c.getAttribute('data-lo')), hi = parseFloat(c.getAttribute('data-hi'));
          if (st.lo === lo && st.hi === hi) { st.lo = null; st.hi = null; } else { st.lo = lo; st.hi = hi; }
          apply();
        });
      });
      if (sortSel) sortSel.addEventListener('change', function () { st.sort = sortSel.value; order(); });

      /* ящик */
      var slider = function (key, id, cfg, unit) {
        var g = el('div', 'ck-grp');
        var rw = el('div', 'ck-pf__rw');
        var lb = el('label', '', cfg.label + ', от');
        lb.setAttribute('for', id);
        var v = el('b', '', withUnit(cfg.steps[0], unit));
        rw.appendChild(lb); rw.appendChild(v);
        var rng = el('div', 'ck-rng');
        rng.style.setProperty('--p', '0');
        rng.appendChild(el('i', 'ck-rng__t')); rng.appendChild(el('i', 'ck-rng__f'));
        var inp = doc.createElement('input');
        inp.type = 'range'; inp.id = id; inp.min = '0'; inp.max = String(cfg.steps.length - 1); inp.step = '1'; inp.value = '0';
        inp.addEventListener('input', function () { st[key] = parseInt(inp.value, 10) || 0; apply(); });
        rng.appendChild(inp);
        var ends = el('div', 'ck-pf__ends');
        ends.appendChild(el('span', '', withUnit(cfg.steps[0], unit)));
        ends.appendChild(el('span', '', withUnit(cfg.steps[cfg.steps.length - 1], unit)));
        g.appendChild(rw); g.appendChild(rng); g.appendChild(ends);
        drwInputs[key === 'ai' ? 'a' : 'b'] = { i: inp, v: v };
        return g;
      };
      if (drw && body) {
        if (A && A.steps.length > 1) body.appendChild(slider('ai', 'ck-da', A, unitA));
        if (B && B.steps.length > 1) body.appendChild(slider('bi', 'ck-db', B, unitB));
        if (D && D.opts && D.opts.length) {
          var g = el('div', 'ck-grp');
          g.appendChild(el('span', 'ck-grp__tl', D.label));
          var tg = el('div', 'ck-tg');
          D.opts.forEach(function (o) {
            var b = el('button', 'ck-chp');
            b.type = 'button';
            b.setAttribute('data-ck-d', o.k);
            b.setAttribute('aria-pressed', 'false');
            b.appendChild(doc.createTextNode(o.t + ' '));
            b.appendChild(el('em', '', String(o.n)));
            b.addEventListener('click', function () { st.k = st.k === o.k ? '' : o.k; apply(); });
            tg.appendChild(b);
          });
          g.appendChild(tg);
          body.appendChild(g);
        }
        if (!body.children.length && openBtn) openBtn.hidden = true;
      }
      var lastFocus = null;
      var openDrw = function () {
        if (!drw) return;
        lastFocus = doc.activeElement;
        drw.removeAttribute('inert');
        drw.setAttribute('aria-hidden', 'false');
        drw.classList.add('is-on');
        if (scrim) scrim.classList.add('is-on');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
        var first = $('input, button', body);
        setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, 60);
      };
      var closeDrw = function (back) {
        if (!drw || !drw.classList.contains('is-on')) return;
        drw.classList.remove('is-on');
        drw.setAttribute('aria-hidden', 'true');
        drw.setAttribute('inert', '');
        if (scrim) scrim.classList.remove('is-on');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        if (back !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      };
      if (openBtn) openBtn.addEventListener('click', openDrw);
      $$('[data-ck-close]', cat).forEach(function (b) { b.addEventListener('click', function () { closeDrw(); }); });
      if (scrim) scrim.addEventListener('click', function () { closeDrw(); });
      if (resetBtn) resetBtn.addEventListener('click', function () {
        st.ai = 0; st.bi = 0; st.k = ''; st.lo = null; st.hi = null;
        if (drwInputs.a) drwInputs.a.i.value = '0';
        if (drwInputs.b) drwInputs.b.i.value = '0';
        apply();
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drw && drw.classList.contains('is-on')) { e.preventDefault(); closeDrw(); }
      });

      /* сравнение до трёх моделей */
      var cmp = [];
      var tray = $('[data-ck-tray]', cat);
      var slots = $('[data-ck-slots]', tray || doc);
      var cn = $('[data-ck-cn]', tray || doc);
      var cmpOpen = $('[data-ck-cmp-open]', tray || doc);
      var dlg = $('[data-ck-cmp-dlg]');
      var dlgBody = dlg ? $('[data-ck-cmp-body]', dlg) : null;
      var cmpBtns = $$('[data-ck-cmp]', cat);
      var cd = cdata.cmp || {};
      var MAX = 3;
      var renderTray = function () {
        if (!tray) return;
        var n = cmp.length;
        if (n > 0) {
          tray.hidden = false;
          requestAnimationFrame(function () { tray.classList.add('is-on'); });
        } else {
          tray.classList.remove('is-on');
          setTimeout(function () { if (!cmp.length) tray.hidden = true; }, reduce ? 0 : 280);
        }
        if (cn) cn.textContent = n + ' из ' + MAX + ' моделей';
        if (cmpOpen) cmpOpen.disabled = n < 2;
        if (slots) {
          slots.textContent = '';
          for (var i = 0; i < MAX; i++) {
            var sku = cmp[i];
            var s = el('div', 'ck-slot' + (sku ? '' : ' is-empty'));
            if (sku && cd[sku]) {
              var tm = el('span', 'ck-slot__tm');
              if (cd[sku].i) { var im = doc.createElement('img'); im.src = cd[sku].i; im.alt = ''; tm.appendChild(im); } else { tm.appendChild(doc.createTextNode(cd[sku].p ? cd[sku].p.charAt(0) : '')); }
              s.appendChild(tm);
              s.appendChild(el('span', 'ck-slot__s ck-mono', sku));
            } else {
              s.textContent = 'Добавьте модель';
            }
            slots.appendChild(s);
          }
        }
        cmpBtns.forEach(function (b) {
          var sku = b.getAttribute('data-ck-cmp');
          var on = cmp.indexOf(sku) >= 0;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.disabled = !on && cmp.length >= MAX;
          var card = b.closest('.ck-card');
          if (card) card.classList.toggle('is-sel', on);
        });
      };
      cmpBtns.forEach(function (b) {
        b.hidden = false;
        b.addEventListener('click', function () {
          var sku = b.getAttribute('data-ck-cmp');
          var i = cmp.indexOf(sku);
          if (i >= 0) cmp.splice(i, 1); else if (cmp.length < MAX) cmp.push(sku);
          renderTray();
        });
      });
      var clearBtn = $('[data-ck-clear]', cat);
      if (clearBtn) clearBtn.addEventListener('click', function () { cmp = []; renderTray(); });
      var dlgLast = null;
      var closeDlg = function () {
        if (!dlg || dlg.hidden) return;
        dlg.hidden = true;
        doc.body.style.overflow = '';
        if (dlgLast && dlgLast.focus) dlgLast.focus();
      };
      var buildDlg = function () {
        dlgBody.textContent = '';
        var g = el('div', 'ck-cmp__g');
        g.style.setProperty('--n', String(cmp.length));
        g.appendChild(el('div', 'ck-cmp__h'));
        cmp.forEach(function (sku) {
          var c = cd[sku] || { n: sku, u: '', i: '', p: '', s: [] };
          var h = el('div', 'ck-cmp__h');
          var ph = el('div', 'ck-cmp__ph');
          if (c.i) { var im = doc.createElement('img'); im.src = c.i; im.alt = ''; ph.appendChild(im); } else if (c.p) { ph.appendChild(el('span', '', c.p)); }
          h.appendChild(ph);
          h.appendChild(el('span', 'ck-mono', sku));
          var a = el('a', '', c.n);
          if (c.u) a.href = c.u;
          h.appendChild(a);
          g.appendChild(h);
        });
        var labels = [];
        cmp.forEach(function (sku) { ((cd[sku] || {}).s || []).forEach(function (r) { if (labels.indexOf(r[0]) < 0) labels.push(r[0]); }); });
        labels.slice(0, 24).forEach(function (lb) {
          g.appendChild(el('div', 'ck-cmp__c is-k', lb));
          var vals = cmp.map(function (sku) {
            var row = ((cd[sku] || {}).s || []).filter(function (r) { return r[0] === lb; })[0];
            return row ? row[1] : '';
          });
          vals.forEach(function (v) { g.appendChild(el('div', 'ck-cmp__c is-v', v || '—')); });
        });
        dlgBody.appendChild(g);
      };
      if (cmpOpen && dlg && dlgBody) {
        cmpOpen.addEventListener('click', function () {
          if (cmp.length < 2) return;
          dlgLast = cmpOpen;
          buildDlg();
          dlg.hidden = false;
          doc.body.style.overflow = 'hidden';
          var x = $('[data-ck-cmp-close]', dlg);
          if (x) x.focus();
        });
        $$('[data-ck-cmp-close]', dlg).forEach(function (b) { b.addEventListener('click', closeDlg); });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
        dlg.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { e.preventDefault(); closeDlg(); return; }
          if (e.key !== 'Tab') return;
          var f = $$('a[href], button:not([disabled])', dlg);
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        });
      }
      apply();
      renderTray();
    })();
  }

  /* ---------- карточка товара: вкладки на компьютере, аккордеон на телефоне ---------- */
  var ptabs = $('[data-ck-ptabs]');
  var pnl = $('.ck-pnl');
  if (ptabs && pnl) {
    var links = $$('[data-ck-tab]', ptabs);
    var nav = $('.ck-tabs2', ptabs);
    var panes = $$('.ck-pn', pnl);
    var byId = {};
    panes.forEach(function (p) { byId[p.id] = p; });
    var narrow = window.matchMedia('(max-width: 760px)');
    var cur = 0;
    var showTab = function (i, hash) {
      cur = i;
      links.forEach(function (a, k) {
        var on = k === i;
        a.classList.toggle('is-on', on);
        if (on) a.setAttribute('aria-selected', 'true'); else a.setAttribute('aria-selected', 'false');
        a.tabIndex = on ? 0 : -1;
      });
      if (nav) nav.style.setProperty('--i', String(i));
      panes.forEach(function (p) { p.hidden = p.id !== links[i].getAttribute('data-ck-tab'); });
      if (hash) { try { history.replaceState(null, '', '#' + links[i].getAttribute('data-ck-tab')); } catch (e) { /* адрес не меняем */ } }
    };
    var accOpen = function (p, on) {
      var b = $('.ck-pn__h button', p), body2 = $('.ck-pn__b', p);
      if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (body2) body2.hidden = !on;
    };
    var mode = function () {
      if (narrow.matches) {
        pnl.classList.remove('is-tabs');
        pnl.classList.add('is-acc');
        panes.forEach(function (p, k) { p.hidden = false; accOpen(p, k === 0); });
      } else {
        pnl.classList.remove('is-acc');
        pnl.classList.add('is-tabs');
        panes.forEach(function (p) {
          var b = $('.ck-pn__h button', p), body2 = $('.ck-pn__b', p);
          if (b) b.setAttribute('aria-expanded', 'true');
          if (body2) body2.hidden = false;
        });
        showTab(cur, false);
      }
    };
    links.forEach(function (a, i) {
      a.setAttribute('role', 'tab');
      a.addEventListener('click', function (e) {
        if (narrow.matches) return;
        e.preventDefault();
        showTab(i, true);
      });
      a.addEventListener('keydown', function (e) {
        var n = links.length, to = -1;
        if (e.key === 'ArrowRight') to = (i + 1) % n;
        else if (e.key === 'ArrowLeft') to = (i - 1 + n) % n;
        if (to >= 0) { e.preventDefault(); showTab(to, true); links[to].focus(); }
      });
    });
    if (nav) nav.setAttribute('role', 'tablist');
    panes.forEach(function (p) {
      var b = $('.ck-pn__h button', p);
      if (b) b.addEventListener('click', function () {
        if (!narrow.matches) return;
        accOpen(p, b.getAttribute('aria-expanded') !== 'true');
      });
    });
    var h = (location.hash || '').slice(1);
    links.forEach(function (a, i) { if (a.getAttribute('data-ck-tab') === h) cur = i; });
    mode();
    if (narrow.addEventListener) narrow.addEventListener('change', mode); else if (narrow.addListener) narrow.addListener(mode);
  }
  /* хлебные крошки на телефоне прокручиваются по горизонтали: показываем конец цепочки (текущую страницу) */
  $$('.crumbs ol').forEach(function (ol) {
    if (ol.scrollWidth > ol.clientWidth + 1) ol.scrollLeft = ol.scrollWidth;
  });
})();
