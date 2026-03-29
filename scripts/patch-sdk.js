#!/usr/bin/env node
/**
 * Patches @anthropic-ai/claude-code SDK to:
 * 1. Use system `claude` binary via CLAUDE_SYSTEM_BINARY env var
 * 2. Ignore exit code 1 after receiving a successful result
 *
 * Why: The SDK bundles its own cli.js which may not match your installed
 * claude CLI version, causing auth/compatibility issues.
 */

const fs = require('fs');
const path = require('path');

const sdkPath = path.join(__dirname, '..', 'node_modules', '@anthropic-ai', 'claude-code', 'sdk.mjs');

if (!fs.existsSync(sdkPath)) {
  console.log('SDK not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(sdkPath, 'utf8');

// Patch 1: Support CLAUDE_SYSTEM_BINARY to bypass bundled cli.js
const spawnOriginal = `logDebug(\`Spawning Claude Code process: \${executable} \${[...executableArgs, pathToClaudeCodeExecutable, ...args].join(" ")}\`);
  const child = spawn(executable, [...executableArgs, pathToClaudeCodeExecutable, ...args], {`;

const spawnPatched = `// PATCHED: Support CLAUDE_SYSTEM_BINARY env var to use system claude binary
  const useSystemClaude = process.env.CLAUDE_SYSTEM_BINARY;
  const finalExe = useSystemClaude || executable;
  const finalArgs = useSystemClaude ? [...args] : [...executableArgs, pathToClaudeCodeExecutable, ...args];
  logDebug(\`Spawning Claude Code process: \${finalExe} \${finalArgs.join(" ")}\`);
  const child = spawn(finalExe, finalArgs, {`;

if (content.includes(spawnOriginal)) {
  content = content.replace(spawnOriginal, spawnPatched);
  console.log('✅ Patch 1 applied: CLAUDE_SYSTEM_BINARY support');
} else if (content.includes('CLAUDE_SYSTEM_BINARY')) {
  console.log('⏭️  Patch 1 already applied');
} else {
  console.warn('⚠️  Patch 1: Could not find spawn pattern to patch');
}

// Patch 2: Ignore exit code 1 after successful result
const exitOriginal = `let processError = null;`;
const exitPatched = `let processError = null;
    let gotResult = false;`;

if (content.includes(exitOriginal) && !content.includes('gotResult')) {
  content = content.replace(exitOriginal, exitPatched);

  // Also patch the exit code check
  content = content.replace(
    `if (code !== 0) {`,
    `if (code !== 0 && !gotResult) {`
  );

  // Mark result received
  content = content.replace(
    `yield JSON.parse(line);`,
    `const parsed = JSON.parse(line);
          if (parsed.type === 'result') gotResult = true;
          yield parsed;`
  );

  console.log('✅ Patch 2 applied: Ignore exit code 1 after result');
} else if (content.includes('gotResult')) {
  console.log('⏭️  Patch 2 already applied');
} else {
  console.warn('⚠️  Patch 2: Could not find exit pattern to patch');
}

fs.writeFileSync(sdkPath, content);
console.log('✅ SDK patching complete');
