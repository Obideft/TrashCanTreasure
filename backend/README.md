# TrashCanTreasure Discord score submissions

## 1. Deploy the Worker

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Create a Worker named `trashcantreasure-score-submit`.
3. Replace its starter code with the contents of `discord-score-worker.js`.
4. In Worker settings, add a **Secret** named `DISCORD_WEBHOOK_URL`.
5. Paste the webhook URL for the Discord `#score-submissions` channel into that secret. Never commit the URL to GitHub or put it in the game JavaScript.
6. Deploy and copy the Worker URL.

## 2. Connect the game

Open `game.js` and replace `PASTE_CLOUDFLARE_WORKER_URL_HERE` in `SCORE_SUBMISSION_ENDPOINT` with the actual Worker URL, including `https://`.

The endpoint accepts browser requests from `https://obideft.github.io` and posts structured score details above the attached PNG.

## Important safety notes

- Browser scores are self-reported. The message is marked **PENDING VERIFICATION**. Do not award prizes based only on the submitted score or poster image.
- Origin checks are not authentication; non-browser clients can spoof Origin headers. Before public launch, add Cloudflare rate limiting and ideally Turnstile or an authenticated player/session flow.
- Rotate the Discord webhook immediately if it is ever exposed.
