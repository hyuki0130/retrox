#!/bin/bash

# =============================================================================
# setup-hooks.sh - Install Git Hooks
# =============================================================================
# Run this once to set up automatic pre-commit checks
# =============================================================================

set -e

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  Setting up Git Hooks"
echo "========================================"

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Run pre-commit checks
./scripts/pre-commit-check.sh

# If checks fail, abort commit
if [ $? -ne 0 ]; then
    echo ""
    echo "Commit aborted. Fix the issues above and try again."
    echo "To skip (NOT RECOMMENDED): git commit --no-verify"
    exit 1
fi
EOF

chmod +x "$HOOKS_DIR/pre-commit"

# Create commit-msg hook (optional: validate commit message format)
cat > "$HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check for conventional commit format
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+"; then
    echo ""
    echo "ERROR: Invalid commit message format!"
    echo ""
    echo "Expected format: type(scope): description"
    echo "Example: feat(game): add Snake game"
    echo "         fix(coins): correct reward calculation"
    echo ""
    echo "Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    exit 1
fi
EOF

chmod +x "$HOOKS_DIR/commit-msg"

echo ""
echo -e "  pre-commit hook: INSTALLED"
echo -e "  commit-msg hook: INSTALLED"
echo ""
echo "========================================"
echo "  Setup complete!"
echo "========================================"
echo ""
echo "Hooks will run automatically on:"
echo "  - git commit (pre-commit checks)"
echo "  - Commit message validation"
echo ""
echo "To skip hooks (NOT RECOMMENDED):"
echo "  git commit --no-verify"
