#!/bin/bash

# Database Backup Script for Expense Tracker
# This script creates automated database backups

set -e

# Configuration
BACKUP_DIR="/opt/expense-tracker/backups"
DB_NAME="expense_tracker"
DB_USER="postgres"
CONTAINER_NAME="expense-tracker_db_1"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

echo "🗄️  Starting database backup..."

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Database container is not running!"
    exit 1
fi

# Create database backup
echo "📝 Creating backup: $BACKUP_FILE"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Verify backup was created
if [ -f "$COMPRESSED_FILE" ]; then
    BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "✅ Backup completed successfully!"
    echo "📊 Backup size: $BACKUP_SIZE"
    echo "📍 Backup location: $COMPRESSED_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Remove old backups
echo "🧹 Cleaning up old backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
echo "📋 Total backups stored: $BACKUP_COUNT"

# Show recent backups
echo ""
echo "📁 Recent backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz | tail -5

echo ""
echo "🎉 Backup process completed successfully!"