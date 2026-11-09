/* Website form settings. This is the only file to edit to switch the forms on.
   See forms/README.md for the full setup.

   endpoint: the Google Apps Script web app address that saves submissions
             to Notion. Leave it empty ("") and every form shows a
             "not open yet" notice instead of taking submissions.
   opens / closes: dates in Phoenix time (YYYY-MM-DD). Leave empty for no limit.
             Keep these the same as OPEN_WINDOWS in forms/apps-script/Code.gs,
             which checks them again when a form is sent. */
window.BSP_FORMS = {
  endpoint: "",
  forms: {
    sponsor:   { opens: "",           closes: "" },
    cfp:       { opens: "2026-12-12", closes: "2027-06-30" },
    volunteer: { opens: "2027-07-01", closes: "" },
    village:   { opens: "",           closes: "" }
  }
};
