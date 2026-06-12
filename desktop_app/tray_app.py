"""
Scrap - System tray application.
Monitors the Scrap folder with watchdog, runs periodic cleanup,
and displays a system-tray icon with pystray.
"""
import sys
import os
import time
import threading
import logging
from pathlib import Path

# Ensure the desktop_app package can be found
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pystray
from PIL import Image, ImageDraw
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from . import config
from .cleaner import ensure_scrap_folder, run_cleanup_cycle

logger = logging.getLogger("scrap")


def setup_logging():
    """Configure basic logging to file and console."""
    config.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        handlers=[
            logging.FileHandler(str(config.LOG_FILE), mode="a"),
            logging.StreamHandler(sys.stdout),
        ],
    )


# ---------- Watchdog event handler ----------

class ScrapFolderHandler(FileSystemEventHandler):
    """React to new files being added to Scrap folder (for future features)."""

    def on_created(self, event):
        if event.is_directory:
            return
        logger.info("New file detected in Scrap: %s", os.path.basename(event.src_path))


def start_watchdog(observer: Observer):
    """Start the watchdog observer on the Scrap folder."""
    ensure_scrap_folder()
    event_handler = ScrapFolderHandler()
    observer.schedule(event_handler, str(config.SCRAP_FOLDER), recursive=False)
    observer.start()
    logger.info("Watchdog observer started on %s", config.SCRAP_FOLDER)


# ---------- Periodic cleanup thread ----------

def cleanup_loop(stop_event: threading.Event):
    """Run cleanup periodically until stop_event is set."""
    while not stop_event.is_set():
        try:
            run_cleanup_cycle()
        except Exception as e:
            logger.error("Error during cleanup cycle: %s", e)
        stop_event.wait(config.OBSERVER_INTERVAL)


# ---------- System tray icon ----------

def create_icon_image() -> Image.Image:
    """Create a simple 64x64 trash-bin icon."""
    width = 64
    height = 64
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw a simple trash can shape
    # Lid
    draw.rectangle([18, 14, 46, 20], fill=(100, 100, 100))
    # Handle
    draw.rectangle([22, 10, 42, 14], fill=(100, 100, 100))
    # Body
    draw.rectangle([20, 20, 44, 54], fill=(80, 80, 80))
    # Highlight / shine
    draw.rectangle([24, 24, 28, 50], fill=(120, 120, 120))

    return img


def on_quit(icon, item):
    """Quit the application."""
    icon.stop()
    os._exit(0)


def on_open_folder(icon, item):
    """Open the Scrap folder in File Explorer."""
    ensure_scrap_folder()
    os.startfile(str(config.SCRAP_FOLDER))


def on_run_cleanup_now(icon, item):
    """Manually trigger a cleanup cycle."""
    deleted = run_cleanup_cycle()
    logger.info("Manual cleanup removed %d files.", len(deleted))


def build_tray_menu():
    """Build the pystray menu."""
    return pystray.Menu(
        pystray.MenuItem("Open Scrap Folder", on_open_folder),
        pystray.MenuItem("Clean Now", on_run_cleanup_now),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Quit Scrap", on_quit),
    )


def run_tray():
    """Create and run the system tray icon (blocks)."""
    icon = pystray.Icon(
        "scrap",
        create_icon_image(),
        "Scrap – Self-Cleaning Downloads",
        build_tray_menu(),
    )
    icon.run()


# ---------- Main entry point ----------

def main():
    setup_logging()
    logger.info("=== Scrap started ===")
    logger.info("Monitoring: %s", config.SCRAP_FOLDER)
    logger.info("Files deleted after: %d seconds", config.MAX_AGE_SECONDS)

    # Start watchdog observer
    observer = Observer()
    start_watchdog(observer)

    # Start background cleanup thread
    stop_event = threading.Event()
    cleanup_thread = threading.Thread(
        target=cleanup_loop, args=(stop_event,), daemon=True
    )
    cleanup_thread.start()

    try:
        # Run tray icon (blocks this thread)
        run_tray()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        stop_event.set()
        observer.stop()
        observer.join()
        logger.info("=== Scrap stopped ===")


if __name__ == "__main__":
    main()