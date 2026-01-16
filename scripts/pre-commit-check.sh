#!/bin/bash

# =============================================================================
# pre-commit-check.sh - Gate 2: Pre-Commit Validation
# =============================================================================
# Run this before committing to ensure code quality
# This script is also invoked automatically by git pre-commit hook
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Pre-Commit Check (Gate 2)"
echo "========================================"

# Detect which project has changes
MOBILE_CHANGED=false
BACKEND_CHANGED=false

if git diff --cached --name-only | grep -q "^mobile/"; then
    MOBILE_CHANGED=true
fi

if git diff --cached --name-only | grep -q "^backend/"; then
    BACKEND_CHANGED=true
fi

# If no staged changes, check unstaged
if [ "$MOBILE_CHANGED" = false ] && [ "$BACKEND_CHANGED" = false ]; then
    if git diff --name-only | grep -q "^mobile/"; then
        MOBILE_CHANGED=true
    fi
    if git diff --name-only | grep -q "^backend/"; then
        BACKEND_CHANGED=true
    fi
fi

FAILED=false

# =============================================================================
# Mobile Checks
# =============================================================================
if [ "$MOBILE_CHANGED" = true ]; then
    echo ""
    echo -e "${YELLOW}[Mobile]${NC} Running checks..."
    cd mobile

    # Lint
    echo -n "  Lint: "
    if npm run lint --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    # TypeCheck
    echo -n "  TypeCheck: "
    if npm run typecheck --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    # Unit Tests
    echo -n "  Unit Tests: "
    if npm test --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    cd ..
fi

# =============================================================================
# Backend Checks
# =============================================================================
if [ "$BACKEND_CHANGED" = true ]; then
    echo ""
    echo -e "${YELLOW}[Backend]${NC} Running checks..."
    cd backend

    # Lint
    echo -n "  Lint: "
    if npm run lint --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    # TypeCheck
    echo -n "  TypeCheck: "
    if npm run typecheck --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    # Unit Tests
    echo -n "  Unit Tests: "
    if npm test --silent 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        FAILED=true
    fi

    cd ..
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================"
if [ "$FAILED" = true ]; then
    echo -e "${RED}  BLOCKED: Fix failures before commit${NC}"
    echo "========================================"
    exit 1
else
    echo -e "${GREEN}  All checks passed!${NC}"
    echo "========================================"
    exit 0
fi
