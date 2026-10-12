import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const ALLOWED_DEPENDENCIES = [
  '@faker-js/faker',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  '@reduxjs/toolkit',
  'clsx',
  'nativewind',
  'react',
  'react-native',
  'react-native-mmkv',
  'react-native-nitro-modules',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-worklets',
  'react-redux',
  'redux-persist',
  'zod',
];

const ALLOWED_DEV_DEPENDENCIES = [
  '@babel/core',
  '@babel/plugin-transform-export-namespace-from',
  '@babel/preset-env',
  '@babel/runtime',
  '@feature-sliced/steiger-plugin',
  '@react-native-community/cli',
  '@react-native-community/cli-platform-android',
  '@react-native-community/cli-platform-ios',
  '@react-native/babel-preset',
  '@react-native/eslint-config',
  '@react-native/metro-config',
  '@react-native/typescript-config',
  '@types/react',
  'babel-plugin-module-resolver',
  'eslint',
  'eslint-plugin-local-rules',
  'eslint-plugin-tailwindcss',
  'husky',
  'lint-staged',
  'prettier',
  'steiger',
  'tailwindcss',
  'typescript',
];

const FIELDS_THAT_STAY_EMPTY = [
  'optionalDependencies',
  'peerDependencies',
  'bundleDependencies',
];

const NODE_MODULES_SEGMENT = 'node_modules/';

const readJson = file => JSON.parse(readFileSync(join(rootDir, file), 'utf8'));

const isExpoPackage = name =>
  name === 'expo' || name.startsWith('expo-') || name.startsWith('@expo/');

const findUnlisted = (declared, allowed) =>
  Object.keys(declared ?? {}).filter(name => !allowed.includes(name));

const toPackageName = lockPath =>
  lockPath.slice(
    lockPath.lastIndexOf(NODE_MODULES_SEGMENT) + NODE_MODULES_SEGMENT.length,
  );

const findExpoPackages = lockfile => {
  const names = Object.entries(lockfile.packages ?? {})
    .filter(([lockPath]) => lockPath.includes(NODE_MODULES_SEGMENT))
    .flatMap(([lockPath, entry]) => [toPackageName(lockPath), entry.name ?? ''])
    .filter(isExpoPackage);
  return [...new Set(names)].sort();
};

const main = () => {
  const manifest = readJson('package.json');
  const lockfile = readJson('package-lock.json');

  const problems = [
    ...findUnlisted(manifest.dependencies, ALLOWED_DEPENDENCIES).map(
      name => `dependency "${name}" is not on the allowlist`,
    ),
    ...findUnlisted(manifest.devDependencies, ALLOWED_DEV_DEPENDENCIES).map(
      name => `devDependency "${name}" is not on the allowlist`,
    ),
    ...FIELDS_THAT_STAY_EMPTY.filter(
      field => Object.keys(manifest[field] ?? {}).length > 0,
    ).map(field => `"${field}" must stay empty`),
    ...findExpoPackages(lockfile).map(
      name => `Expo package "${name}" is in package-lock.json`,
    ),
  ];

  if (problems.length > 0) {
    process.stderr.write(
      `[deps] ${problems.length} problem(s):\n${problems
        .map(problem => `  - ${problem}`)
        .join('\n')}\n`,
    );
    process.stderr.write(
      '[deps] A new package needs the user approval, an allowlist entry and a note in docs/ai/guidelines/react-native.md.\n',
    );
    return 1;
  }

  process.stdout.write(
    `[deps] ${
      Object.keys(manifest.dependencies ?? {}).length
    } dependencies and ${
      Object.keys(manifest.devDependencies ?? {}).length
    } devDependencies are on the allowlist; package-lock.json has no Expo packages.\n`,
  );
  return 0;
};

process.exitCode = main();
