import { browser, $, expect } from '@wdio/globals';
import setUpMocks from '../setup-mocks';
import { BASE_URL, PUB_MED_ARTICLE_TITLE, PUB_MED_PMID } from '../constants';

describe('Screenshot Tests', () => {
  before(async () => {
    await setUpMocks();
  });

  it('should check somatic/germline toggle button colors', async () => {
    const UNSELECTED_COLOR = '#808080';
    const SOMATIC_SELECTED_COLOR = '#0968c3';
    const GERMLINE_SELECTED_COLOR = '#ffc107';

    await browser.url(`${BASE_URL}/curation/BRAF/somatic`);

    let somaticButton = await $('button[data-testid="somatic-button"]');
    let germlineButton = await $('button[data-testid="germline-button"]');
    await somaticButton.waitForDisplayed();
    await germlineButton.waitForDisplayed();

    expect((await somaticButton.getCSSProperty('background-color')).parsed.hex).toBe(SOMATIC_SELECTED_COLOR);
    expect((await germlineButton.getCSSProperty('background-color')).parsed.hex).toBe(UNSELECTED_COLOR);

    await germlineButton.click();

    somaticButton = await $('button[data-testid="somatic-button"]');
    germlineButton = await $('button[data-testid="germline-button"]');
    await somaticButton.waitForDisplayed();
    await germlineButton.waitForDisplayed();

    expect((await somaticButton.getCSSProperty('background-color')).parsed.hex).toBe(UNSELECTED_COLOR);
    expect((await germlineButton.getCSSProperty('background-color')).parsed.hex).toBe(GERMLINE_SELECTED_COLOR);
  });

  it('should open/close sidebar', async () => {
    await browser.url(`${BASE_URL}/curation`);

    let openSidebarButton = await $('span[data-testid="open-sidebar-button"]');
    let closeSidebarButton = await $('span[data-testid="close-sidebar-button"]');
    await closeSidebarButton.waitForDisplayed();

    expect(await openSidebarButton.isExisting()).toBe(false);
    expect(closeSidebarButton).toExist();

    await closeSidebarButton.click();

    openSidebarButton = await $('span[data-testid="open-sidebar-button"]');
    closeSidebarButton = await $('span[data-testid="close-sidebar-button"]');
    expect(openSidebarButton).toExist();
    expect(await closeSidebarButton.isExisting()).toBe(false);
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

    const mutationCollapsibleButton = await $('div[data-testid="V600E-collapsible-title-wrapper"]');
    await mutationCollapsibleButton.waitForDisplayed();
    await mutationCollapsibleButton.click();

    const mutationBreadcrumbsName = await $('span[data-testid="mutation-breadcrumbs-name"]');
    const mutationList = await $('div[data-testid="mutation-list"]');
    const singleMutationView = await $('div[data-testid="single-mutation-view"]');
    expect(mutationBreadcrumbsName).toHaveText('V600E');
    expect(await mutationList.isDisplayed()).toBe(false);
    expect(singleMutationView).toExist();
  });
});
