import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH } from '../constants';
import setUpMocks from '../setup-mocks';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import {
  ADD_MUTATION_MODAL_FLAG_COMMENT_ID,
  ADD_MUTATION_MODAL_FLAG_DROPDOWN_ID,
  ADD_MUTATION_MODAL_INPUT_ID,
} from '../../../main/webapp/app/config/constants/html-id';
import {
  AddMutationModalDataTestIdType,
  CollapsibleDataTestIdType,
  getAddMutationModalDataTestId,
  getCollapsibleDataTestId,
} from '../../../main/webapp/app/shared/util/test-id-utils';

describe('Add Mutation Modal Screenshot Tests', () => {
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

  it('should support adding multiple alterations via input box', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add mutations
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue('V600E/K');
    await browser.keys('Enter');

    const firstMutationBadge = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, 'V600E')}']`,
    );
    const secondMutationBadge = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, 'V600K')}']`,
    );
    expect(firstMutationBadge).toExist();
    expect(secondMutationBadge).toExist();
  });

  it('should support adding exon mutation via input box', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add Exon mutation
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue('Exon 2-4 Deletion');
    await browser.keys('Enter');

    const badge = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, 'Exon 2-4 Deletion')}']`,
    );
    expect(badge).toExist();
  });

  it('should remove deleted alteration from list', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutation = 'V600E';

    // Edit mutation name modal
    const mutationNameEditBtn = await $(`div[data-testid='${getCollapsibleDataTestId(CollapsibleDataTestIdType.CARD, mutation)}']`).$(
      "svg[data-icon='pen']",
    );
    await mutationNameEditBtn.click();
    const alterationBadgeDeleteBtn = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_DELETE, mutation)}']`,
    );
    await alterationBadgeDeleteBtn.click();

    const badge = await $(
      `div[data-testid='${getAddMutationModalDataTestId(AddMutationModalDataTestIdType.ALTERATION_BADGE_NAME, 'V600E')}']`,
    );
    expect(await badge.isExisting()).toBe(false);
  });

  it('should show string name dropdown when there is more than 1 alteration', async () => {
    await browser.url(`${BASE_URL}/curation/EMPTYGENE/somatic`);

    // Click to open mutation modal
    const addMutationButton = await $('button=Add Mutation');
    await addMutationButton.waitForClickable();
    await addMutationButton.click();

    // Add mutations
    const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
    await mutationNameInput.setValue('V600E, V600K');
    await browser.keys('Enter');

    const stringNameDropdown = await $(`input#${ADD_MUTATION_MODAL_FLAG_DROPDOWN_ID}`);
    expect(stringNameDropdown).toExist();

    const stringNameComment = await $(`svg#${ADD_MUTATION_MODAL_FLAG_COMMENT_ID}`);
    expect(stringNameComment).toExist();
  });
});
