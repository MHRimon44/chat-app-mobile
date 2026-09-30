const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  cacheVersion: crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(__dirname, '.env')))
    .digest('hex'),
});
