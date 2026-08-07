# Apps Script Data Loader

## Files
- `Code.gs`: reads the spreadsheet and returns `SITE_DATA` as JSON.
- `appsscript.json`: minimal manifest for web app deployment.

## Setup
1. Create a Google Apps Script project.
2. Copy `Code.gs` and `appsscript.json` into the project.
3. If this is a standalone script, set Script Properties:
   - `SPREADSHEET_ID` = your spreadsheet ID
4. Deploy as a web app.

## Output
The web app returns a JSON object shaped like:
- `home`
- `members`
- `research`
- `publications`
- `ips`
- `lecture`
- `news_award`
- `menu`

## Notes
- Header text is used for column detection, so column order can change.
- Google Drive image URLs are converted to web-viewable URLs.
- Multiple URLs in one cell should be comma-separated.
