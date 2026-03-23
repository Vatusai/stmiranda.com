#!/bin/bash
# =============================================================================
# deploy-noPM2.sh — Production deployment script (no PM2 required)
# =============================================================================
# Uses a PID file to track and restart the backend process.
# Logs are written to logs/backend.log
# =============================================================================

set -euo pipefail

# =============================================================================
# EDITABLE VARIABLES
# =============================================================================
PROJECT_DIR="/home/ubuntu/stmiranda.com"
BRANCH="main"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKEND_ENTRY="src/server.js"          # Relative to BACKEND_DIR
BUILD_COMMAND="npm run build"          # Vite frontend build
PID_FILE="$PROJECT_DIR/backend.pid"
LOG_FILE="$PROJECT_DIR/logs/backend.log"
NODE_ENV="production"
# =============================================================================

# --- Colors ------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1" >&2; }

on_error() {
  local exit_code=$?
  local line=$1
  echo ""
  error "Deployment FAILED at line $line (exit code: $exit_code)"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  exit $exit_code
}
trap 'on_error $LINENO' ERR

# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

# =============================================================================
# START
# =============================================================================
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  Deploying stmiranda.com (no PM2) — $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# --- Step 1: Project directory -----------------------------------------------
info "Step 1/7 — Entering project directory..."
cd "$PROJECT_DIR" || { error "Cannot cd into $PROJECT_DIR"; exit 1; }
success "Working directory: $(pwd)"

# --- Step 2: Branch check ----------------------------------------------------
info "Step 2/7 — Checking git branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  error "Expected branch '$BRANCH' but currently on '$CURRENT_BRANCH'."
  exit 1
fi
success "Branch confirmed: $CURRENT_BRANCH"

# --- Step 3: Git status + pull -----------------------------------------------
info "Step 3/7 — Current git status:"
git status --short
echo ""

info "Pulling latest changes from origin/$BRANCH..."
git fetch origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already up to date. Proceeding with full deploy anyway."
else
  git reset --hard "origin/$BRANCH"
  success "Synced to: $(git log -1 --format='%h — %s (%ar)')"
fi

# --- Step 4: Install dependencies --------------------------------------------
info "Step 4/7 — Installing dependencies..."

if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "^package-lock.json$"; then
  npm ci --prefer-offline
else
  info "Frontend deps unchanged — skipping."
fi

cd "$BACKEND_DIR"
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "^backend/package-lock.json$"; then
  npm ci --prefer-offline
else
  info "Backend deps unchanged — skipping."
fi
cd "$PROJECT_DIR"

success "Dependencies ready."

# --- Step 5: Build frontend --------------------------------------------------
info "Step 5/7 — Building frontend..."
export NODE_ENV="$NODE_ENV"
$BUILD_COMMAND
success "Build complete. Output: dist/"

# --- Step 6: Stop old backend process ----------------------------------------
info "Step 6/7 — Stopping old backend process..."

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID"
    sleep 2
    # Force kill if still running
    if kill -0 "$OLD_PID" 2>/dev/null; then
      warn "Process $OLD_PID still alive — force killing..."
      kill -9 "$OLD_PID"
    fi
    success "Old process ($OLD_PID) stopped."
  else
    warn "PID file found but process $OLD_PID is not running. Cleaning up."
  fi
  rm -f "$PID_FILE"
else
  info "No PID file found — assuming fresh start."
fi

# --- Step 7: Start backend ---------------------------------------------------
info "Step 7/7 — Starting backend..."

cd "$BACKEND_DIR"
NODE_ENV="$NODE_ENV" nohup node "$BACKEND_ENTRY" >> "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"
cd "$PROJECT_DIR"

sleep 3

if kill -0 "$NEW_PID" 2>/dev/null; then
  success "Backend started. PID: $NEW_PID"
else
  error "Backend process died immediately after start. Check logs:"
  tail -30 "$LOG_FILE"
  exit 1
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
echo -e "${BOLD}Backend PID:${RESET} $NEW_PID"
echo -e "${BOLD}Log file:${RESET}    $LOG_FILE"
echo ""
echo -e "${BOLD}Recent backend logs:${RESET}"
tail -20 "$LOG_FILE"
echo ""
