"""
Scrap - Configuration constants.
"""
import os
from pathlib import Path

# Default Downloads folder
HOME = Path.home()
DOWNLOADS = HOME / "Downloads"
SCRAP_FOLDER = DOWNLOADS / "Scrap"

# How old a file must be (in seconds) before it is deleted
MAX_AGE_SECONDS = 24 * 60 * 60  # 24 hours

# Polling interval for the watchdog observer (seconds)
OBSERVER_INTERVAL = 60  # check every 60 seconds

# Log file (optional, for debugging)
LOG_FILE = HOME / ".scrap" / "scrap.log"