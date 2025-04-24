import setUpMocks from '../setup-mocks.ts';
import { $, browser, expect } from '@wdio/globals';
import { BASE_URL, DATABASE_EMULATOR_URL, MOCK_DATA_JSON_FILE_PATH } from '../constants.ts';
import {
  DATA_IMPORT_DATA_TABLE_ID,
  DATA_IMPORT_DATA_TYPE_SELECT_ID,
  DATA_IMPORT_FILE_FORMAT_WARNING_ALERT_ID,
  DATA_IMPORT_GENETIC_TYPE_SELECT_ID,
  DATA_IMPORT_IMPORT_BUTTON_ID,
  DATA_IMPORT_MISSING_REQUIRED_VALUES_INFO_ALERT_ID,
  DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_TAB_ID,
  OPEN_SIDEBAR_BUTTON_ID,
  REACT_TABLE_TR_GROUP_CLASS,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import { MutationList } from '../../../main/webapp/app/shared/model/firebase/firebase.model.ts';
import { selectGenomicIndicatorToImport, uploadGeneratedDataToImport, uploadMutationToImport } from '../shared/data-import-utils.ts';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { expectSvgInElementToExist } from '../shared/test-utils.ts';

describe('Data Import Tests', () => {
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

  it('Missing required column values check is in place and displays alert', async () => {
    const tsvContent = [
      ['hugo_symbol', 'alteration', 'oncogenicity', 'description'].join('\t'),
      ['BRAF', 'V600E', 'Oncogenic', ''].join('\t'),
    ].join('\n');
    await uploadGeneratedDataToImport(false, tsvContent);

    const requiredColumnsAlert = await $(`div[id=${DATA_IMPORT_MISSING_REQUIRED_VALUES_INFO_ALERT_ID}]`);
    expect(requiredColumnsAlert).toExist();
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
    await expectSvgInElementToExist(tableRows[0], 'fail');
    await expectSvgInElementToExist(tableRows[1], 'success');
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
    await expectSvgInElementToExist(tableRows[0], 'fail');
    await expectSvgInElementToExist(tableRows[2], 'success');
  });

  it('Mutation override check is in place', async () => {
    await uploadMutationToImport(false, 'data_import_somatic_mutations.tsv');

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    await dataTable.waitForExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size

    // Error annotating variant
    await expectSvgInElementToExist(tableRows[0], 'fail');

    // Mutation was overrode successfully
    await expectSvgInElementToExist(tableRows[2], 'success');
  });

  it('New mutation is created if not already exist', async () => {
    const tsvContent = [
      ['hugo_symbol', 'alteration', 'oncogenicity', 'description'].join('\t'),
      ['BRAF', 'V600M', 'Yes', 'This is my description'].join('\t'),
    ].join('\n');
    await uploadGeneratedDataToImport(false, tsvContent);

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    await dataTable.waitForExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size

    // Wait for data to be imported successfully
    await expectSvgInElementToExist(tableRows[0], 'success');

    // Check if new mutation was created
    const mutations = (await adminApp.database().ref('Genes/BRAF/mutations').get()).val() as MutationList;
    const newMutation = Object.values(mutations).find(m => m.name === 'V600M');
    expect(newMutation).toBeDefined();
    // Expect lastReviewed to be empty string to denote newly added
    // Expect description and oncogenic fields to be updated accordingly
    expect(newMutation?.mutation_effect.description).toEqual('This is my description');
    expect(newMutation?.mutation_effect.description_review?.lastReviewed).toEqual('');
    expect(newMutation?.mutation_effect.oncogenic).toEqual('Yes');
    expect(newMutation?.mutation_effect.oncogenic_review?.lastReviewed).toEqual('');
  });

  it('Mutation description is overwritten and reviewable if already exists', async () => {
    const tsvContent = [
      ['hugo_symbol', 'alteration', 'oncogenicity', 'description'].join('\t'),
      ['BRAF', 'V600E', 'Yes', 'My new description'].join('\t'),
    ].join('\n');
    await uploadGeneratedDataToImport(false, tsvContent);

    const importButton = await $(`button[id='${DATA_IMPORT_IMPORT_BUTTON_ID}']`);
    expect(importButton).toExist();
    await importButton.click();

    const dataTable = await $(`div[id=${DATA_IMPORT_DATA_TABLE_ID}]`);
    await dataTable.waitForExist();

    const tableRows = await dataTable.$$(`div[class=${REACT_TABLE_TR_GROUP_CLASS}]`);
    expect(tableRows).toHaveLength(5); // default page size

    // Wait for data to be imported successfully
    await expectSvgInElementToExist(tableRows[0], 'success');

    // Check if new mutation was created
    const mutations = (await adminApp.database().ref('Genes/BRAF/mutations').get()).val() as MutationList;
    const existingMutation = Object.values(mutations).find(m => m.name === 'V600E');
    expect(existingMutation).toBeDefined();
    expect(existingMutation?.mutation_effect.description).toEqual('My new description');
    expect(existingMutation?.mutation_effect.description_review?.lastReviewed).toEqual(
      'The class I activating exon 15 BRAF V600E mutation is located in the kinase domain of the BRAF protein and is highly recurrent in melanoma, lung and thyroid cancer, among others (PMID: 28783719, 26091043, 25079552, 23833300, 25417114, 28783719, 12068308). This mutation has been comprehensively biologically characterized and has been shown to activate the downstream MAPK pathway independent of RAS (PMID: 15035987, 12068308, 19251651, 26343582), to render BRAF constitutively activated in monomeric form (PMID: 20179705), and to retain sensitivity to RAF monomer inhibitors such as vemurafenib and dabrafenib (PMID:26343582, 28783719, 20179705, 30351999).',
    );
    // Mutation oncogenicity was not changed, so no review needed.
    expect(existingMutation?.mutation_effect.oncogenic).toEqual('Yes');
    expect(existingMutation?.mutation_effect.oncogenic_review?.lastReviewed).toBeUndefined();
  });
});
