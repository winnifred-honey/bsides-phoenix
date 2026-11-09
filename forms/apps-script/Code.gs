/**
 * BSides Phoenix website forms → Notion.
 *
 * Paste this whole file into Google Apps Script and deploy it as a web app
 * (forms/README.md has the steps). The website's four forms send their answers
 * here; this script checks them and adds one row to the matching Notion database.
 *
 * Settings (Project Settings → Script properties), never in this file:
 *   NOTION_TOKEN   the Notion integration secret (required)
 *   NOTIFY_EMAIL   optional; gets a short email with a Notion link for each new submission
 *
 * The script only ever creates new rows in the four databases below. It can't
 * read, change or delete anything else.
 */

const NOTION_VERSION = '2022-06-28';

/* Notion database IDs (BSides Phoenix 2027 Operations page). Not secret: useless without the token. */
const DATABASES = {
  sponsor:   '4af51bd2896d4b6c86a61c783fe329c2', // Sponsor inquiries
  cfp:       'c48e24c8a5a740f2b603056d122612b2', // CFP submissions
  volunteer: 'd00ce5123abd4488bf640b580d4af50f', // Volunteers
  village:   '6f6ab99b773f413c9ff1fb7d967bb6ac'  // Villages
};

/* Dates each form takes submissions, Phoenix time, YYYY-MM-DD ('' = no limit).
   Keep in step with assets/js/forms-config.js on the website. */
const OPEN_WINDOWS = {
  sponsor:   { opens: '',           closes: '' },
  cfp:       { opens: '2026-12-12', closes: '2027-06-30' },
  volunteer: { opens: '2027-07-01', closes: '' },
  village:   { opens: '',           closes: '' }
};

/* After a no-JavaScript submission, people get a link back to the page they came from,
   but only to these sites. */
const ALLOWED_RETURN = [
  'https://winnifred-honey.github.io/bsides-phoenix/',
  'https://bsidesphoenix.org/',
  'https://www.bsidesphoenix.org/'
];

/* What each form sends and where it goes in Notion.
   t: title | text | email | phone | url | select | multi | check | number
   allowed: the only values accepted (stops anyone adding new Notion options)
   map: form value → Notion option name */
const JOBS = ['Registration & check-in', 'Track host / room monitor', 'AV & silent-disco headsets', 'Speaker ops / green room',
  'Village support', 'Sponsor & nonprofit liaison', 'Info desk & wayfinding', 'Photo / video & social', 'Setup & teardown',
  'Safety & code of conduct', 'Pre-event remote help'];
const AREAS = ['Org and admin', 'Comms and tickets', 'Program', 'Budget and sponsors', 'Badges and swag', 'Villages',
  'Volunteers and day-of', 'Venue'];
const AVAILABILITY = ['Before the event', 'Fri Oct 15 · Setup', 'Sat Oct 16 · Morning', 'Sat Oct 16 · Afternoon',
  'Sat Oct 16 · Close & teardown'];
const SHIRTS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'Fitted S', 'Fitted M', 'Fitted L', 'Fitted XL', 'Fitted 2XL'];

