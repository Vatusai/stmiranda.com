#!/bin/bash
# =============================================================================
# deploy.sh — Production deployment script for stmiranda.com
# =============================================================================
# Usage:   bash deploy.sh
# Requires: git, node, npm, pm2 (install: npm install -g pm2)
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# =============================================================================
# EDITABLE VARIABLES — Customize these for your environment
# =============================================================================
PROJECT_DIR="/home/ubuntu/stmiranda.com"
BRANCH="main"
APP_NAME="stmiranda-backend"          # PM2 process name
BACKEND_DIR="$PROJECT_DIR/backend"
BUILD_COMMAND="npm run build"          # Vite frontend build
BACKEND_START="node src/server.js"     # Command PM2 uses to start backend
NODE_ENV="production"
# =============================================================================

# --- Colors ------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# --- Helpers -----------------------------------------------------------------
info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1" >&2; }

# Called automatically on any error (set -e triggers this)
on_error() {
  local exit_code=$?
  local line=$1
  echo ""
  error "Deployment FAILED at line $line (exit code: $exit_code)"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${RED}  Deploy aborted. No changes were applied to PM2.${RESET}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  exit $exit_code
}
trap 'on_error $LINENO' ERR

# =============================================================================
# START
# =============================================================================
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Deploying stmiranda.com — $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# --- Step 1: Move into project directory -------------------------------------
info "Step 1/8 — Entering project directory..."
cd "$PROJECT_DIR" || { error "Cannot cd into $PROJECT_DIR"; exit 1; }
success "Working directory: $(pwd)"

# --- Step 2: Confirm we are on the correct branch ----------------------------
info "Step 2/8 — Checking git branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  error "Expected branch '$BRANCH' but found '$CURRENT_BRANCH'."
  error "Switch to '$BRANCH' before deploying: git checkout $BRANCH"
  exit 1
fi
success "Branch confirmed: $CURRENT_BRANCH"

# --- Step 3: Show current git status -----------------------------------------
info "Step 3/8 — Current git status:"
git status --short
echo ""

# --- Step 4: Sync to origin (fetch + reset) ----------------------------------
# Using reset --hard instead of pull: production servers should always mirror
# the remote exactly. Local changes (e.g. runtime DB files, env tweaks) are
# not committed here — they survive reset because they are untracked/gitignored.
info "Step 4/8 — Syncing with origin/$BRANCH..."
git fetch origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already up to date. Continuing anyway to ensure deps and build are fresh."
else
  git reset --hard "origin/$BRANCH"
  success "Code synced: $(git log -1 --format='%h — %s (%ar)')"
fi

# --- Step 5: Install root (frontend) dependencies ----------------------------
info "Step 5/8 — Installing frontend dependencies..."

# Only reinstall if package-lock.json changed in the last pull
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "^package-lock.json$"; then
  info "package-lock.json changed — running npm ci..."
  npm ci --prefer-offline
else
  info "No dependency changes detected — skipping root npm ci."
fi

# Always install backend deps (lightweight check)
info "Installing backend dependencies..."
cd "$BACKEND_DIR"
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "^backend/package-lock.json$"; then
  info "backend/package-lock.json changed — running npm ci..."
  npm ci --prefer-offline
else
  info "No backend dependency changes — skipping backend npm ci."
fi
cd "$PROJECT_DIR"

success "Dependencies ready."

# --- Step 6: Build the frontend ----------------------------------------------
info "Step 6/8 — Building frontend (Vite)..."
export NODE_ENV="$NODE_ENV"
$BUILD_COMMAND
success "Frontend built successfully. Output: dist/"

# --- Step 7: Restart the backend with PM2 ------------------------------------
info "Step 7/8 — Restarting backend via PM2..."

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  # Process already registered in PM2 — just reload (zero-downtime)
  pm2 reload "$APP_NAME" --update-env
  success "PM2 process '$APP_NAME' reloaded (zero-downtime)."
else
  # First time — start it and save the process list
  warn "PM2 process '$APP_NAME' not found. Starting for the first time..."
  pm2 start "$BACKEND_START" \
    --name "$APP_NAME" \
    --cwd "$BACKEND_DIR" \
    --env production \
    --log "$PROJECT_DIR/logs/backend.log" \
    --time
  pm2 save
  success "PM2 process '$APP_NAME' started and saved."
fi

# --- Step 8: Health check + final status -------------------------------------
info "Step 8/8 — Running health check..."

# Give the process 3 seconds to stabilize
sleep 3

PM2_STATUS=$(pm2 describe "$APP_NAME" 2>/dev/null | grep "status" | awk '{print $4}' | head -1)

if [ "$PM2_STATUS" = "online" ]; then
  success "Backend is online."
else
  warn "PM2 status is: '$PM2_STATUS'. Check logs below."
fi

# --- Summary -----------------------------------------------------------------
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  Deployment completed successfully!${RESET}"
echo -e "${GREEN}  $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "${BOLD}Last commit deployed:${RESET}"
git log -1 --format="  %C(yellow)%h%Creset  %s  %C(cyan)(%ar)%Creset"
echo ""
echo -e "${BOLD}PM2 process list:${RESET}"
pm2 list
echo ""
echo -e "${BOLD}Recent backend logs (last 20 lines):${RESET}"
pm2 logs "$APP_NAME" --lines 20 --nostream 2>/dev/null || warn "Could not fetch PM2 logs."
echo ""
