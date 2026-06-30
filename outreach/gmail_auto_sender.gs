/**
 * gmail_auto_sender.gs — Google Apps Script (NOT part of the Larynx app)
 *
 * Automatically sends the outreach DRAFTS that Larynx created in your Gmail,
 * throttled and during business hours, so it looks human and protects deliverability.
 *
 * Why Apps Script: it runs as YOUR OWN Google account, inside Google. It needs no
 * Google Cloud project, no OAuth client, and no changes to Larynx's permissions —
 * it just sends drafts that already exist in your mailbox. This keeps the Larynx
 * product's "nothing sends unless you send it" promise intact.
 *
 * ── SETUP (one time) ───────────────────────────────────────────────────────────
 * 1. Sign in to the SAME Google account whose inbox holds the drafts
 *    (the account you connected to Larynx, e.g. fadhillawal06@gmail.com).
 * 2. Go to https://script.google.com  →  New project.
 * 3. Paste this whole file in, Save.
 * 4. Run `sendOutreachDrafts` once from the editor. Google will pop a consent
 *    screen asking to manage your Gmail — approve it (this is the only auth, and
 *    it's between you and Google; Larynx is not involved).
 * 5. Set up the cron:  Triggers (clock icon)  →  Add Trigger
 *       Function: sendOutreachDrafts
 *       Event source: Time-driven  →  Hour timer  →  Every hour
 *    With the defaults below that yields ~15–20 sends/day, only 9am–5pm.
 *
 * ── KNOWN GAP ──────────────────────────────────────────────────────────────────
 * This sends from outside Larynx, so the Larynx CRM won't know a draft went out —
 * its status stays "drafted" and the follow-up timer won't start. Mark those leads
 * "sent" in the CRM yourself if you want the follow-up clock to be accurate.
 * (Follow-up drafts use a "Re: ..." subject, so they are NOT auto-sent by this.)
 */

// ── Config ──────────────────────────────────────────────────────────────────────
const TARGET_SUBJECT   = 'Free inbox help, from a Vanderbilt student'; // exact subject to send
const REQUIRE_BCC      = 'fadhil@larynxai.com';  // extra safety: only send drafts BCC'd here ('' to disable)
const MAX_PER_RUN      = 3;     // sends per trigger run
const DAILY_CAP        = 20;    // hard stop per calendar day
const SEND_START_HOUR  = 9;     // local hour to start sending (24h)
const SEND_END_HOUR    = 17;    // local hour to stop (exclusive)
const SKIP_PROBABILITY = 0.15;  // randomly skip a draft now and then (human-like jitter)

function sendOutreachDrafts() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < SEND_START_HOUR || hour >= SEND_END_HOUR) return;  // outside business hours

  const props = PropertiesService.getScriptProperties();
  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const key = 'sent_' + today;
  let sentToday = Number(props.getProperty(key) || 0);
  if (sentToday >= DAILY_CAP) return;

  const drafts = GmailApp.getDrafts();
  let sentThisRun = 0;

  for (let i = 0; i < drafts.length; i++) {
    if (sentThisRun >= MAX_PER_RUN || sentToday >= DAILY_CAP) break;

    const draft = drafts[i];
    const msg = draft.getMessage();

    if ((msg.getSubject() || '').trim() !== TARGET_SUBJECT) continue;       // subject must match
    if (REQUIRE_BCC && (msg.getBcc() || '').indexOf(REQUIRE_BCC) === -1) continue; // safety guard
    if (Math.random() < SKIP_PROBABILITY) continue;                         // jitter

    draft.send();
    sentThisRun++;
    sentToday++;
    Utilities.sleep(1000 + Math.floor(Math.random() * 3000));               // 1–4s gap
  }

  props.setProperty(key, String(sentToday));
  Logger.log('Sent ' + sentThisRun + ' this run; ' + sentToday + ' today.');
}
