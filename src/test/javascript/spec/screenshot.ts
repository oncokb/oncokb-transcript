import { browser, $, expect } from '@wdio/globals';
import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'path';
import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH } from '../constants';
import setUpMocks from '../setup-mocks';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { createMutationOnCurationPage } from '../shared/utils';

const ALLOWED_MISMATCH_PERCENTAGE = 0;

describe('Screenshot Tests', () => {
  let adminApp: admin.app.App;

  const backup = JSON.parse(fs.readFileSync(MOCK_DATA_JSON_FILE_PATH).toString());

  const methodOptions: WdioCheckElementMethodOptions = {
    actualFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/actual'),
    baselineFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/baseline'),
    diffFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/diff'),
  };

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

  it('should compare gene list', async () => {
    await browser.url(`${BASE_URL}/curation`);

    const geneList = await $('#gene-list');
    await geneList.waitForDisplayed();

    const result = await browser.checkElement(geneList, 'gene-list', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare VUS table', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const vusTable = await $('div[data-testid="vus-table"]');
    await vusTable.waitForDisplayed();

    const result = await browser.checkElement(vusTable, 'vus-table', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare mutation collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsible = await $('div[data-testid="V600E-collapsible"]');
    await mutationCollapsible.waitForDisplayed();

    const result = await browser.checkElement(mutationCollapsible, 'mutation-collapsible', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare mutation effect not curatable', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsibleButton = await $('div[data-testid="V600E, V600K-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const mutationEffectNotCuratable = await $('div[data-testid="Mutation Effect-collapsible"]');
    await mutationEffectNotCuratable.waitForDisplayed();

    const result = await browser.checkElement(mutationEffectNotCuratable, 'mutation-effect-not-curatable', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
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

    const result = await browser.checkElement(openTherapyCollapsible, 'open-therapy-collapsible', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
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

    const result = await browser.checkElement(modifyTherapyModal, 'add-therapy-modal', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare review page', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();

    const reviewPage = await $('div[data-testid="review-page"]');
    const rootReview = await $('div[data-testid="root-review"]');
    await rootReview.waitForDisplayed();

    const result = await browser.checkElement(reviewPage, 'review-page', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);

    // reset by going back to curation page
    const reviewCompleteButton = await $('button[data-testid="review-complete-button"]');
    await reviewCompleteButton.click();
  });

  it('should compare add mutation modal', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.click();

    // Add a new mutation
    const mutationNameInput = await $('input#add-mutation-modal-input');
    await mutationNameInput.setValue('V600E');
    await browser.keys('Enter');

    const addMutationModal = await $('div[id="default-add-mutation-modal"]');
    await addMutationModal.waitForDisplayed();

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare gene type on review page', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const tsgCheckbox = await $("input[id='Genes/EMPTYGENE/type/tsg']");
    await tsgCheckbox.waitForDisplayed();
    await tsgCheckbox.click();

    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();
    const reviewCollapsible = await $('div[data-testid="collapsible"]');
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'gene-type-review-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare updated gene summary on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const mutationEffectDesc = await $("textarea[id='Genes/TP53/summary']");
    await mutationEffectDesc.waitForDisplayed();
    await mutationEffectDesc.setValue('TP53 is the most frequently mutated gene in cancer. Additional text.');

    // Go to review page to compare collapsible
    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();
    const reviewCollapsible = await $('div[data-testid="collapsible"]');
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'updated-gene-summary-review-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare newly created mutation on review page', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForDisplayed();
    await addMutationButton.click();

    // Add a new mutation
    createMutationOnCurationPage('V600E');

    // After mutation created, mutation collapsible should be opened.
    // Add content to newly created mutation.
    const oncogenicYesRadio = await $("input[id='Genes/EMPTYGENE/mutations/0/mutation_effect/oncogenic-Yes']");
    await oncogenicYesRadio.click();
    const mutationEffectDesc = await $("textarea[id='Genes/EMPTYGENE/mutations/0/mutation_effect/description']");
    await mutationEffectDesc.addValue('Sample description');

    // Go to review page to compare collapsible
    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();
    const reviewCollapsible = await $('div[data-testid="collapsible"]');
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'new-mutation-review-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare deleted mutation collapsible on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const trashCanIcon = await $("svg[data-icon='trash-can']");
    await trashCanIcon.click();

    const confirmDeleteBtn = await $('button=Confirm');
    await confirmDeleteBtn.click();

    // Go to review page to compare collapsible
    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();
    const reviewCollapsible = await $('div[data-testid="collapsible"]');
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'deleted-mutation-review-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare relevant cancer type modal', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    // Open collapsible
    const mutationCollapsibleButton = await $('div[data-testid="Oncogenic Mutations-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $('div[data-testid="Cancer Type: Mantle Cell Lymphoma-collapsible-title-wrapper"]');
    await cancerTypeCollapsibleButton.click();

    const rctButton = await $('div[data-testid="Prognostic Implication-collapsible-card"] button[id="relevant-cancer-types-button"]');
    await rctButton.click();

    const rctModal = await $('*[id="relevant-cancer-type-modal"]');
    await rctModal.waitForDisplayed();

    const result = await browser.checkElement(rctModal, 'relevant-cancer-types-modal', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare updated RCT on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    // Open collapsible
    const mutationCollapsibleButton = await $('div[data-testid="Oncogenic Mutations-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $('div[data-testid="Cancer Type: Mantle Cell Lymphoma-collapsible-title-wrapper"]');
    await cancerTypeCollapsibleButton.click();

    // Open RCT modal
    const rctButton = await $('div[data-testid="Prognostic Implication-collapsible-card"]').$('button[id="relevant-cancer-types-button"]');
    await rctButton.click();

    const rctModal = await $('*[id="relevant-cancer-type-modal"]');
    await rctModal.waitForDisplayed();

    // Remove a cancer type from RCT list
    const rctRemoveButtons = await $$("*[id='relevant-cancer-type-modal'] svg[data-icon='trash-can']");
    await rctRemoveButtons[0].waitForDisplayed();
    await rctRemoveButtons[0].click();

    // Confirm RCT changes
    const rctConfirmButton = await $('button=Confirm');
    await rctConfirmButton.click();

    // Go to review page to compare collapsible
    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();
    const reviewCollapsible = await $('div[data-testid="collapsible"]');
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'updated-rct-review-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });
});
