#!/bin/bash
# Checks to run before every EAS build (the release agent runs this): everything a build has
# failed on before, caught here in a few minutes instead of 25 minutes into an Expo build.
# Usage: scripts/preflight.sh            (from milemint/)
# Exit 0: safe to build. Anything else: fix first.
cd "$(dirname "$0")/.." || exit 1
FAIL=0
step() { printf '\n== %s\n' "$1"; }
bad() { echo "FAIL: $1"; FAIL=1; }

step "Committed and pushed"
[ -z "$(git status --porcelain -- . ':!ios')" ] || bad "uncommitted changes (EAS builds what's on disk; commit first so the build matches the code)"
git fetch -q origin "$(git branch --show-current)" 2>/dev/null
[ "$(git rev-parse HEAD)" = "$(git rev-parse '@{u}' 2>/dev/null)" ] || echo "note: local branch differs from its upstream"

step "Types"
npx tsc --noEmit -p . || bad "typecheck"

step "Tests"
npx jest --silent 2>&1 | grep -E "^Tests:|^Test Suites:|✕|FAIL " ; [ "${PIPESTATUS[0]}" = 0 ] || bad "tests"

step "Lint"
npx expo lint >/dev/null 2>&1 || { npx expo lint | tail -20; bad "lint"; }

step "Translations (10 languages, nothing missing or stale)"
npx tsx scripts/i18n-keys.ts >/dev/null
for l in es pt-BR fr ro pl hi pa bn zh-Hans; do
  out=$(npx tsx scripts/i18n-missing.ts "$l" | tr -d '\n ')
  [ "$out" = '{"missing":[],"stale":[]}' ] || bad "i18n $l: ${out:0:200}"
done
[ -z "$(git status --porcelain src/i18n/source-keys.json)" ] || bad "src/i18n/source-keys.json changed: commit it"

step "Patches match installed versions"
for p in patches/*.patch; do
  name=$(basename "$p" .patch); pkg=${name%+*}; ver=${name##*+}; pkg=${pkg//+//}
  have=$(node -p "require('$pkg/package.json').version" 2>/dev/null)
  [ "$have" = "$ver" ] || bad "$p is for $pkg $ver but $have is installed"
done

step "Native project (prebuild into a scratch copy)"
TMP=$(mktemp -d)
git ls-files | grep -v '^ios/' | tar -cf - -T - | tar -xf - -C "$TMP"
ln -s "$PWD/node_modules" "$TMP/node_modules"
if (cd "$TMP" && npx expo prebuild -p ios --no-install >"$TMP/prebuild.log" 2>&1); then
  PBX=$(ls "$TMP"/ios/*.xcodeproj/project.pbxproj)
  TARGET=$(grep -o 'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*' "$PBX" | sort -u | awk '{print $3}' | sort -V | head -1)
  echo "iOS deployment target: $TARGET"
  # Build 60: Xcode refuses AppShortcuts.xcstrings below iOS 17.
  if grep -q 'AppShortcuts.xcstrings' "$PBX" && [ "$(printf '%s\n17.0\n' "$TARGET" | sort -V | head -1)" != "17.0" ]; then
    bad "AppShortcuts.xcstrings needs iOS 17, the app targets $TARGET"
  fi
  grep -q 'com.apple.developer.icloud-container-identifiers' "$TMP"/ios/*/*.entitlements || bad "iCloud container entitlement missing"
  grep -q 'com.apple.security.application-groups' "$TMP"/ios/*/*.entitlements || bad "App Group entitlement missing"
else
  tail -20 "$TMP/prebuild.log"; bad "expo prebuild"
fi
rm -rf "$TMP"

echo
if [ $FAIL = 0 ]; then echo "PREFLIGHT OK: safe to build."; else echo "PREFLIGHT FAILED: fix the above before building."; fi
exit $FAIL
