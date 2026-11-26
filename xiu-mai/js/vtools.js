/* Xíu Mại: interactive tools under a subtitled video (like the Chinese video site, adapted for English + toddlers).
   XMTools.mount(lines, P) — lines: [{s,e,t,vi}], P: {time, seek, play, pause, rate} */
(function () {
  const norm = s => (s || '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = s => norm(s).split(' ').filter(Boolean);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const STOP = new Set('a an the and or but to of in on at for is are was were be am i you he she it we they me my your his her its our their this that these those with so do does did not no yes oh ah la na hey ok okay'.split(' '));
  const MODES = [
    ['sh', '🎬', 'Shadowing', 'Xem phụ đề, nghe lại từng câu'],
    ['pa', '🎤', 'Phát âm', 'Nói vào micro, web chấm từng chữ'],
    ['ln', '👂', 'Luyện nghe', 'Nghe rồi gõ lại câu'],
    ['dt', '🧩', 'Điền từ', 'Nghe và chọn từ còn thiếu'],
    ['lt', '📚', 'Luyện tập', 'Từ vựng có hình, đố vui'],
  ];

  function mount(lines, P) {
    const { esc, say, toast, cheer, bump, wsrc, ALL } = window.XM;
    const kar = document.getElementById('kar'), list = document.getElementById('slist');
    if (!kar || !list || document.getElementById('vtabs')) return;
    lines = lines.filter(l => /[a-z]/i.test(l.t));
    if (!lines.length) return;
    let mode = 'sh', idx = 0, stopAt = null, eachStop = false;
    const tabs = document.createElement('div'); tabs.className = 'vtabs'; tabs.id = 'vtabs';
    tabs.innerHTML = MODES.map(m => `<button data-m="${m[0]}" class="${m[0] === mode ? 'on' : ''}"><span>${m[1]}</span>${m[2]}</button>`).join('');
    kar.parentNode.insertBefore(tabs, kar);
    const shc = document.createElement('div'); shc.className = 'vctl'; shc.id = 'vctl';
    shc.innerHTML = `<button id="vrep">🔁 Nghe lại</button><button id="veach">✋ Dừng từng câu</button><button id="vslow">🐢 Chậm</button>`;
    kar.parentNode.insertBefore(shc, kar.nextSibling);
    const panel = document.createElement('div'); panel.className = 'vpanel'; panel.id = 'vpanel'; panel.hidden = true;
    list.parentNode.insertBefore(panel, list.nextSibling);

    const curLine = () => { const t = P.time() || 0; let i = 0; for (let k = 0; k < lines.length; k++) if (lines[k].s <= t + 0.05) i = k; return i; };
    const playLine = i => { const l = lines[i]; if (!l) return; stopAt = l.e + 0.15; P.seek(l.s); P.play(); };
    const watch = setInterval(() => {
      if (!document.body.contains(tabs)) return clearInterval(watch);
      let t = 0; try { t = P.time() || 0; } catch (e) {}
      if (stopAt != null && t >= stopAt) { stopAt = null; try { P.pause(); } catch (e) {} }
      if (eachStop && mode === 'sh' && stopAt == null) { const i = curLine(); const l = lines[i]; if (l && t >= l.e - 0.05 && t < l.e + 0.3 && watch._last !== i) { watch._last = i; try { P.pause(); } catch (e) {} } }
    }, 100);

    shc.querySelector('#vrep').onclick = () => playLine(curLine());
    shc.querySelector('#veach').onclick = e => { eachStop = !eachStop; e.currentTarget.classList.toggle('on', eachStop); toast(eachStop ? 'Video sẽ dừng sau mỗi câu để bé nói theo' : 'Video chạy liên tục'); };
    let slow = false;
    shc.querySelector('#vslow').onclick = e => { slow = !slow; try { P.rate(slow ? 0.75 : 1); } catch (x) {} e.currentTarget.classList.toggle('on', slow); };

    const nav = () => `<div class="vnav"><button class="vb" id="vprev" ${idx ? '' : 'disabled'}>‹</button><span>Câu ${idx + 1}/${lines.length}</span><button class="vb" id="vnext" ${idx < lines.length - 1 ? '' : 'disabled'}>›</button></div>`;
    const bindNav = () => { const p = panel.querySelector('#vprev'), n = panel.querySelector('#vnext'); if (p) p.onclick = () => { idx = Math.max(0, idx - 1); render(); }; if (n) n.onclick = () => { idx = Math.min(lines.length - 1, idx + 1); render(); }; };
    const viOf = l => l.vi ? `<div class="vvi">${esc(l.vi)}</div>` : '';

    function render() {
      tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
      const sh = mode === 'sh';
      kar.hidden = !sh; list.hidden = !sh; shc.hidden = !sh; panel.hidden = sh;
      if (sh) return;
      const l = lines[idx];
      if (mode === 'pa') {
        panel.innerHTML = `${nav()}<div class="vcard"><div class="vline" id="pal">${words(l.t).length ? l.t.split(/\s+/).map(w => `<span class="pw">${esc(w)}</span>`).join(' ') : esc(l.t)}</div>${viOf(l)}
          <div class="vbtns"><button class="btn alt" id="pah">🔊 Nghe mẫu</button><button class="btn" id="pam">🎤 Bé đọc</button></div>
          <div class="vres" id="par">${window.XMCanHear ? 'Bấm 🎤 rồi đọc to câu trên.' : 'Máy này chưa nghe được micro trên web. Ba mẹ nghe bé đọc rồi bấm 👍 nhé.'}</div>
          <button class="btn yes" id="paok">👍 Bé nói được rồi</button></div>`;
        bindNav();
        panel.querySelector('#pah').onclick = () => playLine(idx);
        panel.querySelector('#paok').onclick = () => { cheer('Great talking!', true); };
        const mic = panel.querySelector('#pam');
        if (!window.XMCanHear) mic.disabled = true; else mic.onclick = () => listen(l, mic);
      } else if (mode === 'ln') {
        panel.innerHTML = `${nav()}<div class="vcard"><div class="vbtns"><button class="btn" id="lnh">🔊 Nghe câu</button><button class="btn alt" id="lns">🐢 Đọc chậm</button></div>
          <textarea id="lni" rows="2" placeholder="Gõ lại câu vừa nghe…" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>
          <div class="vbtns"><button class="btn yes" id="lnc">✔ Kiểm tra</button><button class="btn alt" id="lna">👀 Xem đáp án</button></div><div class="vres" id="lnr"></div></div>`;
        bindNav();
        panel.querySelector('#lnh').onclick = () => playLine(idx);
        panel.querySelector('#lns').onclick = () => say(l.t, { rate: 0.6 });
        panel.querySelector('#lnc').onclick = () => {
          const got = new Set(words(panel.querySelector('#lni').value)); const tw = l.t.split(/\s+/);
          const ok = tw.filter(w => !norm(w) || got.has(norm(w))).length;
          panel.querySelector('#lnr').innerHTML = `<div class="vline">${tw.map(w => `<span class="pw ${!norm(w) || got.has(norm(w)) ? 'good' : 'bad'}">${esc(w)}</span>`).join(' ')}</div>${viOf(l)}<b>${Math.round(ok / tw.length * 100)}% đúng</b>`;
          if (ok === tw.length) cheer('Perfect!', true);
        };
        panel.querySelector('#lna').onclick = () => { panel.querySelector('#lnr').innerHTML = `<div class="vline">${esc(l.t)}</div>${viOf(l)}`; };
      } else if (mode === 'dt') {
        const tw = l.t.split(/\s+/);
        const cand = tw.map((w, k) => [norm(w), k]).filter(([w]) => w.length >= 3 && !STOP.has(w) && !w.includes("'"));
        if (!cand.length) { panel.innerHTML = `${nav()}<div class="vcard"><div class="vres">Câu này ngắn quá, bấm › để qua câu khác nhé.</div></div>`; bindNav(); return; }
        const [ans, k] = cand.sort((a, b) => b[0].length - a[0].length)[0];
        const pool = [...new Set(lines.flatMap(x => words(x.t)).filter(w => w.length >= 3 && !STOP.has(w) && w !== ans))];
        const opts = [ans, ...pool.sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
        panel.innerHTML = `${nav()}<div class="vcard"><div class="vline">${tw.map((w, j) => j === k ? '<span class="blank">____</span>' : esc(w)).join(' ')}</div>${viOf(l)}
          <div class="vbtns"><button class="btn alt" id="dth">🔊 Nghe câu</button></div><div class="vopts">${opts.map(o => `<button class="vopt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
        bindNav();
        panel.querySelector('#dth').onclick = () => playLine(idx);
        panel.querySelectorAll('.vopt').forEach(b => b.onclick = () => {
          if (b.dataset.o === ans) { b.classList.add('good'); panel.querySelector('.blank').textContent = tw[k]; say(ans); cheer('Yes!', true); setTimeout(() => { if (idx < lines.length - 1) { idx++; render(); } }, 1600); }
          else { b.classList.add('bad'); say('Try again!'); }
        });
      } else if (mode === 'lt') {
        const seen = new Set(), voc = [];
        lines.forEach(x => words(x.t).forEach(w => {
          const base = [w, w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, '')];
          const hit = base.map(b => ALL.find(a => a.en.toLowerCase() === b)).find(Boolean);
          if (hit && !seen.has(hit.en) && !STOP.has(w)) { seen.add(hit.en); voc.push(hit); }
        }));
        if (!voc.length) { panel.innerHTML = `<div class="vcard"><div class="vres">Video này chưa có từ nào trùng với kho hình của Xíu Mại. Bé thử phần Shadowing hoặc Điền từ nhé.</div></div>`; return; }
        panel.innerHTML = `<div class="vcard"><h4>📚 ${voc.length} từ có trong video</h4><div class="vvoc">${voc.map((w, i) => `<button class="vw" data-i="${i}"><img src="${wsrc([w.en, w.vi, w.img])}" alt=""><b>${esc(w.en)}</b><small>${esc(w.vi)}</small></button>`).join('')}</div>
          ${voc.length >= 3 ? '<button class="btn" id="ltq">🎯 Đố vui: nghe và chọn hình</button>' : ''}<div id="ltz"></div></div>`;
        panel.querySelectorAll('.vw').forEach(b => b.onclick = () => { const w = voc[b.dataset.i]; say(w.en); bump('words', w.en); });
        const q = panel.querySelector('#ltq'); if (q) q.onclick = () => quiz(voc);
      }
    }
    function quiz(voc) {
      const z = panel.querySelector('#ltz'); const ans = voc[Math.floor(Math.random() * voc.length)];
      const opts = [ans, ...voc.filter(w => w !== ans).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
      z.innerHTML = `<div class="vquiz"><button class="btn alt" id="lqh">🔊 Nghe lại</button><div class="vvoc">${opts.map(w => `<button class="vw" data-e="${esc(w.en)}"><img src="${wsrc([w.en, w.vi, w.img])}" alt=""></button>`).join('')}</div></div>`;
      const hear = () => say('Where is the ' + ans.en + '?'); hear(); z.querySelector('#lqh').onclick = hear;
      z.querySelectorAll('.vw').forEach(b => b.onclick = () => {
        if (b.dataset.e === ans.en) { b.classList.add('good'); cheer('Yes! ' + ans.en + '!', true); setTimeout(() => quiz(voc), 1500); }
        else { b.classList.add('bad'); say('Try again!'); }
      });
    }
    const hst = {};
    async function listen(l, btn) {
      const out = panel.querySelector('#par');
      btn.disabled = true; btn.textContent = '👂 Đang nghe…'; out.textContent = '👂 Đọc to nào!';
      try { P.pause(); } catch (e) {}
      const h = await XMHear(l.t);
      if (!document.body.contains(btn)) return; btn.disabled = false; btn.textContent = '🎤 Bé đọc';
      const spans = panel.querySelectorAll('#pal .pw'); let ok = 0, n = 0;
      if (h.heard) { const heard = new Set(words(h.heard));
        spans.forEach(s => { const w = norm(s.textContent); if (!w) return; n++; const g = heard.has(w); if (g) ok++; s.classList.toggle('good', g); s.classList.toggle('bad', !g); }); }
      const r = XMHearPass(h, hst);
      if (r) { const pc = n ? Math.round(ok / n * 100) : 0;
        out.innerHTML = (h.heard ? `Xíu Mại nghe: “${esc(h.heard)}”<br>` : '') + (r === 'good' ? '🌟 Giỏi quá!' : '💪 Bé cố gắng giỏi lắm!');
        cheer(r === 'good' && (!n || pc >= 50) ? 'Excellent!' : 'Good try!', true); return; }
      out.innerHTML = XMHearMsg(h);
    }
    tabs.querySelectorAll('button').forEach(b => b.onclick = () => { if (mode === 'sh' && b.dataset.m !== 'sh') idx = curLine(); mode = b.dataset.m; render(); });
    render();
  }
  window.XMTools = { mount };
})();
