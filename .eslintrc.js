const path = require('path');

const NETWORK_GLOBALS = ['fetch', 'XMLHttpRequest', 'WebSocket'];
const NETWORK_MESSAGE =
  'Network requests go through httpClient in src/shared/api.';
const GLOBAL_OBJECTS = ['globalThis', 'global', 'window', 'self'];

const EXPORT_SELECTORS = [
  {
    selector: 'ExportDefaultDeclaration',
    message: 'Use a named export.',
  },
  {
    selector: 'ExportSpecifier[exported.name="default"]',
    message: 'Use a named export.',
  },
  {
    selector: 'ExportAllDeclaration',
    message: 'Re-export by name instead of export *.',
  },
];

const STORE_CALL =
  'CallExpression[callee.name=/^(configureStore|persistStore)$/]';
const STORE_MESSAGE =
  'Create the store inside createPersistedStore, never at module level.';
const STORE_SELECTORS = [
  `Program > VariableDeclaration > VariableDeclarator > ${STORE_CALL}`,
  `Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ${STORE_CALL}`,
  `Program > ExpressionStatement > ${STORE_CALL}`,
].map(selector => ({ selector, message: STORE_MESSAGE }));

const STYLE_SELECTORS = [
  {
    selector:
      'JSXAttribute[name.name=/^style$|Style$/] > JSXExpressionContainer > :matches(ObjectExpression, ArrayExpression)',
    message:
      'Static styles go to className; runtime values are passed as a memoized variable.',
  },
];

const COLOR_MESSAGE = 'Colors come from src/shared/theme/tokens.ts.';
const COLOR_SELECTORS = [
  'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
  'Literal[value=/^(rgb|rgba|hsl|hsla)\\(/]',
  'TemplateElement[value.raw=/^(rgb|rgba|hsl|hsla)\\(/]',
].map(selector => ({ selector, message: COLOR_MESSAGE }));

const CLASS_NAME_MESSAGE =
  'Combine complete class strings with clsx; Tailwind cannot see interpolated class names.';
const CLASS_NAME_SELECTORS = [
  'JSXAttribute[name.name=/^className$|ClassName$/] TemplateLiteral',
  'CallExpression[callee.name="clsx"] TemplateLiteral',
].map(selector => ({ selector, message: CLASS_NAME_MESSAGE }));

const SOURCE_SYNTAX_SELECTORS = [
  ...EXPORT_SELECTORS,
  ...STORE_SELECTORS,
  ...STYLE_SELECTORS,
  ...CLASS_NAME_SELECTORS,
];

const DEEP_ALIAS_PATTERNS = [
  '@app/*',
  '@pages/*/*',
  '@widgets/*/*',
  '@features/*/*',
  '@entities/*/*',
  '@shared/api/*',
  '@shared/config/*',
  '@shared/theme/*',
  '@shared/ui/*',
  '@shared/lib/*/*',
];

const STATE_AND_QUERY_LIBRARIES = [
  'zustand',
  'mobx',
  'mobx-react',
  'mobx-react-lite',
  'mobx-state-tree',
  'jotai',
  'recoil',
  'valtio',
  'effector',
  '@tanstack/react-query',
  'react-query',
  'swr',
  '@reduxjs/toolkit/query',
  '@reduxjs/toolkit/query/react',
  '@react-native-async-storage/async-storage',
];

const HTTP_CLIENTS = [
  'axios',
  'ky',
  'superagent',
  'got',
  'node-fetch',
  'cross-fetch',
  'isomorphic-fetch',
  'undici',
  'wretch',
  'ofetch',
  'redaxios',
];

const REACT_NATIVE_NEVER = ['SafeAreaView', 'StyleSheet'];
const REACT_NATIVE_PRIMITIVES = [
  'ActivityIndicator',
  'Button',
  'Image',
  'ImageBackground',
  'Modal',
  'Pressable',
  'Switch',
  'Text',
  'TextInput',
  'TouchableHighlight',
  'TouchableOpacity',
  'TouchableWithoutFeedback',
];
const REACT_NATIVE_MESSAGE =
  'Visual primitives come from @shared/ui, StatusBar is set in src/app/index.tsx, StyleSheet and SafeAreaView are not used.';

const ZOD_MESSAGE =
  'Schemas live in src/shared/api, the api and model segments of entities and features, and src/app/state.';

