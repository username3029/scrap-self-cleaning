"""
Scrap - File cleaner: identifies and permanently deletes files older than 24 hours.
"""
import os
import time
import logging
import shutil
from pathlib import Path
from . import config

logger = logging.getLogger("scrap")


def ensure_scrap_folder():
    """Create the Scrap folder if it does not exist."""
    config.SCRAP_FOLDER.mkdir(parents=True, exist_ok=True)
    logger.info("Scrap folder ready at %s", config.SCRAP_FOLDER)


def delete_old_files(dry_run: bool = False) -> list:
    """
    Delete every file inside Scrap folder that is older than MAX_AGE_SECONDS.

    Args:
        dry_run: if True, only log what would be deleted (no actual delete).

    Returns:
        List of deleted (or to-be-deleted) file paths.
    """
    now = time.time()
    deleted = []

    if not config.SCRAP_FOLDER.exists():
        logger.warning("Scrap folder does not exist yet.")
        return deleted

    for entry in config.SCRAP_FOLDER.iterdir():
        if not entry.is_file():
            continue  # skip subdirectories

        age = now - entry.stat().st_ctime  # creation time
        if age >= config.MAX_AGE_SECONDS:
            deleted.append(str(entry))
            if dry_run:
                logger.info("[DRY RUN] Would delete %s (age=%.1fs)", entry.name, age)
            else:
                try:
                    os.remove(str(entry))
                    logger.info("Deleted %s (age=%.1fs)", entry.name, age)
                except OSError as e:
                    logger.error("Failed to delete %s: %s", entry.name, e)

    return deleted


def run_cleanup_cycle(dry_run: bool = False):
    """Convenience: ensure folder, then delete old files."""
    ensure_scrap_folder()
    return delete_old_files(dry_run)