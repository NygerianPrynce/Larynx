/**
 * gmail_auto_sender.gs — Google Apps Script (NOT part of the Larynx app)
 *
 * Automates your outreach end-to-end from your own Gmail:
 *   1. Sends the outreach DRAFTS Larynx created (matched by subject), throttled.
 *   2. Sends FOLLOW-UPS natively: any sent outreach thread with no reply after
 *      FOLLOWUP_DAYS gets one in-thread reply, then is labeled so it's never
 *      followed up twice.
 *   3. Pings the Larynx webhook after each send so the CRM status stays in sync
 *      (lead flips to "sent", follow-up timestamp recorded) — no manual marking.
 *
 * Why Apps Script: it runs as YOUR OWN Google account, inside Google. No Google
 * Cloud project, no OAuth client, no changes to Larynx's permissions — it just
 * works on mail already in your mailbox, keeping the product's "nothing sends
 * unless you send it" promise intact.
 *
 * ── SETUP (one time) ───────────────────────────────────────────────────────────
 * 1. Sign in to the SAME Google account whose inbox holds the drafts
 *    (the account you connected to Larynx, e.g. fadhillawal06@gmail.com).
 * 2. https://script.google.com  →  New project. Paste this file in. Save.
 * 3. Fill in WEBHOOK_URL and WEBHOOK_SECRET below (see "Backend setup").
 * 4. Run `runOutreach` once from the editor and approve the Gmail + external-request
 *    consent screens (this auth is between you and Google; Larynx is not involved).
 * 5. Triggers (clock icon) → Add Trigger:
 *       Function: runOutreach
 *       Event source: Time-driven → Hour timer → Every hour
 *    Defaults below yield ~15–20 sends/day, 9am–5pm only.
 *
 * ── Backend setup (so the webhook works) ─────────────────────────────────────────
 *  - On Render, set env var  OUTREACH_WEBHOOK_SECRET  to a long random string.
 *  - Put that SAME string in WEBHOOK_SECRET below.
 *  - Set WEBHOOK_URL to  https://<your-backend-host>/admin/outreach/webhook/sent
 *  - Run this SQL once in Supabase:
 *      alter table outreach_leads add column if not exists followup_sent_at timestamptz;
 */

// ── Config: sending the initial drafts ───────────────────────────────────────────
const TARGET_SUBJECT   = 'Free inbox help, from a Vanderbilt student'; // exact subject to send
const REQUIRE_BCC      = 'fadhil@larynxai.com';  // only send drafts BCC'd here ('' to disable)
const MAX_PER_RUN      = 3;     // initial sends per trigger run
const DAILY_CAP        = 20;    // hard stop per calendar day (initial sends)
const SEND_START_HOUR  = 9;     // local hour to start (24h)
const SEND_END_HOUR    = 17;    // local hour to stop (exclusive)
const SKIP_PROBABILITY = 0.15;  // randomly skip a draft now and then (human-like jitter)

// ── Config: follow-ups ───────────────────────────────────────────────────────────
const FOLLOWUP_DAYS         = 4;   // days of no reply before following up
const MAX_FOLLOWUPS_PER_RUN = 2;   // follow-ups per trigger run
const FOLLOWUP_LABEL        = 'Outreach-FollowedUp';  // applied so we never double-up
const FROM_NAME             = 'Fadhil';
const FOLLOWUP_BODY =
  "Just floating this back up in case it got buried. Still happy to show you the tool " +
  "(it drafts your quote and booking replies in your own voice) whenever you've got 10 " +
  "minutes. No pressure at all if now isn't the time.\n\nBest,\nFadhil";

// ── Config: webhook back to Larynx ───────────────────────────────────────────────
const WEBHOOK_URL    = '';  // e.g. https://larynx-backend.onrender.com/admin/outreach/webhook/sent
const WEBHOOK_SECRET = '';  // must equal OUTREACH_WEBHOOK_SECRET on the backend

// ── Entry point (point the trigger at this) ──────────────────────────────────────
function runOutreach() {
  const hour = new Date().getHours();
  if (hour < SEND_START_HOUR || hour >= SEND_END_HOUR) return;  // business hours only
  sendInitialDrafts();
  sendFollowups();
}

// ── 1. Send the initial outreach drafts ──────────────────────────────────────────
function sendInitialDrafts() {
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const key = 'sent_' + today;
  let sentToday = Number(props.getProperty(key) || 0);
  if (sentToday >= DAILY_CAP) return;

  const drafts = GmailApp.getDrafts();
  let sentThisRun = 0;

  for (let i = 0; i < drafts.length; i++) {
    if (sentThisRun >= MAX_PER_RUN || sentToday >= DAILY_CAP) break;
    const draft = drafts[i];
    const msg = draft.getMessage();

    if ((msg.getSubject() || '').trim() !== TARGET_SUBJECT) continue;
    if (REQUIRE_BCC && (msg.getBcc() || '').indexOf(REQUIRE_BCC) === -1) continue;
    if (Math.random() < SKIP_PROBABILITY) continue;

    const to = msg.getTo();
    draft.send();
    sentThisRun++; sentToday++;
    notifyWebhook(to, 'initial');
    Utilities.sleep(1000 + Math.floor(Math.random() * 3000));  // 1–4s gap
  }

  props.setProperty(key, String(sentToday));
  Logger.log('Initial: sent ' + sentThisRun + ' this run; ' + sentToday + ' today.');
}

// ── 2. Send follow-ups to sent threads with no reply ─────────────────────────────
function sendFollowups() {
  const label = GmailApp.getUserLabelByName(FOLLOWUP_LABEL) || GmailApp.createLabel(FOLLOWUP_LABEL);
  // Sent outreach threads, older than the cutoff, not yet followed up.
  const query = 'in:sent subject:"' + TARGET_SUBJECT + '" older_than:' + FOLLOWUP_DAYS +
                'd -label:' + FOLLOWUP_LABEL;
  const threads = GmailApp.search(query, 0, 50);
  let n = 0;

  for (let i = 0; i < threads.length; i++) {
    if (n >= MAX_FOLLOWUPS_PER_RUN) break;
    const t = threads[i];

    // More than one message means they replied — don't follow up; just mark it done.
    if (t.getMessageCount() > 1) { t.addLabel(label); continue; }

    const to = t.getMessages()[0].getTo();
    const opts = { name: FROM_NAME };
    if (REQUIRE_BCC) opts.bcc = REQUIRE_BCC;
    t.reply(FOLLOWUP_BODY, opts);   // in-thread reply to the last message
    t.addLabel(label);
    n++;
    notifyWebhook(to, 'followup');
    Utilities.sleep(1000 + Math.floor(Math.random() * 3000));
  }
  Logger.log('Follow-ups: sent ' + n + ' this run.');
}

// ── Tell Larynx what went out, so the CRM updates itself ─────────────────────────
function notifyWebhook(to, kind) {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) return;
  try {
    UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ token: WEBHOOK_SECRET, email: to, kind: kind }),
    });
  } catch (e) {
    Logger.log('webhook failed for ' + to + ': ' + e);
  }
}
