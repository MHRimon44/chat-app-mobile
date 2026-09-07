#!/usr/bin/env bash

set -Eeuo pipefail

failures=0

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

require_command java 'Install JDK 17 and configure JAVA_HOME.'
require_command adb 'Install Android SDK Platform Tools and add them to PATH.'
require_command curl 'Install curl for local readiness checks.'

if command -v java >/dev/null 2>&1; then
  java_version="$(java -version 2>&1 | sed -n '1p')"
  echo "[info] ${java_version}"
fi

if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
  echo '[missing] ANDROID_HOME or ANDROID_SDK_ROOT is not configured.' >&2
  failures=$((failures + 1))
else
  echo "[ok] Android SDK: ${ANDROID_HOME:-${ANDROID_SDK_ROOT}}"
fi

if command -v adb >/dev/null 2>&1; then
  device_lines="$(adb devices | sed '1d' | sed '/^[[:space:]]*$/d')"
  if [[ -z "${device_lines}" ]]; then
    echo '[warning] No Android emulator or USB device is currently connected.'
  elif echo "${device_lines}" | grep -q $'\tunauthorized$'; then
    echo '[missing] An Android device is unauthorized; approve the USB debugging prompt.' >&2
    failures=$((failures + 1))
  else
    echo '[ok] Connected Android target detected.'
  fi
fi

if (( failures > 0 )); then
  echo "Android doctor found ${failures} blocking issue(s)." >&2
  exit 1
fi

echo 'Android toolchain checks passed.'
