import { browser, $, expect } from '@wdio/globals';
import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'path';

const BASE_URL = process.env.DOCKER ? 'https://app:9000' : 'http://localhost:9000';
const DATABASE_EMULATOR_URL = process.env.DOCKER ? 'http://firebase/?ns=mock-data' : 'http://localhost/?ns=mock-data';

describe('Screenshot Tests', () => {
  const methodOptions: WdioCheckElementMethodOptions = {
    actualFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/actual'),
    baselineFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/baseline'),
    diffFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/diff'),
  };

  before(async () => {
    const firebaseConfig = JSON.stringify({
      firebase: {
        enabled: true,
        connectToFirebaseEmulators: true,
        databaseURL: DATABASE_EMULATOR_URL,
        apiKey: 'AIzaSyCUd3bf-TEg5T78w_-RKT6uV_pf3VTVvo8',
        projectId: 'oncokb-curation-test-54b6c',
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
    authMock.respond(
      {
        authorities: ['ROLE_CURATOR', 'ROLE_USER'],
      },
      {
        statusCode: 200,
        fetchResponse: false,
      },
    );
    const firebaseTokenMock = await browser.mock('**/api/account/firebase-token');
    firebaseTokenMock.respond(
      'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJmaXJlYmFzZUF1dGhvcml6ZWRVc2VyIjp0cnVlfSwiZXhwIjoxNzE1MTk2MDAxLCJpYXQiOjE3MTUxOTI0MDEsImlzcyI6ImZpcmViYXNlLWFkbWluc2RrLXVrNjRhQGRldi1vbmNva2ItY3VyYXRpb24tdjIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay11azY0YUBkZXYtb25jb2tiLWN1cmF0aW9uLXYyLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiYnByaXplMTVAZ21haWwuY29tIn0.XCZVZG4RgwZ3XoO_uKERJFRsHNAn9pVXT12NkHTN4LgWIlfZPzKAszHinWGK9XQqbxWWxryDCE8YtJ-BNvIFNU-J5cFUgUzbYCYhoNWQy4g4M90Zwf1U478F2LjL6kYbSTxcCpfUBGI3RT-cea9GhOx8PjE_T78JZYeI-1xCHPOm78ABfaDEnfcb7l8mFVyCUqbXRhRtZa6Sl-K1TnFtuXgZQLK24Yp9iXTBbFKvndc7J6ymS2OTL7aRQGROMMSyWMNs8rdThW2e5eHz4tl9ICH0gWvzRXCwH7sXgGXw5o0XoCH4hFUlhxhkT2yjThY1b10GTS_BWB3PF2bi3a-JXA',
      {
        statusCode: 200,
        fetchResponse: false,
      },
    );
    const drugsMock = await browser.mock('**/api/drugs*');
    drugsMock.respond(
      [
        {
          id: 1,
          uuid: '2e8ce490-86c2-45a4-a6e4-db5e5314981c',
          name: 'Prednisolone',
          nciThesaurus: {
            id: 158405,
            version: '23.11d',
            code: 'C769',
            preferredName: 'Prednisolone',
            displayName: 'Prednisolone',
            synonyms: null,
          },
          fdaDrugs: [],
          flags: [],
          associations: [],
        },
        {
          id: 15,
          uuid: '939cd40b-b515-499d-b099-fd29027c0d17',
          name: 'Dabrafenib',
          nciThesaurus: {
            id: 163898,
            version: '23.11d',
            code: 'C82386',
            preferredName: 'Dabrafenib',
            displayName: 'Dabrafenib',
            synonyms: null,
          },
          fdaDrugs: [],
          flags: [],
          associations: [],
        },
      ],
      {
        statusCode: 200,
        fetchResponse: false,
      },
    );
    const genesMock = await browser.mock('**/api/genes/search*');
    genesMock.respond([{ hugoSymbol: 'BRAF' }, { hugoSymbol: 'ROS1' }, { hugoSymbol: 'TP53' }], {
      statusCode: 200,
      fetchResponse: false,
    });
    const annotateAlterationsMock = await browser.mock('**/api/annotate-alterations');
    annotateAlterationsMock.respond([], {
      statusCode: 200,
      fetchResponse: false,
    });

    await browser.setWindowSize(1920, 1080);
  });

  it('should compare gene list', async () => {
    await browser.url(`${BASE_URL}/curation`);

    const geneList = await $('#gene-list');
    await geneList.waitForDisplayed();

    const result = await browser.checkElement(geneList, 'gene-list', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare VUS table', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const vusTable = await $('div[data-testid="vus-table"]');
    await vusTable.waitForDisplayed();

    const result = await browser.checkElement(vusTable, 'vus-table', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare mutation collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsible = await $('div[data-testid="V600E-collapsible"]');
    await mutationCollapsible.waitForDisplayed();

    const result = await browser.checkElement(mutationCollapsible, 'mutation-collapsible', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare mutation effect not curatable', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsibleButton = await $('div[data-testid="V600E, V600K-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const mutationEffectNotCuratable = await $('div[data-testid="Mutation Effect-collapsible"]');
    await mutationEffectNotCuratable.waitForDisplayed();

    const result = await browser.checkElement(mutationEffectNotCuratable, 'mutation-effect-not-curatable', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare open therapy collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsibleButton = await $('div[data-testid="V600E-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $('div[data-testid="Cancer Type: Melanoma-collapsible-title-wrapper"]');
    await cancerTypeCollapsibleButton.click();

    const therapyCollapsibleButton = await $('div[data-testid="Therapy: Dabrafenib-collapsible-title-wrapper"]');
    await therapyCollapsibleButton.click();

    const openTherapyCollapsible = await $('div[data-testid="Therapy: Dabrafenib-collapsible"]');
    await openTherapyCollapsible.waitForDisplayed();
    await openTherapyCollapsible.scrollIntoView();

    const result = await browser.checkElement(openTherapyCollapsible, 'open-therapy-collapsible', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare modify therapy modal', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsibleButton = await $('div[data-testid="V600E-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $('div[data-testid="Cancer Type: Melanoma-collapsible-title-wrapper"]');
    await cancerTypeCollapsibleButton.click();

    const addTherapyButton = await $('button[data-testid="add-therapy"]');
    await addTherapyButton.click();

    const modifyTherapyModal = await $('div[data-testid="simple-confirm-modal-content"]');
    await modifyTherapyModal.waitForDisplayed();

    const result = await browser.checkElement(modifyTherapyModal, 'add-therapy-modal', methodOptions);
    expect(result).toBe(0);
  });

  it('should compare review page', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();

    const reviewPage = await $('div[data-testid="review-page"]');
    await reviewPage.waitForDisplayed();

    const result = await browser.checkElement(reviewPage, 'review-page', methodOptions);
    expect(result).toBe(0);

    // reset by going back to curation page
    const reviewCompleteButton = await $('button[data-testid="review-complete-button"]');
    await reviewCompleteButton.click();
  });
});
