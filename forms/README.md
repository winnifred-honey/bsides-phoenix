# Website forms setup

The site has four forms. Each one saves its answers as a new row in Notion, in the
**BSides Phoenix 2027 Operations** page:

| Form | Page | Notion database | Takes submissions |
|---|---|---|---|
| Sponsorship inquiry | `sponsor/` | Sponsor inquiries | As soon as it's switched on |
| Call for papers | `cfp/` | CFP submissions | December 12, 2026 to June 30, 2027 |
| Volunteer application | `volunteer/` | Volunteers | From July 1, 2027 |
| Propose a village | `villages/` | Villages | As soon as it's switched on |

The website can't save anything itself, so a small Google Apps Script (`apps-script/Code.gs`)
sits in between: the form sends the answers to the script, the script checks them and adds
the row in Notion. This folder isn't published to the website.

Until the steps below are done, every form shows "This form isn't open yet" with an email
address to use instead.

## One-time setup (about 15 minutes)

### 1. Let the script add rows in Notion
1. Go to **notion.so/profile/integrations** and choose **New integration**.
2. Name it "BSides Phoenix website forms", pick your workspace, and choose **Internal**.
3. Under **Capabilities**, tick only **Insert content**. Leave read, update and user details unticked.
4. Save, then copy the **Internal Integration Secret**. Keep it private: don't paste it in chat,
   email or this repo.
5. Open the **BSides Phoenix 2027 Operations** page in Notion → **•••** → **Connections** →
   add "BSides Phoenix website forms".

### 2. Create the script
1. Go to **script.google.com** → **New project**. Name it "BSides Phoenix forms".
2. Delete the sample code, paste in all of `apps-script/Code.gs`, and save.
3. **Project Settings** (gear icon) → **Script properties** → add:
   - `NOTION_TOKEN`: the secret from step 1
   - `NOTIFY_EMAIL` (optional): an address that gets a short email with a Notion link for each new submission
4. Back in the editor, choose **testSetup** in the function menu and click **Run**. Approve the
   permissions Google asks for (it shows "Google hasn't verified this app" because it's your own
   script: **Advanced** → **Go to BSides Phoenix forms**). The log should say **OK** for all four
   databases.

### 3. Put it online
1. **Deploy** → **New deployment** → type **Web app**.
2. **Execute as: Me**. **Who has access: Anyone**. Deploy.
3. Copy the **Web app URL** (it ends in `/exec`).

### 4. Switch the forms on
Paste the URL into `assets/js/forms-config.js` as the `endpoint`, in a pull request. Once merged,
each form opens automatically on its date.

## Changing things later
- **Edited `Code.gs`?** Paste it in again, then **Deploy** → **Manage deployments** → edit →
  **New version**. The URL stays the same.
- **Changing a form's dates?** Change them in both `assets/js/forms-config.js` and `OPEN_WINDOWS`
  in `Code.gs`.
- **Adding a question?** Add it to the form page, to `FORMS` in `Code.gs`, and as a column in Notion.
  Choice questions only accept the options listed in `Code.gs`, so nobody can add new Notion options.
- **Something not arriving?** In Apps Script, open **Executions** to see each submission and any error.

## Spam and safety
- A hidden "leave this empty" field and a minimum time on the page catch most bots. Bots are
  told "ok" but nothing is saved.
- Every answer is checked again in the script: required fields, email and web address format,
  length limits and allowed options.
- The script can only add rows to the four databases. The Notion secret lives only in the
  script's settings.
- No emails are sent to the address someone types in, so the forms can't be used to send
  email to strangers.
