#!/usr/bin/env bash

set -Eeuo pipefail

readonly repository_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

bash "${repository_root}/scripts/android-doctor.sh"

if ! curl --fail --silent --show-error http://127.0.0.1:4000/v1/health/ready >/dev/null; then
  echo 'The local API is not ready. Start the chat-app-backend project with: corepack yarn dev' >&2
  exit 1
fi

if ! curl --fail --silent http://127.0.0.1:8081/status | grep -q 'packager-status:running'; then
  echo 'Metro is not ready. Start it with: corepack yarn start' >&2
  exit 1
fi

adb wait-for-device
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000

cd "${repository_root}"
exec corepack yarn android
