#!/bin/bash

# Change to project root
cd /Users/jaaason30/Desktop/react_start_project

# Ensure we're on main branch
echo "🔄 Switching to main branch..."
git checkout main

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to commit. Working directory is clean."
    exit 0
fi

# Add all changes
echo "📝 Adding all changes..."
git add -A

# Create commit message
COMMIT_MSG="Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"
if [ ! -z "$1" ]; then
    COMMIT_MSG="$COMMIT_MSG - $1"
fi

# Commit
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Force push to remote main branch (overwrites remote history)
echo "🚀 Force pushing to origin/main..."
git push origin main --force

if [ $? -eq 0 ]; then
    echo "✅ Project saved and force pushed successfully!"
    echo "Commit: $COMMIT_MSG"
    echo "Branch: origin/main (force overwritten)"
else
    echo "❌ Failed to force push changes to remote repository"
    exit 1
fi