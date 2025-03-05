import { browser, $ } from '@wdio/globals';
import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'path';
import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH, SCREENSHOT_METHOD_OPTIONS } from '../constants';
import setUpMocks from '../setup-mocks';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { assertScreenShotMatch } from '../shared/test-utils';
import { CollapsibleDataTestIdType, getCollapsibleDataTestId } from '../../../main/webapp/app/shared/util/test-id-utils';
import {
  ADD_MUTATION_MODAL_INPUT_ID,
  ADD_THERAPY_BUTTON_ID,
  DEFAULT_ADD_MUTATION_MODAL_ID,
  GENE_HEADER_REVIEW_BUTTON_ID,
  GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID,
  GENE_LIST_TABLE_ID,
  RCT_MODAL_BUTTON_ID,
  RCT_MODAL_ID,
  REVIEW_PAGE_ID,
  SIMPLE_CONFIRM_MODAL_CONTENT_ID,
  VUS_TABLE_ID,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import { createMutationOnCurationPage } from '../shared/utils.ts';

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

    const geneList = await $(`#${GENE_LIST_TABLE_ID}`);
    await geneList.waitForDisplayed();

    const result = await browser.checkElement(geneList, 'gene-list', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare VUS table', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const vusTable = await $(`div[data-testid="${VUS_TABLE_ID}"]`);
    await vusTable.waitForDisplayed();

    const result = await browser.checkElement(vusTable, 'vus-table', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare mutation collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsible = await $(`div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, 'V600E')}"]`);
    await mutationCollapsible.waitForDisplayed();

    const result = await browser.checkElement(mutationCollapsible, 'mutation-collapsible', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare mutation effect not curatable', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600E, V600K';

    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.click();

    const mutationEffectNotCuratable = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, `${mutation}-mutation-effect`)}"]`,
    );
    await mutationEffectNotCuratable.waitForDisplayed();
    await mutationEffectNotCuratable.scrollIntoView();

    const result = await browser.checkElement(mutationEffectNotCuratable, 'mutation-effect-not-curatable', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare open therapy collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600E';
    const cancerType = 'Melanoma';
    const treatment = 'Dabrafenib';

    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, `${mutation}-${cancerType}`)}"]`,
    );
    await cancerTypeCollapsibleButton.click();

    const therapyCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, `${mutation}-${cancerType}-${treatment}`)}"]`,
    );
    await therapyCollapsibleButton.click();

    const openTherapyCollapsible = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, `${mutation}-${cancerType}-${treatment}`)}"]`,
    );
    await openTherapyCollapsible.waitForDisplayed();
    await openTherapyCollapsible.scrollIntoView();

    const result = await browser.checkElement(openTherapyCollapsible, 'open-therapy-collapsible', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare modify therapy modal', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600E';
    const cancerType = 'Melanoma';

    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, `${mutation}-${cancerType}`)}"]`,
    );
    await cancerTypeCollapsibleButton.click();

    const addTherapyButton = await $(`button[data-testid="${ADD_THERAPY_BUTTON_ID}"]`);
    await addTherapyButton.click();

    const modifyTherapyModal = await $(`div[data-testid="${SIMPLE_CONFIRM_MODAL_CONTENT_ID}"]`);
    await modifyTherapyModal.waitForDisplayed();

    const result = await browser.checkElement(modifyTherapyModal, 'add-therapy-modal', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);
  });

  it('should compare review page', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();

    const reviewPage = await $(`div[data-testid="${REVIEW_PAGE_ID}"]`);
    const rootReview = await $('div[data-testid="root-review"]');
    await rootReview.waitForDisplayed();

    const result = await browser.checkElement(reviewPage, 'review-page', SCREENSHOT_METHOD_OPTIONS);
    assertScreenShotMatch(result);

    // reset by going back to curation page
    const reviewCompleteButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID}"]`);
    await reviewCompleteButton.click();
  });

  it('should compare add mutation modal', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add a new mutation
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue('V600E');
    await browser.keys('Enter');

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare gene type on review page', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const tsgCheckbox = await $("input[id='Genes/EMPTYGENE/type/tsg']");
    await tsgCheckbox.waitForDisplayed();
    await tsgCheckbox.click();

    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();
    const reviewCollapsible = await $(`div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, 'Gene Type')}"]`);
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'gene-type-review-collapsible', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare updated gene summary on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const mutationEffectDesc = await $("textarea[id='Genes/TP53/summary']");
    await mutationEffectDesc.waitForDisplayed();
    await mutationEffectDesc.setValue('TP53 is the most frequently mutated gene in cancer. Additional text.');

    // Go to review page to compare collapsible
    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();
    const reviewCollapsible = await $(`div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, 'Summary')}"]`);
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'updated-gene-summary-review-collapsible', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare newly created mutation on review page', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const mutation = 'V600E';

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForDisplayed();
    await addMutationButton.click();

    // Add a new mutation
    createMutationOnCurationPage(mutation);

    // After mutation created, mutation collapsible should be opened.
    // Add content to newly created mutation.
    const oncogenicYesRadios = await $$("input[id^='Genes/EMPTYGENE/mutations/'][id$='/mutation_effect/oncogenic-Yes']");
    await oncogenicYesRadios[0].click();
    const mutationEffectDesc = await $$("textarea[id^='Genes/EMPTYGENE/mutations/'][id$='/mutation_effect/description']");
    await mutationEffectDesc[0].addValue('Sample description');

    // Go to review page to compare collapsible
    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();
    const reviewCollapsible = await $(`div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, mutation)}"]`);
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'new-mutation-review-collapsible', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare deleted mutation collapsible on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const mutation = 'Y220C';

    const trashCanIcon = await $("svg[data-icon='trash-can']");
    await trashCanIcon.click();

    const confirmDeleteBtn = await $('button=Confirm');
    await confirmDeleteBtn.click();

    // Go to review page to compare collapsible
    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();
    const reviewCollapsible = await $(`div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, mutation)}"]`);
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'deleted-mutation-review-collapsible', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare relevant cancer type modal', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const mutation = 'Oncogenic Mutations';
    const cancerType = 'Mantle Cell Lymphoma';

    // Open collapsible
    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, `${mutation}-${cancerType}`)}"]`,
    );
    await cancerTypeCollapsibleButton.click();

    const rctButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.CARD, `${mutation}-${cancerType}-px-implication`)}"] button[id="${RCT_MODAL_BUTTON_ID}"]`,
    );
    await rctButton.click();

    const rctModal = await $(`*[id="${RCT_MODAL_ID}"]`);
    await rctModal.waitForDisplayed();

    const result = await browser.checkElement(rctModal, 'relevant-cancer-types-modal', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare updated RCT on review page', async () => {
    await browser.url(`${BASE_URL}/curation/TP53/somatic`);

    const mutation = 'Oncogenic Mutations';
    const cancerType = 'Mantle Cell Lymphoma';

    // Open collapsible
    const mutationCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, mutation)}"]`,
    );
    await mutationCollapsibleButton.click();

    const cancerTypeCollapsibleButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.TITLE_WRAPPER, `${mutation}-${cancerType}`)}"]`,
    );
    await cancerTypeCollapsibleButton.click();

    // Open RCT modal
    const rctButton = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.CARD, `${mutation}-${cancerType}-px-implication`)}"]`,
    ).$(`button[id="${RCT_MODAL_BUTTON_ID}"]`);
    await rctButton.click();

    const rctModal = await $(`*[id="${RCT_MODAL_ID}"]`);
    await rctModal.waitForDisplayed();

    // Remove a cancer type from RCT list
    const rctRemoveButtons = await $$(`*[id='${RCT_MODAL_ID}'] svg[data-icon='trash-can']`);
    await rctRemoveButtons[0].waitForDisplayed();
    await rctRemoveButtons[0].click();

    // Confirm RCT changes
    const rctConfirmButton = await $('button=Confirm');
    await rctConfirmButton.click();

    // Go to review page to compare collapsible
    const reviewButton = await $(`button[data-testid="${GENE_HEADER_REVIEW_BUTTON_ID}"]`);
    await reviewButton.click();
    const reviewCollapsible = await $(
      `div[data-testid="${getCollapsibleDataTestId(CollapsibleDataTestIdType.COLLAPSIBLE, `${mutation}/${cancerType}/Prognostic/Relevant Cancer Types`)}"]`,
    );
    await reviewCollapsible.waitForDisplayed();

    const result = await browser.checkElement(reviewCollapsible, 'updated-rct-review-collapsible', methodOptions);
    assertScreenShotMatch(result);
  });
});
