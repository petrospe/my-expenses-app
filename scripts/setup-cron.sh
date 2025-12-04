#!/bin/bash

# Setup Monthly Archive Cron Job
# This script adds a cron job to automatically archive data on the 1st of every month

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ARCHIVE_SCRIPT="$SCRIPT_DIR/monthly-archive.js"

# Create cron job entry (runs on 1st of every month at 2 AM)
CRON_ENTRY="0 2 1 * * cd $PROJECT_DIR && node $ARCHIVE_SCRIPT >> $PROJECT_DIR/logs/archive.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$ARCHIVE_SCRIPT"; then
    echo "⚠️  Cron job already exists!"
    echo "Current cron jobs:"
    crontab -l | grep "$ARCHIVE_SCRIPT"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✅ Cron job added successfully!"
    echo "   Schedule: 1st of every month at 2:00 AM"
    echo "   Script: $ARCHIVE_SCRIPT"
    echo ""
    echo "To view cron jobs: crontab -l"
    echo "To remove cron job: crontab -e (then delete the line)"
fi

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"
echo "✅ Logs directory created: $PROJECT_DIR/logs"




