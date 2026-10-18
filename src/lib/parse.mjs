// Parses content/copy.md (exported from the approved copy doc) into page objects.
// Each "## Page" becomes { name, meta, intro, sections: [{ key, name, blocks }] }.
// Blocks: field {key,value} · item {lead,text} · ol {items} · table {head,rows} ·
// faq {q,a} · p {text} · card {label} · code {lang,text}

const FIELD_KEYS = new Set([
  'Label', 'H1', 'H2', 'H3', 'Subhead', 'Body', 'Outcomes', 'Form headline', 'Submit', 'Stats',
  'Breadcrumb', 'Buttons', 'Button', 'What changes', 'Usually next', 'Link', 'Links', 'Card link',
  'Secondary link', 'Line', 'Intro', 'Evaluate', 'Lead', 'Deliver', 'Proof callouts', 'Steps',
  'For agencies', 'Expertise', 'Email line', 'Location line', 'Form B labels', 'What happens next',
  'Scheduler label', 'While you wait', 'Topics', 'Featured label', 'Card meta', 'Pagination', 'Dek',
  'Byline', 'Author box', 'Headline', 'Fields', 'Dropdown options', 'Microcopy', 'Errors',
  'Sending state', 'Industries line', 'Start-here box', 'Box', 'Columns', 'Legal line',
  'Body (optional)', 'URL', 'Descriptor', 'Services used', 'Source line', 'Optional line',
  'Challenge', 'Approach', 'Results', 'Proof'
]);

export function cleanInline(s) {
  return s
    .replace(/\*{4}/g, '')          // stray empty bold runs from the doc export
    .replace(/\\\[/g, '[').replace(/\\\]/g, ']')
    .replace(/\\\|/g, '|')
    .trim();
}

function splitRow(line) {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = []; let cur = ''; let esc = false;
  for (const ch of inner) {
    if (esc) { cur += ch; esc = false; continue; }
    if (ch === '\\') { cur += ch; esc = true; continue; }
    if (ch === '|') { cells.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur);
  return cells.map(c => cleanInline(c));
}

function parseLeadText(s) {
  const m = s.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
  if (m) return { lead: cleanInline(m[1]), text: cleanInline(m[2]) };
  return { lead: '', text: cleanInline(s) };
}

export function parseCopy(md) {
  const lines = md.replace(/\r/g, '').replace(/\*{4}/g, '').split('\n');
  const pages = []; let page = null; let section = null;
  let i = 0;
  const push = (b) => {
    if (!page) return;
    if (!section) { section = { key: '_intro', name: '', blocks: [] }; page.sections.push(section); }
    section.blocks.push(b);
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^## /.test(line)) {
      page = { name: cleanInline(line.slice(3)), meta: {}, sections: [] }; pages.push(page); section = null; i++; continue;
    }
    if (/^### /.test(line)) {
      const t = cleanInline(line.slice(4));
      const m = t.match(/^([A-Z]{1,2}\d+(?:[–-][A-Z]?\d+)?)\s*·\s*(.*)$/);
      section = { key: m ? m[1] : t, name: m ? m[2] : t, blocks: [] };
      if (page) page.sections.push(section);
      i++; continue;
    }
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim(); const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; push({ type: 'code', lang, text: buf.join('\n') }); continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const parsed = rows.filter(r => !/^\|\s*-{3,}/.test(r)).map(splitRow);
      const head = parsed[0];
      const body = parsed.slice(1);
      // Page meta table: "Field | Copy" before any section
      if (head && head[0] === 'Field' && head[1] === 'Copy' && page && !page.sections.some(s => s.key !== '_intro')) {
        for (const r of body) page.meta[r[0]] = r[1];
        continue;
      }
      push({ type: 'table', head, rows: body });
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(parseLeadText(lines[i].replace(/^\d+\.\s+/, ''))); i++;
      }
      push({ type: 'ol', items }); continue;
    }
    if (/^- /.test(line)) {
      const raw = line.slice(2);
      const fm = raw.match(/^([^*:(][^:(]{0,40}?)(?:\s*\([^)]*\))?:\s*(.*)$/);
      if (fm && FIELD_KEYS.has(fm[1].trim())) {
        push({ type: 'field', key: fm[1].trim(), value: cleanInline(fm[2]) });
      } else if (/^\*\*/.test(raw)) {
        push({ type: 'item', ...parseLeadText(raw) });
      } else {
        push({ type: 'li', text: cleanInline(raw) });
      }
      i++; continue;
    }
    if (line.trim() === '') { i++; continue; }
    // Paragraph (possibly FAQ question)
    const t = line.trim();
    const qm = t.match(/^\*\*(.+?\?)\*\*\s*(.*)$/);
    if (qm) {
      let a = qm[2];
      if (!a) { // answer is the next non-empty paragraph
        let j = i + 1; while (j < lines.length && lines[j].trim() === '') j++;
        a = lines[j] || ''; i = j;
      }
      push({ type: 'faq', q: cleanInline(qm[1]), a: cleanInline(a) }); i++; continue;
    }
    const cm = t.match(/^\*\*(Card \d+)\*\*\s*·\s*(.*)$/);
    if (cm) { push({ type: 'card', label: cleanInline(cm[2]) }); i++; continue; }
    const hm = t.match(/^\*\*([^*]+)\*\*$/);
    if (hm) { push({ type: 'subhead', text: cleanInline(hm[1]) }); i++; continue; }
    push({ type: 'p', text: cleanInline(t) }); i++;
  }
  return pages;
}

// Helpers used by templates
export const sec = (page, key) => page.sections.find(s => s.key === key) || { blocks: [] };
export const field = (s, key) => (s.blocks.find(b => b.type === 'field' && b.key === key) || {}).value;
export const fields = (s, key) => s.blocks.filter(b => b.type === 'field' && b.key === key).map(b => b.value);
export const ofType = (s, type) => s.blocks.filter(b => b.type === type);
export const first = (s, type) => s.blocks.find(b => b.type === type);
