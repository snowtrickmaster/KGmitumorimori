let rows = [];
let rowId = 0;

// ── 行追加 ──
function addRow() {
  const id = rowId++;
  rows.push({ id, date: '', name: '', count: '1', from: '', to: '', place: '', scene: '', price: '', note: '' });
  renderEditor();
  renderPreview();
}

// ── 行削除 ──
function removeRow(id) {
  rows = rows.filter(r => r.id !== id);
  renderEditor();
  renderPreview();
}

// ── 行更新 ──
function updateRow(id, field, val) {
  const r = rows.find(r => r.id === id);
  if (r) r[field] = val;
  renderPreview();
}

// ── HTML エスケープ ──
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── フィールド生成 ──
function inp(label, field, id, placeholder, type = 'text') {
  const val = rows.find(r => r.id === id)?.[field] || '';
  return `
    <div class="field-group">
      <label>${label}</label>
      <input type="${type}" value="${esc(val)}" placeholder="${placeholder}"
        oninput="updateRow(${id}, '${field}', this.value)" />
    </div>`;
}

// ── 左パネルの明細行を描画 ──
function renderEditor() {
  const c = document.getElementById('rows-container');
  c.innerHTML = rows.map(r => `
    <div class="row-editor">
      <button class="del" onclick="removeRow(${r.id})" aria-label="削除">×</button>
      <div class="row-grid">
        <div>${inp('月日', 'date', r.id, '7/12')}</div>
        <div>${inp('名前', 'name', r.id, '古山 彩美')}</div>
        <div>${inp('人数', 'count', r.id, '1', 'number')}</div>
        <div>${inp('開始時間', 'from', r.id, '9:00')}</div>
        <div>${inp('終了時間', 'to', r.id, '17:45')}</div>
        <div>${inp('場所', 'place', r.id, '江東区')}</div>
        <div>${inp('シーン', 'scene', r.id, '試験')}</div>
        <div>${inp('単価', 'price', r.id, '50000', 'number')}</div>
        <div class="wide">${inp('備考', 'note', r.id, '')}</div>
      </div>
    </div>
  `).join('');
}

// ── 令和の日付 ──
function fmtDate() {
  const d = new Date();
  const reiwa = d.getFullYear() - 2018;
  return `令和　${reiwa}　年　　${d.getMonth() + 1}　月　${d.getDate()}　日`;
}

// ── プレビューを描画 ──
function renderPreview() {
  const g = id => document.getElementById(id)?.value || '';

  document.getElementById('p-to').textContent = g('to') || '宛先';
  document.getElementById('p-project').textContent = g('project') || '案件名';
  document.getElementById('p-date').textContent = fmtDate();

  const taxrate = parseFloat(document.getElementById('taxrate')?.value) || 10;
  let subtotal = 0;

  // 明細行
  let html = '';
  rows.forEach(r => {
    const price = parseFloat(r.price) || 0;
    const count = parseInt(r.count) || 1;
    const total = price * count;
    subtotal += total;
    html += `<tr>
      <td>${esc(r.date)}</td>
      <td class="left">${esc(r.name)}</td>
      <td>${esc(r.count)}</td>
      <td>${esc(r.from)}</td>
      <td>〜</td>
      <td>${esc(r.to)}</td>
      <td>${esc(r.place)}</td>
      <td>${esc(r.scene)}</td>
      <td class="right">${price ? price.toLocaleString() : ''}</td>
      <td class="right">${total ? total.toLocaleString() : ''}</td>
      <td class="left">${esc(r.note)}</td>
    </tr>`;
  });

  // 以下余白 + 空行
  if (rows.length > 0) {
    html += `<tr><td class="left" colspan="11">以下余白</td></tr>`;
  }
  const filled = rows.length + (rows.length > 0 ? 1 : 0);
  const emptyCount = Math.max(20 - filled, 0);
  for (let i = 0; i < emptyCount; i++) {
    html += `<tr>${'<td></td>'.repeat(11)}</tr>`;
  }

  document.getElementById('p-rows').innerHTML = html;

  // フッター（出演料・消費税・総計）
  const tax = Math.round(subtotal * taxrate / 100);
  const grand = subtotal + tax;

  document.getElementById('p-foot').innerHTML = `
    <tr>
      <td colspan="9" style="border:none;"></td>
      <td class="label">出演料</td>
      <td class="val">${subtotal.toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="9" style="border:none;"></td>
      <td class="label">消費税　${taxrate} %</td>
      <td class="val">${tax.toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="9" style="border:none;"></td>
      <td class="label">総計</td>
      <td class="val">¥${grand.toLocaleString()}</td>
    </tr>
  `;

  document.getElementById('p-total').textContent = `¥${grand.toLocaleString()}`;
}

// ── PDF ダウンロード ──
async function downloadPDF() {
  const btn = document.getElementById('dl-btn');
  btn.disabled = true;
  btn.textContent = '生成中...';

  try {
    const el = document.getElementById('quote-paper');
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    let w = pageW - 10;
    let h = w / ratio;
    if (h > pageH - 10) { h = pageH - 10; w = h * ratio; }

    pdf.addImage(imgData, 'PNG', (pageW - w) / 2, 5, w, h);

    const project = document.getElementById('project')?.value || '見積書';
    pdf.save(`${project}_見積書.pdf`);
  } catch (e) {
    alert('PDF生成に失敗しました: ' + e.message);
  }

  btn.disabled = false;
  btn.textContent = '↓ PDFをダウンロード';
}

// ── クリア ──
function clearAll() {
  if (!confirm('宛先・案件名・明細行をすべてリセットしますか？')) return;
  document.getElementById('to').value = '';
  document.getElementById('project').value = '';
  rows = [];
  rowId = 0;
  renderEditor();
  renderPreview();
}

// ── イベントリスナー ──
['to', 'project', 'taxrate'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', renderPreview);
});

// ── 初期化 ──
addRow();
renderPreview();
