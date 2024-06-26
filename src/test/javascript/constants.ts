import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'node:path';

export const FIREBASE_PROJECT_ID = 'oncokb-curation-test-54b6c';

export const BASE_URL = process.env.DOCKER ? 'https://app:9000' : 'http://localhost:9000';
export const DATABASE_EMULATOR_URL = process.env.DOCKER ? 'http://firebase/?ns=mock-data' : 'http://localhost:9095/?ns=mock-data';

export const MOCK_DATA_JSON_FILE_PATH = 'src/test/javascript/firebase/mock-data.json';

export const FIREBASE_AUTH_TOKEN_MOCK =
  'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJmaXJlYmFzZUF1dGhvcml6ZWRVc2VyIjp0cnVlfSwiZXhwIjoxNzE1MTk2MDAxLCJpYXQiOjE3MTUxOTI0MDEsImlzcyI6ImZpcmViYXNlLWFkbWluc2RrLXVrNjRhQGRldi1vbmNva2ItY3VyYXRpb24tdjIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay11azY0YUBkZXYtb25jb2tiLWN1cmF0aW9uLXYyLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiYnByaXplMTVAZ21haWwuY29tIn0.XCZVZG4RgwZ3XoO_uKERJFRsHNAn9pVXT12NkHTN4LgWIlfZPzKAszHinWGK9XQqbxWWxryDCE8YtJ-BNvIFNU-J5cFUgUzbYCYhoNWQy4g4M90Zwf1U478F2LjL6kYbSTxcCpfUBGI3RT-cea9GhOx8PjE_T78JZYeI-1xCHPOm78ABfaDEnfcb7l8mFVyCUqbXRhRtZa6Sl-K1TnFtuXgZQLK24Yp9iXTBbFKvndc7J6ymS2OTL7aRQGROMMSyWMNs8rdThW2e5eHz4tl9ICH0gWvzRXCwH7sXgGXw5o0XoCH4hFUlhxhkT2yjThY1b10GTS_BWB3PF2bi3a-JXA';

export const PUB_MED_ARTICLE_TITLE = 'The RAF proteins take centre stage.';
export const PUB_MED_PMID = '15520807';

export const SCREENSHOT_METHOD_OPTIONS: WdioCheckElementMethodOptions = {
  actualFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/actual'),
  baselineFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/baseline'),
  diffFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/diff'),
};
