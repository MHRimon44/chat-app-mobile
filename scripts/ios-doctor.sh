#!/usr/bin/env bash

set -Eeuo pipefail

failures=0

if [[ "$(uname -s)" != 'Darwin' ]]; then
  echo '[missing] iOS builds require macOS.' >&2
  exit 1
fi

require_command() {
  local command_name="$1"
  local guidance="$2"
  if command -v "${command_name}" >/dev/null 2>&1; then
    echo "[ok] ${command_name}: $(command -v "${command_name}")"
  else
    echo "[missing] ${command_name}: ${guidance}" >&2
    failures=$((failures + 1))
  fi
}

require_command xcodebuild 'Install full Xcode from the App Store.'
require_command xcrun 'Install Xcode command-line tools.'
require_command ruby 'Install a Ruby version compatible with Gemfile.'
require_command bundle 'Install Bundler with: gem install bundler'
require_command curl 'Install curl for local readiness checks.'

if command -v xcodebuild >/dev/null 2>&1; then
  xcodebuild -version
  if ! xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1; then
    echo '[missing] Complete Xcode first-launch components and accept its license.' >&2
    failures=$((failures + 1))
  fi
fi

if command -v xcrun >/dev/null 2>&1; then
  if xcrun simctl list devices available | grep -q 'iPhone'; then
    echo '[ok] An available iPhone Simulator runtime was found.'
  else
    echo '[missing] Install an iOS Simulator runtime through Xcode settings.' >&2
    failures=$((failures + 1))
  fi
fi

if (( failures > 0 )); then
  echo "iOS doctor found ${failures} blocking issue(s)." >&2
  exit 1
fi

echo 'iOS toolchain checks passed.'