const createRestrictedImports = ({
  allowPrimitives = false,
  allowStatusBar = false,
  allowRawReduxHooks = false,
  allowMmkv = false,
  allowFakerLocale = false,
  allowImageUrl = false,
  allowNavigation = false,
  allowZod = false,
} = {}) => {
  const reactNativeNames = [
    ...REACT_NATIVE_NEVER,
    ...(allowPrimitives ? [] : REACT_NATIVE_PRIMITIVES),
    ...(allowStatusBar ? [] : ['StatusBar']),
  ];

  const paths = [
    {
      name: 'react-native',
      importNames: reactNativeNames,
      message: REACT_NATIVE_MESSAGE,
    },
    {
      name: '@faker-js/faker',
      message:
        'Import @faker-js/faker/locale/en in src/shared/lib/image-url; the root entry bundles every locale.',
    },
    ...STATE_AND_QUERY_LIBRARIES.map(name => ({
      name,
      message:
        'Global state lives in Redux Toolkit slices persisted with redux-persist on MMKV.',
    })),
    ...HTTP_CLIENTS.map(name => ({ name, message: NETWORK_MESSAGE })),
    ...(allowRawReduxHooks
      ? []
      : [
          {
            name: 'react-redux',
            importNames: ['useDispatch', 'useSelector', 'useStore'],
            message:
              'Use useAppDispatch and useAppSelector from @shared/lib/redux.',
          },
        ]),
    ...(allowMmkv
      ? []
      : [
          {
            name: 'react-native-mmkv',
            message:
              'MMKV is used only by createMmkvStorage in src/shared/lib/storage.',
          },
        ]),
    ...(allowImageUrl
      ? []
      : [
          {
            name: '@shared/lib/image-url',
            message:
              'Faker images are generated once, inside the thunks of src/entities/post/model/thunks.ts.',
          },
        ]),
    ...(allowZod
      ? []
      : [
          {
            name: 'zod',
            message: ZOD_MESSAGE,
          },
        ]),
  ];

  const patterns = [
    {
      group: DEEP_ALIAS_PATTERNS,
      message:
        'Import the public API of a slice or a shared segment, never a file inside it.',
    },
    {
      group: allowFakerLocale
        ? [
            '@faker-js/faker/*',
            '!@faker-js/faker/locale',
            '@faker-js/faker/locale/*',
            '!@faker-js/faker/locale/en',
          ]
        : ['@faker-js/faker/*'],
      message:
        'Faker is imported only from @faker-js/faker/locale/en in src/shared/lib/image-url.',
    },
    {
      group: ['zod/*'],
      message:
        'Import z from zod; zod/mini, zod/v3 and other entries are not used.',
    },
    ...(allowNavigation
      ? []
      : [
          {
            group: ['@react-navigation/*'],
            message:
              'Only src/app/navigation, src/pages and src/shared/config use React Navigation; pass callbacks down.',
          },
        ]),
  ];

  return ['error', { paths, patterns }];
};

const IMPORT_EXCEPTIONS = [
  { files: ['src/shared/ui/**'], allow: { allowPrimitives: true } },
  { files: ['src/app/index.tsx'], allow: { allowStatusBar: true } },
  { files: ['src/shared/lib/redux/**'], allow: { allowRawReduxHooks: true } },
  { files: ['src/shared/lib/storage/**'], allow: { allowMmkv: true } },
  { files: ['src/shared/lib/image-url/**'], allow: { allowFakerLocale: true } },
  {
    files: ['src/entities/post/model/thunks.ts'],
    allow: { allowImageUrl: true, allowZod: true },
  },
  {
    files: ['src/app/navigation/**', 'src/pages/**', 'src/shared/config/**'],
    allow: { allowNavigation: true },
  },
  {
    files: [
      'src/shared/api/**',
      'src/entities/*/api/**',
      'src/entities/*/model/**',
      'src/features/*/model/**',
      'src/app/state/**',
    ],
    excludedFiles: ['src/entities/post/model/thunks.ts'],
    allow: { allowZod: true },
  },
];

module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['tailwindcss', 'local-rules'],
  noInlineConfig: true,
  ignorePatterns: [
    'node_modules/',
    'vendor/',
    'coverage/',
    'ios/Pods/',
    'ios/build/',
    'android/build/',
    'android/app/build/',
    '!.prettierrc.js',
  ],
  settings: {
    tailwindcss: {
      config: path.join(__dirname, 'tailwind.config.js'),
      callees: ['clsx'],
      classRegex: '^(className|[a-zA-Z]+ClassName)$',
    },
  },
  rules: {
    'no-console': 'error',
    'local-rules/no-comments': 'error',
    'no-restricted-syntax': ['error', ...EXPORT_SELECTORS],
    'no-restricted-globals': [
      'error',
      ...NETWORK_GLOBALS.map(name => ({ name, message: NETWORK_MESSAGE })),
    ],
    'no-restricted-properties': [
      'error',
      ...GLOBAL_OBJECTS.flatMap(object =>
        NETWORK_GLOBALS.map(property => ({
          object,
          property,
          message: NETWORK_MESSAGE,
        })),
      ),
    ],
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'tailwindcss/no-custom-classname': 'error',
    'tailwindcss/no-arbitrary-value': 'error',
    'tailwindcss/no-contradicting-classname': 'error',
    'tailwindcss/classnames-order': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-check': false,
            'ts-expect-error': true,
            'ts-ignore': true,
            'ts-nocheck': true,
          },
        ],
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          { assertionStyle: 'never' },
        ],
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
      },
    },
    {
      files: ['*.mjs'],
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      env: { node: true, es2024: true },
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'no-restricted-imports': createRestrictedImports(),
        'no-restricted-syntax': [
          'error',
          ...SOURCE_SYNTAX_SELECTORS,
          ...COLOR_SELECTORS,
        ],
        'react/no-unstable-nested-components': 'error',
      },
    },
    ...IMPORT_EXCEPTIONS.map(({ files, excludedFiles = [], allow }) => ({
      files,
      excludedFiles,
      rules: { 'no-restricted-imports': createRestrictedImports(allow) },
    })),
    {
      files: ['src/shared/theme/tokens.ts'],
      rules: {
        'no-restricted-syntax': ['error', ...SOURCE_SYNTAX_SELECTORS],
      },
    },
    {
      files: ['src/shared/api/**'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-properties': 'off',
      },
    },
    {
      files: ['src/shared/config/routes.ts'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },
    {
      files: ['steiger.config.mjs'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...EXPORT_SELECTORS.filter(
            ({ selector }) => selector !== 'ExportDefaultDeclaration',
          ),
        ],
      },
    },
  ],
};
