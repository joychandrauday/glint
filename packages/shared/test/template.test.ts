import assert from 'node:assert';
import {
  extractVariablesFromTemplate,
  substituteTemplateVariables,
  normalizeQuery,
} from '../src/utils/template.js';

console.log('--- Testing @glint/shared Template Engine ---');

// Test 1: Extract variables
const template1 = 'docker run -d -p {{host_port:8080}}:{{container_port:80}} --name {{name}} {{image:nginx:latest}}';
const vars = extractVariablesFromTemplate(template1);
assert.strictEqual(vars.length, 4);
assert.strictEqual(vars[0].name, 'host_port');
assert.strictEqual(vars[0].defaultValue, '8080');
assert.strictEqual(vars[1].name, 'container_port');
assert.strictEqual(vars[2].name, 'name');
assert.strictEqual(vars[2].defaultValue, '');
assert.strictEqual(vars[3].name, 'image');
assert.strictEqual(vars[3].defaultValue, 'nginx:latest');
console.log('✓ extractVariablesFromTemplate passed');

// Test 2: Substitute with defaults
const substitutedDefault = substituteTemplateVariables(template1, {});
assert.strictEqual(
  substitutedDefault,
  'docker run -d -p 8080:80 --name <name> nginx:latest'
);
console.log('✓ substituteTemplateVariables with defaults passed');

// Test 3: Substitute with user values
const substitutedCustom = substituteTemplateVariables(template1, {
  host_port: '3000',
  container_port: '3000',
  name: 'my-frontend',
  image: 'node:20-alpine',
});
assert.strictEqual(
  substitutedCustom,
  'docker run -d -p 3000:3000 --name my-frontend node:20-alpine'
);
console.log('✓ substituteTemplateVariables with custom values passed');

// Test 4: Query normalization
const query1 = '  Kill Port  3000!! ';
const normalized1 = normalizeQuery(query1);
assert.strictEqual(normalized1, 'kill port 3000');
console.log('✓ normalizeQuery passed');

console.log('--- ALL SHARED TESTS PASSED ---');
