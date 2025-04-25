import setUpMocks from '../setup-mocks.ts';
import { $, browser, expect } from '@wdio/globals';
import { BASE_URL, SCREENSHOT_METHOD_OPTIONS } from '../constants.ts';
import {
  DATA_IMPORT_DATA_TABLE_ID,
  DATA_IMPORT_IMPORT_BUTTON_ID,
  DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_TAB_ID,
  EXPAND_SIDEBAR_BUTTON_ID,
  OPEN_SIDEBAR_BUTTON_ID,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import { selectGenomicIndicatorToImport, uploadGenomicIndicatorToImport } from '../shared/data-import-utils.ts';

describe('Data Import Tests', () => {
  before(async () => {
    await setUpMocks();
  });

  beforeEach(async () => {
    await browser.url(`${BASE_URL}/curation/somatic`);
    const openSidebarButton = await $(`span[data-testid="${OPEN_SIDEBAR_BUTTON_ID}"]`);
    await openSidebarButton.click();
    const tabInSomatic = await $(`div[id="${DATA_IMPORT_TAB_ID}"]`);
    await tabInSomatic.click();
  });

  it('File required and optional columns alerts are shown', async () => {
    await selectGenomicIndicatorToImport();

    const requiredColumnsAlert = await $(`div[id=${DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID}]`);
    expect(requiredColumnsAlert).toExist();

    const optionalColumnsAlert = await $(`div[id=${DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID}]`);
    expect(optionalColumnsAlert).toExist();
  });

  it('Properly process genomic indicator file', async () => {
    await uploadGenomicIndicatorToImport();

    // expand sidebar to take screenshot
    const expandIcon = await $(`span[data-testid="${EXPAND_SIDEBAR_BUTTON_ID}"]`);
    await expandIcon.click();

    // too complicated to check logics, do a screenshot instead
    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    expect(dataTable).toExist();
    const result = await browser.checkElement(dataTable, 'data-import-data-table-before-import', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(0);
  });

  it('Genomic indicator data properly imported and show warning/error if available', async () => {
    await uploadGenomicIndicatorToImport();

    // expand sidebar to take screenshot
    const expandIcon = await $(`span[data-testid="${EXPAND_SIDEBAR_BUTTON_ID}"]`);
    await expandIcon.click();

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    // too complicated to check logics, do a screenshot instead
    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    const result = await browser.checkElement(dataTable, 'data-import-data-table-after-import', SCREENSHOT_METHOD_OPTIONS);
    expect(result).toBeLessThanOrEqual(0);

    // After importing data, the Import button should be disabled
    expect(importButton).toBeDisabled();
  });
});
