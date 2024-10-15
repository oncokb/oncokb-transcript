import setUpMocks from '../setup-mocks.ts';
import { $, browser, expect } from '@wdio/globals';
import { BASE_URL } from '../constants.ts';
import {
  DATA_IMPORT_DATA_TABLE_ID,
  DATA_IMPORT_DATA_TYPE_SELECT_ID,
  DATA_IMPORT_FILE_FORMAT_WARNING_ALERT_ID,
  DATA_IMPORT_GENETIC_TYPE_SELECT_ID,
  DATA_IMPORT_IMPORT_BUTTON_ID,
  DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_TAB_ID,
  OPEN_SIDEBAR_BUTTON_ID,
  REACT_TABLE_TR_GROUP_CLASS,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import { selectGenomicIndicatorToImport, uploadMutationToImport } from '../shared/data-import-utils.ts';

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

  it('Data Import tab is available for both somatic and germline pages', async () => {
    await browser.url(`${BASE_URL}/curation/somatic`);
    const tabInSomatic = await $(`div[id="${DATA_IMPORT_TAB_ID}"]`);
    expect(tabInSomatic).toExist();

    await browser.url(`${BASE_URL}/curation/germline`);
    const tabInGermline = await $(`div[id="${DATA_IMPORT_TAB_ID}"]`);
    expect(tabInGermline).toExist();
  });

  it('File format warning should be shown after select data type', async () => {
    const geneticTypeSelect = await $(`div[id="${DATA_IMPORT_GENETIC_TYPE_SELECT_ID}"]`);
    const dataTypeSelect = await $(`div[id="${DATA_IMPORT_DATA_TYPE_SELECT_ID}"]`);

    await geneticTypeSelect.click();

    const firstGeneticTypeSelectOption = await $(`div[id="react-select-${DATA_IMPORT_GENETIC_TYPE_SELECT_ID}-option-0"]`);
    expect(firstGeneticTypeSelectOption).toExist();
    await firstGeneticTypeSelectOption.click();

    await dataTypeSelect.click();

    // this select is grouped, therefore the pattern 0-0
    const firstDataTypeSelectOption = await $(`div[id="react-select-${DATA_IMPORT_DATA_TYPE_SELECT_ID}-option-0-0"]`);
    expect(firstDataTypeSelectOption).toExist();
    await firstDataTypeSelectOption.click();

    const fileFormatWarningAlert = await $(`div[id=${DATA_IMPORT_FILE_FORMAT_WARNING_ALERT_ID}]`);
    expect(fileFormatWarningAlert).toExist();
  });

  it('File required and optional columns alerts are shown', async () => {
    await selectGenomicIndicatorToImport();

    const requiredColumnsAlert = await $(`div[id=${DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID}]`);
    expect(requiredColumnsAlert).toExist();

    const optionalColumnsAlert = await $(`div[id=${DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID}]`);
    expect(optionalColumnsAlert).toExist();
  });

  it('Pathogenicity check is in place', async () => {
    await uploadMutationToImport(true, 'data_import_germline_mutations.tsv');

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    expect(dataTable).toExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size
    expect(tableRows[0].$$('svg[class=fail]')).toExist();
    expect(tableRows[1].$$('svg[class=success]')).toExist();
  });

  it('Oncogenicity check is in place', async () => {
    await uploadMutationToImport(false, 'data_import_somatic_mutations.tsv');

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    expect(dataTable).toExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size
    expect(tableRows[0].$$('svg[class=fail]')).toExist();
    expect(tableRows[1].$$('svg[class=success]')).toExist();
  });

  it('Mutation exists check is in place', async () => {
    await uploadMutationToImport(false, 'data_import_somatic_mutations.tsv');

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    expect(dataTable).toExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size
    expect(tableRows[0].$$('svg[class=fail]')).toExist();
    expect(tableRows[2].$$('svg[class=fail]')).toExist();
    await browser.debug();
  });
});
