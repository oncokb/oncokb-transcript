import { browser, $, expect } from '@wdio/globals';
import setUpMocks from '../setup-mocks';
import {
  CLOSE_SIDEBAR_BUTTON_ID,
  DELETION_SECTION_MODAL_BUTTON_ID,
  GENE_HEADER_REVIEW_BUTTON_ID,
  GERMLINE_TOGGLE_BUTTON_ID,
  MUTATION_LIST_ID,
  MUTATION_NAME_BREADCRUMB_ID,
  OPEN_SIDEBAR_BUTTON_ID,
  SINGLE_MUTATION_VIEW_ID,
  SOMATIC_TOGGLE_BUTTON_ID,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH, PUB_MED_ARTICLE_TITLE, PUB_MED_PMID } from '../constants';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { createMutationOnCurationPage } from '../shared/utils';
import { CollapsibleDataTestIdType, getCollapsibleDataTestId } from '../../../main/webapp/app/shared/util/test-id-utils';

describe('End to end tests', () => {
  let adminApp: admin.app.App;

  const backup = JSON.parse(fs.readFileSync(MOCK_DATA_JSON_FILE_PATH).toString());

  before(async () => {
    await setUpMocks();
    adminApp = admin.initializeApp({
      databaseURL: DATABASE_EMULATOR_URL,
    });
  });

  beforeEach(async () => {
    // Reset database to a clean state before each test
    await adminApp.database().ref('/').set(backup);
  });

  it('should check somatic/germline toggle button colors', async () => {
    const UNSELECTED_COLOR = '#808080';
    const SOMATIC_SELECTED_COLOR = '#0968c3';
    const GERMLINE_SELECTED_COLOR = '#ffc107';

    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    let somaticButton = await $(`button[data-testid="${SOMATIC_TOGGLE_BUTTON_ID}"]`);
    let germlineButton = await $(`button[data-testid="${GERMLINE_TOGGLE_BUTTON_ID}"]`);
    await somaticButton.waitForDisplayed();
    await germlineButton.waitForDisplayed();

    expect((await somaticButton.getCSSProperty('background-color')).parsed.hex).toBe(SOMATIC_SELECTED_COLOR);
    expect((await germlineButton.getCSSProperty('background-color')).parsed.hex).toBe(UNSELECTED_COLOR);

    await germlineButton.click();

    somaticButton = await $(`button[data-testid="${SOMATIC_TOGGLE_BUTTON_ID}"]`);
    germlineButton = await $(`button[data-testid="${GERMLINE_TOGGLE_BUTTON_ID}"]`);
    await somaticButton.waitForDisplayed();
    await germlineButton.waitForDisplayed();

    expect((await somaticButton.getCSSProperty('background-color')).parsed.hex).toBe(UNSELECTED_COLOR);
    expect((await germlineButton.getCSSProperty('background-color')).parsed.hex).toBe(GERMLINE_SELECTED_COLOR);
  });

  it('should open/close sidebar', async () => {
    await browser.url(`${BASE_URL}/curation`);

    let openSidebarButton = await $(`span[data-testid="${OPEN_SIDEBAR_BUTTON_ID}"]`);
    let closeSidebarButton = await $(`span[data-testid="${CLOSE_SIDEBAR_BUTTON_ID}"]`);
    expect(await openSidebarButton.isExisting()).toBe(true);
    expect(await closeSidebarButton.isExisting()).toBe(false);

    await openSidebarButton.click();

    openSidebarButton = await $(`span[data-testid="${OPEN_SIDEBAR_BUTTON_ID}"]`);
    closeSidebarButton = await $(`span[data-testid="${CLOSE_SIDEBAR_BUTTON_ID}"]`);
    expect(await openSidebarButton.isExisting()).toBe(false);
    expect(await closeSidebarButton.isExisting()).toBe(true);
  });

  it('should show reference tooltip on hover', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const pubMedLink = await $(`span[data-testid="${PUB_MED_PMID}"]`);
    await pubMedLink.waitForDisplayed();

    await pubMedLink.moveTo();

    const pubMedTitle = await $(`h5[data-testid="${PUB_MED_PMID}-pub-med-title"]`);
    expect(pubMedTitle).toHaveText(PUB_MED_ARTICLE_TITLE);
  });

  it('should show breadcrumbs and single mutation view', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600E';

    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.waitForDisplayed();
    await mutationCollapsibleButton.click();

    const mutationBreadcrumbsName = await $(`span[data-testid="${MUTATION_NAME_BREADCRUMB_ID}"]`);
    const mutationList = await $(`div[data-testid="${MUTATION_LIST_ID}"]`);
    const singleMutationView = await $(`div[data-testid="${SINGLE_MUTATION_VIEW_ID}"]`);
    expect(mutationBreadcrumbsName).toHaveText(mutation);
    expect(await mutationList.isDisplayed()).toBe(false);
    expect(singleMutationView).toExist();
  });

  it('should delete mutation immediately if newly created and not reviewed', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const mutation = 'V600E';

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForDisplayed();
    await addMutationButton.click();

    await createMutationOnCurationPage(mutation);

    // Delete the mutation on curation page
    const mutationDeleteBtn = await $(`div[data-testid='${getCollapsibleDataTestId(CollapsibleDataTestIdType.CARD, mutation)}']`).$(
      "svg[data-icon='trash-can']",
    );
    await mutationDeleteBtn.click();

    const confirmDeleteBtn = await $(`div[id='${DELETION_SECTION_MODAL_BUTTON_ID}']`).$('button=Confirm');
    await confirmDeleteBtn.click();

    // The mutation should be deleted and should not be rendered
    const mutationCollapsible = await $(
      `div[data-testid='${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}']`,
    );
    expect(await mutationCollapsible.isExisting()).toBe(false);

    // Review is not required when deleting newly created mutations
    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    expect(await reviewButton.isExisting()).toBe(false);
  });
});
