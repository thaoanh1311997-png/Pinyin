/* Linh vật "Sổ": cuốn sổ cái xanh có mặt cười, tay vẫy. */
(function () {
  'use strict';
  const SVG = `<svg class="mascot" viewBox="0 0 120 112" aria-hidden="true"><defs><linearGradient id="skG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DEDC9"/><stop offset=".55" stop-color="#4CC895"/><stop offset="1" stop-color="#22A06F"/></linearGradient></defs>
<ellipse cx="58" cy="105" rx="36" ry="4.5" fill="#000" opacity=".13"/>
<ellipse cx="44" cy="99" rx="7.5" ry="5" fill="#16795A"/><ellipse cx="72" cy="99" rx="7.5" ry="5" fill="#16795A"/>
<rect x="26" y="25" width="80" height="70" rx="14" fill="#FFF6DE" stroke="#16795A" stroke-width="2.6"/>
<path d="M100 34v52M95 31v58" stroke="#E9D9AE" stroke-width="2" stroke-linecap="round"/>
<path d="M76 24V8l6 5 6-5v16" fill="#F25F5C" stroke="#B83A3A" stroke-width="2.2" stroke-linejoin="round"/>
<rect x="14" y="22" width="80" height="74" rx="16" fill="url(#skG)" stroke="#16795A" stroke-width="2.8"/>
<rect x="14" y="22" width="13" height="74" rx="6" fill="#F5C04A" stroke="#16795A" stroke-width="2.4"/>
<path d="M33 30c6-3 14-4 22-4" stroke="#E4FFF3" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>
<rect x="40" y="34" width="38" height="13" rx="6.5" fill="#fff" opacity=".92"/><text x="59" y="44" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="9.5" fill="#16795A">₫ 2026</text>
<g class="skEye"><ellipse cx="47" cy="63" rx="5.6" ry="7" fill="#22302B"/><ellipse cx="71" cy="63" rx="5.6" ry="7" fill="#22302B"/><circle cx="49" cy="60" r="2.4" fill="#fff"/><circle cx="73" cy="60" r="2.4" fill="#fff"/><circle cx="45.5" cy="66" r="1.1" fill="#fff"/><circle cx="69.5" cy="66" r="1.1" fill="#fff"/></g>
<ellipse cx="37" cy="74" rx="6" ry="3.8" fill="#FF7F8A" opacity=".6"/><ellipse cx="81" cy="74" rx="6" ry="3.8" fill="#FF7F8A" opacity=".6"/>
<path d="M53 72q6 2 12 0q-1 8.5-6 8.5t-6-8.5z" fill="#9B2D2D" stroke="#22302B" stroke-width="2" stroke-linejoin="round"/><path d="M55.6 77.6q3.4-2.5 6.8 0q-1 2.6-3.4 2.6t-3.4-2.6z" fill="#FF8C8C"/>
<ellipse cx="10" cy="74" rx="5.5" ry="8" fill="#4CC895" stroke="#16795A" stroke-width="2.4" transform="rotate(-20 10 74)"/>
<g class="skArm"><ellipse cx="102" cy="52" rx="5.5" ry="8.5" fill="#4CC895" stroke="#16795A" stroke-width="2.4" transform="rotate(25 102 52)"/></g>
</svg>`;
  window.KT_MASCOT = SVG;
  const put = () => document.querySelectorAll('[data-mascot]').forEach(el => { if (!el.firstChild) el.innerHTML = SVG; });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', put); else put();

  /* Sáng / tối: nhớ lựa chọn trên máy này. */
  const KEY = 'kt.theme';
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const cur = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const paint = () => document.querySelectorAll('[data-theme-t]').forEach(b => { b.textContent = cur() === 'dark' ? '☀️' : '🌙'; b.title = cur() === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'; });
  const saved = get(); if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-theme-t]')) return;
    const t = cur() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch (er) { /* không lưu được cũng không sao */ }
    paint();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
})();
