import { browser, $, expect } from '@wdio/globals';
import { WdioCheckElementMethodOptions } from '@wdio/visual-service/dist/types';
import * as path from 'path';
import { BASE_URL } from '../constants';
import setUpMocks from '../setup-mocks';

const ALLOWED_MISMATCH_PERCENTAGE = 0;

describe('Screenshot Tests', () => {
  const methodOptions: WdioCheckElementMethodOptions = {
    actualFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/actual'),
    baselineFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/baseline'),
    diffFolder: path.join(process.cwd(), 'src/test/javascript/screenshots/diff'),
  };

  before(async () => {
    await setUpMocks();
  });

  it('should compare gene list', async () => {
    await browser.url(`${BASE_URL}/curation`);

    const geneList = await $('#gene-list');
    await geneList.waitForDisplayed();

    const result = await browser.checkElement(geneList, 'gene-list', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare VUS table', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const vusTable = await $('div[data-testid="vus-table"]');
    await vusTable.waitForDisplayed();

    const result = await browser.checkElement(vusTable, 'vus-table', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare mutation collapsible', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsible = await $('div[data-testid="V600E-collapsible"]');
    await mutationCollapsible.waitForDisplayed();

    const result = await browser.checkElement(mutationCollapsible, 'mutation-collapsible', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare mutation effect not curatable', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const mutationCollapsibleButton = await $('div[data-testid="V600E, V600K-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.click();

    const mutationEffectNotCuratable = await $('div[data-testid="Mutation Effect-collapsible"]');
    await mutationEffectNotCuratable.waitForDisplayed();

    const result = await browser.checkElement(mutationEffectNotCuratable, 'mutation-effect-not-curatable', methodOptions);
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

    const result = await browser.checkElement(openTherapyCollapsible, 'open-therapy-collapsible', methodOptions);
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

    const result = await browser.checkElement(modifyTherapyModal, 'add-therapy-modal', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
  });

  it('should compare review page', async () => {
    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    const reviewButton = await $('button[data-testid="review-button"]');
    await reviewButton.click();

    const reviewPage = await $('div[data-testid="review-page"]');
    await reviewPage.waitForDisplayed();

    const result = await browser.checkElement(reviewPage, 'review-page', methodOptions);
    expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);

    // reset by going back to curation page
    const reviewCompleteButton = await $('button[data-testid="review-complete-button"]');
    await reviewCompleteButton.click();
  });
});
