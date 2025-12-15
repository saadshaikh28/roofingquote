# Deploying the Configurable Site

This website is designed to be configurable for different clients (e.g., Mark, Henry, Jason).

## How to use

1. Go to the `configs/` folder and edit the JSON files (`henry.json`, `mark.json`, `jason.json`) with the specific details for each client.
2. When deploying for a specific client (e.g. Henry):
   - Copy the contents of `configs/henry.json` to a new file named `config.json` inside this folder (`v1/`).
   - Or simpler: `cp ../../configs/henry.json config.json`
3. Open `index.html`. It will automatically load the settings from `config.json`.

**Note:** If you open `index.html` directly from your file system (using `file://`), some browsers might block loading the `config.json` due to security (CORS) policies. To test locally:
- Use a local server (e.g. `python3 -m http.server 8080`)
- Or use a code editor extension like "Live Server".
