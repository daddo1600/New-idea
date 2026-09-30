// App entry. The fatal-error handler goes in first, before any other module
// loads, so even an error while the app's code is loading is shown on screen
// instead of silently closing the app (release builds give no other clue).
import { installFatalErrorAlert } from './src/errors/fatal-errors';

installFatalErrorAlert();

// Loaded after the handler on purpose, so `import` (which would be hoisted) isn't used.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('expo-router/entry');