const FORMS = {
  sponsor: {
    label: 'Sponsor inquiry',
    fields: [
      { f: 'organization', p: 'Organization', t: 'title', req: true, max: 200 },
      { f: 'name', p: 'Contact name', t: 'text', req: true, max: 200 },
      { f: 'email', p: 'Email', t: 'email', req: true },
      { f: 'phone', p: 'Phone', t: 'phone', max: 40 },
      { f: 'website', p: 'Website', t: 'url' },
      { f: 'tier', p: 'Interested tier', t: 'select', req: true,
        allowed: ['Marquee', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Not sure yet'], map: { 'Not sure yet': 'Not sure' } },
      { f: 'nonprofit', p: 'Paired nonprofit', t: 'text', max: 200 },
      { f: 'message', p: 'Message', t: 'text', max: 2000 }
    ],
    fixed: { 'Status': { status: { name: 'New' } }, 'Source': { select: { name: 'Website form' } } }
  },
  cfp: {
    label: 'CFP submission',
    fields: [
      { f: 'title', p: 'Title', t: 'title', req: true, max: 150 },
      { f: 'format', p: 'Format', t: 'select', req: true, allowed: ['Short talk', 'Session', 'Either length', 'Workshop'],
        map: { 'Short talk': 'Short talk · 25 min', 'Session': 'Session · 50 min', 'Either length': 'Either · 25 or 50 min', 'Workshop': 'Workshop · 1 h 50 min' } },
      { f: 'level', p: 'Level', t: 'select', req: true, allowed: ['Beginner', 'Intermediate', 'Advanced'] },
      { f: 'talk_history', p: 'Talk history', t: 'select', req: true, allowed: ['Original', 'Written for this audience', 'Given before'] },
      { f: 'given_before_at', p: 'Given before at', t: 'text', max: 300 },
      { f: 'abstract', p: 'Abstract', t: 'text', req: true, max: 1500 },
      { f: 'for_reviewers', p: 'For reviewers', t: 'text', req: true, max: 2000 },
      { f: 'content_warning', p: 'Content warning', t: 'text', max: 300 },
      { f: 'av_needs', p: 'AV / workshop needs', t: 'text', max: 1000 },
      { f: 'speaker_name', p: 'Speaker name', t: 'text', req: true, max: 200 },
      { f: 'email', p: 'Email', t: 'email', req: true },
      { f: 'pronouns', p: 'Pronouns', t: 'text', max: 40 },
      { f: 'bio', p: 'Bio', t: 'text', req: true, max: 1000 },
      { f: 'co_speakers', p: 'Co-speakers', t: 'text', max: 500 },
      { f: 'past_talks', p: 'Past talks / links', t: 'text', max: 1000 },
      { f: 'availability', p: 'Availability', t: 'select', req: true, allowed: ['Morning', 'Afternoon', 'Either'] },
      { f: 'first_time', p: 'First-time speaker', t: 'check' },
      { f: 'arizona', p: 'Arizona-based', t: 'check' },
      { f: 'coc', p: 'Code of Conduct agreed', t: 'check', req: true }
    ],
    fixed: { 'Status': { status: { name: 'Submitted' } }, 'Source': { select: { name: 'Website form' } } }
  },
  volunteer: {
    label: 'Volunteer application',
    fields: [
      { f: 'first_name', p: 'Name', t: 'title', req: true, max: 170, join: 'last_name' },
      { f: 'last_name', t: 'skip', req: true, max: 80 },
      { f: 'email', p: 'Email', t: 'email', req: true },
      { f: 'phone', p: 'Phone', t: 'phone', max: 40 },
      { f: 'pronouns', p: 'Pronouns', t: 'text', max: 40 },
      { f: 'city', p: 'City', t: 'text', max: 80 },
      { f: 'handle', p: 'Discord / Signal / LinkedIn', t: 'text', max: 200 },
      { f: 'jobs', p: 'Jobs', t: 'multi', req: true, allowed: JOBS },
      { f: 'committee_areas', p: 'Committee areas', t: 'multi', allowed: AREAS },
      { f: 'committee_role', p: 'Committee role', t: 'select', allowed: ['Help', 'Lead'] },
      { f: 'availability', p: 'Availability', t: 'multi', req: true, allowed: AVAILABILITY },
      { f: 'experience', p: 'Experience', t: 'select', allowed: ['First time', 'Volunteered before', 'Several cons or organized one'] },
      { f: 'shirt', p: 'Shirt size', t: 'select', allowed: SHIRTS },
      { f: 'skills', p: 'Skills', t: 'text', max: 2000 },
      { f: 'why', p: 'Why volunteer', t: 'text', req: true, max: 2000 },
      { f: 'dietary', p: 'Dietary needs', t: 'text', max: 300 },
      { f: 'accommodations', p: 'Accommodations', t: 'text', max: 1000 },
      { f: 'anything_else', p: 'Anything else', t: 'text', max: 2000 },
      { f: 'coc', p: 'Code of Conduct agreed', t: 'check', req: true },
      { f: 'updates', p: 'Email updates OK', t: 'check' }
    ],
    fixed: { 'Status': { status: { name: 'New' } }, 'Source': { select: { name: 'Website form' } } }
  },
  village: {
    label: 'Village proposal',
    fields: [
      { f: 'village', p: 'Village', t: 'title', req: true, max: 120 },
      { f: 'contact', p: 'Lead contact', t: 'text', req: true, max: 200 },
      { f: 'email', p: 'Email', t: 'email', req: true },
      { f: 'organization', p: 'Group or organization', t: 'text', max: 200 },
      { f: 'website', p: 'Website', t: 'url' },
      { f: 'description', p: 'Description', t: 'text', req: true, max: 1500 },
      { f: 'activities', p: 'Hands-on activities', t: 'text', req: true, max: 1500 },
      { f: 'space', p: 'Space needs', t: 'text', req: true, max: 1000 },
      { f: 'hours', p: 'Hours', t: 'select', req: true, allowed: ['All day', 'Part of the day'] },
      { f: 'volunteers', p: 'Volunteers they bring', t: 'number', min: 0, max: 50 },
      { f: 'safety', p: 'Safety notes', t: 'text', max: 1000 },
      { f: 'anything_else', p: 'Anything else', t: 'text', max: 2000 },
      { f: 'coc', p: 'Code of Conduct agreed', t: 'check', req: true }
    ],
    fixed: { 'Status': { status: { name: 'Proposed' } }, 'How it came in': { select: { name: 'Proposed by the village' } } }
  }
};

/* ---------- Entry points ---------- */

function doGet() {
  return ContentService.createTextOutput('BSides Phoenix forms endpoint is running.');
}

function doPost(e) {
  const ajax = param(e, 'ajax') === '1';
  let result;
  try {
    result = handle(e);
  } catch (err) {
    console.error(err && err.stack || err);
    result = { ok: false, error: 'server' };
  }
  return ajax ? json(result) : page(result, param(e, 'return_to'));
}

/* Run this once from the editor (select it, then Run) to check the token can reach all four databases.
   It sends a row with a made-up column, which Notion always refuses, so nothing is ever saved:
   "validation" means the database was reached; "not found" means it isn't shared with the integration.
   This way the integration only needs "Insert content", not permission to read your data. */
function testSetup() {
  Object.keys(DATABASES).forEach(function (key) {
    const res = notion('post', 'pages', { parent: { database_id: DATABASES[key] }, properties: { '__setup_check__': { rich_text: [] } } });
    const code = res.getResponseCode();
    const body = JSON.parse(res.getContentText() || '{}');
    const msg = code === 400 && body.code === 'validation_error' ? 'OK, reachable'
      : code === 401 ? 'TOKEN NOT ACCEPTED. Check NOTION_TOKEN in Script properties.'
      : code === 404 ? 'NOT FOUND. Share the Operations page with your Notion integration (••• → Connections).'
      : 'UNEXPECTED (' + code + '): ' + (body.message || '');
    console.log(key + ': ' + msg);
  });
}

/* ---------- Handling a submission ---------- */

function handle(e) {
  const key = param(e, 'form');
  const spec = FORMS[key];
  if (!spec) return { ok: false, error: 'unknown form' };

  // Spam traps: the hidden field must be empty, and people take more than a few seconds.
  // Bots get a normal-looking "ok" so they don't learn anything; nothing is saved.
  if (param(e, 'company_website')) return { ok: true };
  const elapsed = Number(param(e, 'elapsed'));
  if (param(e, 'elapsed') && elapsed < 3) return { ok: true };

  const win = OPEN_WINDOWS[key] || {};
  const today = Utilities.formatDate(new Date(), 'America/Phoenix', 'yyyy-MM-dd');
  if ((win.opens && today < win.opens) || (win.closes && today > win.closes)) return { ok: false, error: 'closed' };

  const built = buildProperties(e, spec);
  if (built.problems.length) return { ok: false, error: 'invalid', fields: built.problems };

  const props = Object.assign({}, built.props, spec.fixed);
  const res = notion('post', 'pages', { parent: { database_id: DATABASES[key] }, properties: props });
  if (res.getResponseCode() !== 200) {
    console.error('Notion error ' + res.getResponseCode() + ': ' + res.getContentText());
    return { ok: false, error: 'server' };
  }
  notify(spec.label, built.title, JSON.parse(res.getContentText()).url);
  return { ok: true };
}

function buildProperties(e, spec) {
  const props = {}, problems = [];
  let title = '';
  spec.fields.forEach(function (fd) {
    const multi = fd.t === 'multi';
    let v = multi ? params(e, fd.f) : param(e, fd.f);
    if (fd.join) v = (v + ' ' + param(e, fd.join)).trim();
    const empty = multi ? v.length === 0 : (fd.t === 'check' ? v !== 'yes' : v === '');
    if (empty) {
      if (fd.req) problems.push(fd.f);
      if (fd.t === 'check' && fd.p) props[fd.p] = { checkbox: false };
      return;
    }
    if (fd.max && !multi && v.length > fd.max) { problems.push(fd.f); return; }
    switch (fd.t) {
      case 'skip': return;
      case 'title': title = v; props[fd.p] = { title: richText(v) }; return;
      case 'text': props[fd.p] = { rich_text: richText(v) }; return;
      case 'email':
        if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { problems.push(fd.f); return; }
        props[fd.p] = { email: v }; return;
      case 'phone':
        if (!/^[0-9+().\-\s]{5,40}$/.test(v)) { problems.push(fd.f); return; }
        props[fd.p] = { phone_number: v }; return;
      case 'url':
        if (v.length > 300 || !/^https?:\/\/[^\s]+\.[^\s]+$/.test(v)) { problems.push(fd.f); return; }
        props[fd.p] = { url: v }; return;
      case 'select':
        if (fd.allowed.indexOf(v) < 0) { problems.push(fd.f); return; }
        props[fd.p] = { select: { name: (fd.map && fd.map[v]) || v } }; return;
      case 'multi':
        if (v.some(function (x) { return fd.allowed.indexOf(x) < 0; })) { problems.push(fd.f); return; }
        props[fd.p] = { multi_select: unique(v).map(function (x) { return { name: x }; }) }; return;
      case 'check': props[fd.p] = { checkbox: true }; return;
      case 'number': {
        const n = Number(v);
        if (!isFinite(n) || n < fd.min || n > fd.max || Math.floor(n) !== n) { problems.push(fd.f); return; }
        props[fd.p] = { number: n }; return;
      }
    }
  });
  return { props: props, problems: problems, title: title };
}

/* ---------- Helpers ---------- */

function param(e, name) {
  const v = e && e.parameter && e.parameter[name];
  return v == null ? '' : String(v).trim();
}
function params(e, name) {
  const list = (e && e.parameters && e.parameters[name]) || [];
  return list.map(function (x) { return String(x).trim(); }).filter(function (x) { return x; });
}
function unique(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }

/* Notion text blocks hold at most 2000 characters each */
function richText(s) {
  const out = [];
  for (let i = 0; i < s.length && out.length < 100; i += 2000) out.push({ type: 'text', text: { content: s.slice(i, i + 2000) } });
  return out;
}

function notion(method, path, body) {
  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) throw new Error('NOTION_TOKEN script property is not set');
  const opts = {
    method: method,
    muteHttpExceptions: true,
    headers: { 'Authorization': 'Bearer ' + token, 'Notion-Version': NOTION_VERSION }
  };
  if (body) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(body); }
  return UrlFetchApp.fetch('https://api.notion.com/v1/' + path, opts);
}

function notify(label, title, url) {
  const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail({ to: to, subject: 'New ' + label.toLowerCase() + ': ' + title.slice(0, 80),
      body: 'A new ' + label.toLowerCase() + ' was added to Notion:\n\n' + url });
  } catch (err) {
    console.error('Notify email failed: ' + err);
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* The page people see after sending a form with JavaScript turned off */
function page(result, returnTo) {
  const back = ALLOWED_RETURN.some(function (a) { return returnTo.indexOf(a) === 0; }) ? returnTo : ALLOWED_RETURN[0];
  const msg = result.ok ? 'Thanks! We received your submission.'
    : result.error === 'invalid' ? 'Some answers were missing or not quite right. Please go back and check the form.'
    : result.error === 'closed' ? "This form isn't taking submissions right now."
    : 'Something went wrong and your answers were not saved. Please go back and try again.';
  const esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>BSides Phoenix</title><body style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:0 16px;line-height:1.5">' +
    '<h1 style="font-size:24px">BSides Phoenix</h1><p>' + esc(msg) + '</p>' +
    '<p><a href="' + esc(back) + '" target="_top">Back to the BSides Phoenix website</a></p></body></html>'
  ).setTitle('BSides Phoenix');
}
