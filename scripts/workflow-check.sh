#!/bin/bash

# =============================================================================
# workflow-check.sh - Full Workflow Status Check
# =============================================================================
# Usage: ./scripts/workflow-check.sh [issue-id]
# Example: ./scripts/workflow-check.sh HYU-113
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUE_ID="${1:-}"

echo "========================================"
echo "  Workflow Status Check"
echo "========================================"

# =============================================================================
# Gate 1: Pre-Work Checks
# =============================================================================
echo ""
echo -e "${BLUE}[Gate 1] Pre-Work${NC}"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -n "  Current branch: "
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${RED}$CURRENT_BRANCH (WARNING: Working on main!)${NC}"
else
    echo -e "${GREEN}$CURRENT_BRANCH${NC}"
fi

# Check worktrees
echo -n "  Worktrees: "
WORKTREE_COUNT=$(git worktree list | wc -l | tr -d ' ')
if [ "$WORKTREE_COUNT" -gt 1 ]; then
    echo -e "${GREEN}$WORKTREE_COUNT active${NC}"
    git worktree list | grep -v "$(pwd)$" | sed 's/^/    /'
else
    echo -e "${YELLOW}None (only main)${NC}"
fi

# =============================================================================
# Gate 2: Pre-Commit Checks (if issue-id provided)
# =============================================================================
if [ -n "$ISSUE_ID" ]; then
    echo ""
    echo -e "${BLUE}[Gate 2] Pre-Commit (Issue: $ISSUE_ID)${NC}"
    
    # Check if worktree exists for this issue
    echo -n "  Worktree for $ISSUE_ID: "
    if [ -d "worktree/$ISSUE_ID" ]; then
        echo -e "${GREEN}EXISTS${NC}"
        
        # Check for uncommitted changes
        cd "worktree/$ISSUE_ID"
        CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
        echo -n "  Uncommitted changes: "
        if [ "$CHANGES" -gt 0 ]; then
            echo -e "${YELLOW}$CHANGES files${NC}"
        else
            echo -e "${GREEN}None${NC}"
        fi
        cd - > /dev/null
    else
        echo -e "${RED}NOT FOUND${NC}"
    fi
fi

# =============================================================================
# Gate 3: PR Status
# =============================================================================
echo ""
echo -e "${BLUE}[Gate 3] PR Status${NC}"

# List open PRs
echo "  Open PRs:"
OPEN_PRS=$(gh pr list --state open --json number,title,headRefName 2>/dev/null || echo "[]")
if [ "$OPEN_PRS" = "[]" ]; then
    echo "    None"
else
    echo "$OPEN_PRS" | jq -r '.[] | "    #\(.number) [\(.headRefName)] \(.title)"'
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================"
echo "  Checklist"
echo "========================================"
echo "  [ ] Linear issue created and In Progress"
echo "  [ ] Working in worktree (not main)"
echo "  [ ] Lint/TypeCheck/Tests pass locally"
echo "  [ ] Committed with proper message"
echo "  [ ] Pushed to origin"
echo "  [ ] PR created with Linear link"
echo "  [ ] CI passed"
echo "  [ ] PR merged"
echo "  [ ] Linear updated to Done with Completed Work"
echo "  [ ] Worktree cleaned up"
echo "========================================"
