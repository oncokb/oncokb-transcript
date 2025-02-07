import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'path';
import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH, WDIO_DEFAULT_DIMENSIONS } from '../constants';
import setUpMocks from '../setup-mocks';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import {
  ADD_MUTATION_MODAL_ADD_EXCLUDED_ALTERATION_BUTTON_ID,
  ADD_MUTATION_MODAL_ADD_EXON_BUTTON_ID,
  ADD_MUTATION_MODAL_EXCLUDED_ALTERATION_INPUT_ID,
  ADD_MUTATION_MODAL_INPUT_ID,
  DEFAULT_ADD_MUTATION_MODAL_ID,
} from '../../../main/webapp/app/config/constants/html-id';
import { assertScreenShotMatch } from '../shared/test-utils';
import {
  AddMutationModalDataTestIdType,
  CollapsibleDataTestIdType,
  getAddMutationModalDataTestId,
  getCollapsibleDataTestId,
} from '../../../main/webapp/app/shared/util/test-id-utils';

describe('Add Mutation Modal Screenshot Tests', () => {
  let adminApp: admin.app.App;

  const backup = JSON.parse(fs.readFileSync(MOCK_DATA_JSON_FILE_PATH).toString());

  const methodOptions: WdioCheckElementMethodOptions = {
    actualFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/actual'),
    baselineFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/baseline'),
    diffFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/diff'),
    disableCSSAnimation: true,
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
    await browser.setWindowSize(WDIO_DEFAULT_DIMENSIONS.width, WDIO_DEFAULT_DIMENSIONS.height);
  });

  //comment
  it('should compare modal with newly added mutations', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add a new mutation
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue('V600E, V600K');
    await browser.keys('Enter');

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare modal with excluded mutations', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const mutation = 'Oncogenic Mutations';

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add a new mutation
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue(mutation);
    await browser.keys('Enter');

    // Open up mutation details
    const alterationBadgeName = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, mutation)}']`,
    );
    await alterationBadgeName.click();

    // Add a new excluded mutation
    const excludedMutationInput = await $(`input#${ADD_MUTATION_MODAL_EXCLUDED_ALTERATION_INPUT_ID}`);
    await excludedMutationInput.setValue('V600K');
    const addExcludedAlterationBtn = await $(`button#${ADD_MUTATION_MODAL_ADD_EXCLUDED_ALTERATION_BUTTON_ID}`);
    await addExcludedAlterationBtn.waitForClickable();
    await addExcludedAlterationBtn.click();

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    // Resize window to fit element
    await browser.setWindowSize(WDIO_DEFAULT_DIMENSIONS.width, 1440);

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal-with-excluded-mutation', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare modal with alteration info opened', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600K';

    const mutationNameEditBtn = await $(`div[data-testid='${getCollapsibleDataTestId(CollapsibleDataTestIdType.CARD, mutation)}']`).$(
      "svg[data-icon='pen']",
    );
    await mutationNameEditBtn.click();

    const alterationBadgeName = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, mutation)}']`,
    );
    await alterationBadgeName.click();

    const mutationDetails = await $(
      `div[data-testid="${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.MUTATION_DETAILS, mutation)}"]`,
    );
    await mutationDetails.waitForDisplayed();

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    // Resize window to fit element
    await browser.setWindowSize(WDIO_DEFAULT_DIMENSIONS.width, 1440);

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal-opened-alteration-info', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare add exon form', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    const addExonButton = await $(`button[id="${ADD_MUTATION_MODAL_ADD_EXON_BUTTON_ID}"]`);
    await addExonButton.waitForClickable();
    await addExonButton.click();
    await browser
      .action('pointer')
      .move({ x: -9999, y: -9999 }) // Moves cursor far outside the viewport
      .perform();

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal-add-exon-form', methodOptions);
    assertScreenShotMatch(result);
  });

  it('should compare modify exon form', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    const mutation = 'Exon 2-4 Deletion';

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add a new mutation
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue(mutation);
    await browser.keys('Enter');

    // Open up exon form
    const alterationBadgeName = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, mutation)}']`,
    );
    await alterationBadgeName.click();

    const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
    await addMutationModal.waitForDisplayed();

    const result = await browser.checkElement(addMutationModal, 'add-mutation-modal-modify-exon-form', methodOptions);
    assertScreenShotMatch(result);
  });
});
