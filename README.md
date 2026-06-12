# ♻️ Scrap – The Self-Cleaning Downloads Folder

**Scrap** is a lightweight local desktop app + browser extension that creates a self-cleaning folder in your Downloads directory. Every file placed in `~/Downloads/Scrap` is automatically and permanently deleted after 24 hours. Use it for temporary downloads, one-off files, or anything you don't want cluttering your machine.

---

## Architecture

```
scrap/
├── desktop_app/          # Python desktop app (watchdog + pystray)
│   ├── __init__.py
│   ├── config.py         # Paths, timeouts, logging config
│   ├── cleaner.py        # File age detection & permanent deletion
│   └── tray_app.py       # System tray icon, watchdog observer, cleanup loop
├── extension/            # Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js     # Right-click context menu handler
│   ├── popup.html        # Popup UI with status & usage info
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── onboarding/           # Onboarding wizard (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── generate_icons.py     # Script to regenerate extension icons
├── requirements.txt      # Python dependencies
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Install the Desktop App

```bash
cd scrap
pip install -r requirements.txt
python -m desktop_app.tray_app
```

The app will:
- Create `~/Downloads/Scrap` if it doesn't exist.
- Show a system tray icon (trash can).
- Monitor the folder and **permanently delete files older than 24 hours** every 60 seconds.
- Log activity to `~/.scrap/scrap.log`.

### 2. Install the Chrome Extension

1. Open **chrome://extensions**
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `scrap/extension` folder

The extension adds a **"Download to Scrap"** right-click option on links, videos, and audio. Click it to download directly into your Scrap folder.

### 3. Complete the Onboarding

Open `scrap/onboarding/index.html` in any browser for a step-by-step guided setup.

---

## How It Works

| Component | Technology | Role |
|-----------|-----------|------|
| **Folder Cleaner** | Python (`watchdog`) | Monitors `~/Downloads/Scrap`, deletes files ≥ 24h old |
| **System Tray** | Python (`pystray` + `Pillow`) | System tray icon with menu (open folder, clean now, quit) |
| **Browser Extension** | Chrome Manifest V3 | Right-click → "Download to Scrap" routes downloads to Scrap |
| **Onboarding UI** | HTML/CSS/JS | 5-slide wizard explaining setup and usage |

### Cleanup Logic

- **What:** Every file inside `~/Downloads/Scrap` is checked.
- **When:** Every 60 seconds (configurable in `config.py`).
- **How old:** Files created ≥ 24 hours ago are **permanently deleted**.
- **Safety:** Subdirectories inside Scrap are **not deleted** (only files). Move important files out of Scrap to keep them safe.

---

## Configuration

Edit `desktop_app/config.py`:

```python
MAX_AGE_SECONDS = 24 * 60 * 60  # 24 hours
OBSERVER_INTERVAL = 60           # check every 60 seconds
```

---

## Development

### Generate Icons (if needed)

```bash
cd scrap
python generate_icons.py
```

### Run Tests / Dry Run

```python
from desktop_app.cleaner import run_cleanup_cycle

# See what would be deleted without actually deleting
run_cleanup_cycle(dry_run=True)
```

---

## License

MIT — use freely, modify freely, share freely.

---

## Built With

- [Python](https://www.python.org/)
- [watchdog](https://github.com/gorakhargosh/watchdog) – filesystem event monitoring
- [pystray](https://github.com/moses-palmer/pystray) – system tray integration
- [Pillow](https://python-pillow.org/) – icon generation
- Chrome Extension Manifest V3