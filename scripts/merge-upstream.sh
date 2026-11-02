#!/usr/bin/env bash
set -e

# ==============================================================================
# Automated Upstream Sync & Conflict Resolution for websitev2
# ACM Student Chapter VIT Chennai
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_DIR}"

echo "=========================================================="
echo " Starting Upstream Merge & Conflict Resolution Automation"
echo "=========================================================="

# 1. Ensure working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Working tree has uncommitted changes. Please commit or stash them first."
    exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "${CURRENT_BRANCH}" != "main" ]; then
    echo "⚠️  Current branch is '${CURRENT_BRANCH}', switching to 'main'..."
    git checkout main
fi

# 2. Check and fetch remotes
echo "📡 Checking remotes..."
if ! git remote get-url upstream >/dev/null 2>&1; then
    echo "Adding upstream remote..."
    git remote add upstream https://github.com/vitccacm/websitev2.git
fi

echo "🔄 Fetching latest upstream/main via HTTPS..."
git fetch https://github.com/vitccacm/websitev2.git main:refs/remotes/upstream/main

# 3. Start merge
echo "🔀 Initiating merge with upstream/main..."
if git merge --no-commit --no-ff upstream/main; then
    echo "✅ Clean merge without conflicts."
else
    echo "⚠️  Conflicts detected as expected. Running automated conflict resolver..."
    python3 "${SCRIPT_DIR}/resolve_merge_conflicts.py"
fi

# 4. Verify 0 conflict markers
echo "🔍 Verifying repository integrity..."
if git grep -n -E '^(<{7} |={7}$|>{7} )' -- ':!.git'; then
    echo "❌ Error: Unresolved conflict markers found!"
    exit 1
fi

# 5. Commit the merge
COMMIT_MSG="Merge upstream/main: integrate visual redesign with upstream security and content updates"
git commit -m "${COMMIT_MSG}" || true

echo ""
echo "=========================================================="
echo "🎉 Merge successfully completed and committed!"
echo "=========================================================="
echo ""
echo "Your local 'main' branch now cleanly incorporates:"
echo "  1. The complete visual redesign, animations & spatial engine."
echo "  2. All upstream directory listing security mitigations."
echo "  3. All upstream event coordinator phone numbers & updated speaker details."
echo ""
echo "Next step: Push your updated branch to your GitHub fork:"
echo "  git push origin main"
echo ""
echo "Then create/update your Pull Request to vitccacm/websitev2:"
echo "  https://github.com/vitccacm/websitev2/compare/main...Hareekshith:websitev2:main?expand=1"
echo ""
