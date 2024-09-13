import { browser } from '@wdio/globals';
import { DATABASE_EMULATOR_URL, FIREBASE_AUTH_TOKEN_MOCK, FIREBASE_PROJECT_ID } from './constants';
import * as fs from 'fs';
import { ManagementInfo } from '../../main/webapp/app/stores/management.store.ts';

const DATA_DIR = 'src/test/javascript/data/';

const getAlterationMockResponse = (requestBody: string, readFile = true) => {
  const body = JSON.parse(requestBody);
  const alterationName = body[0]?.alteration?.alteration?.toLowerCase();
  let filePath = `${DATA_DIR}api-annotate-alterations-`;
  switch (alterationName) {
    case 'v600e':
    case 'v600k':
      filePath += alterationName;
      break;
    default:
      break;
  }
  filePath += '.json';

  if (fs.existsSync(filePath)) {
    if (readFile) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    }
    return true;
  }
};

export default async function setUpMocks() {
  const firebaseConfig = JSON.stringify({
    firebase: {
      enabled: true,
      connectToFirebaseEmulators: true,
      databaseURL: DATABASE_EMULATOR_URL,
      apiKey: 'AIzaSyCUd3bf-TEg5T78w_-RKT6uV_pf3VTVvo8',
      projectId: FIREBASE_PROJECT_ID,
    },
  });

  const indexMock = await browser.mock(`**`, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
    statusCode: 200,
  });
  indexMock.respond(req => {
    if (typeof req.body === 'string') {
      req.body = req.body.replace(/(window\.serverConfig\.frontend\s*=\s*.*)({.*})(;)/, `$1${firebaseConfig}$3`);
    }
    return req.body;
  });

  const authMock = await browser.mock('**/api/account');
  const account = JSON.parse(fs.readFileSync(`${DATA_DIR}api-account.json`).toString());
  authMock.respond(account, {
    statusCode: 200,
    fetchResponse: false,
  });

  const managementInfoMock = await browser.mock('**/management/info');
  const defaultInfo: ManagementInfo = {
    git: {
      branch: 'rc',
      commit: {
        id: {
          describe: 'abc',
          abbrev: 'abc',
        },
      },
    },
    build: {
      artifact: 'oncokb-curation',
      name: 'OncoKB Curation',
      time: '2024-07-30',
      version: '2.0.11',
      group: 'org.mskcc.oncokb.curation',
    },
    activeProfiles: ['dev', 'api-docs'],
  };
  managementInfoMock.respond(defaultInfo, {
    statusCode: 200,
    fetchResponse: false,
  });

  const firebaseTokenMock = await browser.mock('**/api/account/firebase-token');
  firebaseTokenMock.respond(FIREBASE_AUTH_TOKEN_MOCK, {
    statusCode: 200,
    fetchResponse: false,
  });

  const drugsMock = await browser.mock('**/api/drugs*');
  const drugs = JSON.parse(fs.readFileSync(`${DATA_DIR}api-drugs.json`).toString());
  drugsMock.respond(drugs, {
    statusCode: 200,
    fetchResponse: false,
  });

  const genesMock = await browser.mock('**/api/genes/search*');
  const genes = JSON.parse(fs.readFileSync(`${DATA_DIR}api-genes-search.json`).toString());
  genesMock.respond(genes, {
    statusCode: 200,
    fetchResponse: false,
  });

  const annotateAlterationsMock = await browser.mock('**/api/annotate-alterations');
  annotateAlterationsMock.respond(req => getAlterationMockResponse(req.postData ?? ''), {
    statusCode(req) {
      if (getAlterationMockResponse(req.postData ?? '', false) === true) {
        return 200;
      }
      return 400;
    },
    fetchResponse: false,
  });

  const fetchAlterationCategoryFlagsMock = await browser.mock('**/api/flags?type.equals=ALTERATION_CATEGORY');
  const alterationCategoryFlags = JSON.parse(fs.readFileSync(`${DATA_DIR}api-flags-type-alteration-category.json`).toString());
  fetchAlterationCategoryFlagsMock.respond(alterationCategoryFlags, {
    statusCode: 200,
    fetchResponse: false,
  });

  const pubMedArticleMock = await browser.mock('**/api/articles/pubmed/15520807');
  const pubmedArticle = JSON.parse(fs.readFileSync(`${DATA_DIR}api-articles-pubmed-15520807.json`).toString());
  pubMedArticleMock.respond(pubmedArticle, {
    statusCode: 200,
    fetchResponse: false,
  });

  const consequencesMock = await browser.mock('**/api/consequences*');
  const consequences = JSON.parse(fs.readFileSync(`${DATA_DIR}api-consequences.json`).toString());
  consequencesMock.respond(consequences, {
    statusCode: 200,
    fetchResponse: false,
  });

  const relevantCancerTypesPx3Mock = await browser.mock('**/api/cancer-types/relevant?levelOfEvidence=LEVEL_Px3');
  const relevantCancerTypesPx3 = JSON.parse(fs.readFileSync(`${DATA_DIR}api-cancer-types-relevant-px3.json`).toString());
  relevantCancerTypesPx3Mock.respond(relevantCancerTypesPx3, {
    statusCode: 200,
    fetchResponse: false,
  });
}
