const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');

const mobileKeys = ['APP_ENV', 'API_BASE_URL', 'SOCKET_BASE_URL'];

module.exports = (api) => {
  const source = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  api.cache.using(() => fs.readFileSync(path.join(__dirname, '.env'), 'utf8'));
  const values = parseEnv(source);

  for (const key of mobileKeys) {
    const assignments = source
      .split(/\r?\n/)
      .filter((line) => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line));
    if (assignments.length !== 1 || !values[key]) {
      throw new Error(`.env must contain exactly one active ${key}. Enable either Dev or Prod.`);
    }
  }
  if (!['development', 'production'].includes(values.APP_ENV)) {
    throw new Error('.env APP_ENV must be development or production');
  }
  for (const key of ['API_BASE_URL', 'SOCKET_BASE_URL']) {
    const url = new URL(values[key]);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (values.APP_ENV === 'production' && url.protocol !== 'https:')
    ) {
      throw new Error(`.env ${key} must use HTTP(S), and HTTPS in production`);
    }
  }

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      function inlineMobileEnvironment({ types }) {
        return {
          visitor: {
            MemberExpression(nodePath) {
              const node = nodePath.node;
              if (
                !node.computed &&
                types.isIdentifier(node.property) &&
                mobileKeys.includes(node.property.name) &&
                types.isMemberExpression(node.object) &&
                !node.object.computed &&
                types.isIdentifier(node.object.object, { name: 'process' }) &&
                types.isIdentifier(node.object.property, { name: 'env' })
              ) {
                nodePath.replaceWith(types.stringLiteral(values[node.property.name]));
              }
            },
          },
        };
      },
    ],
  };
};
