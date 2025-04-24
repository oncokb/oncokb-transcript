import { $, browser, expect } from '@wdio/globals';
import {
  DATA_IMPORT_DATA_TYPE_SELECT_ID,
  DATA_IMPORT_FILE_UPLOAD_INPUT_ID,
  DATA_IMPORT_GENETIC_TYPE_SELECT_ID,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import * as path from 'node:path';
import * as fs from 'fs';

export const selectGenomicIndicatorToImport = async () => {
  const geneticTypeSelect = await $(`div[id="${DATA_IMPORT_GENETIC_TYPE_SELECT_ID}"]`);
  const dataTypeSelect = await $(`div[id="${DATA_IMPORT_DATA_TYPE_SELECT_ID}"]`);

  await geneticTypeSelect.click();

  const germlineOption = await geneticTypeSelect.$('aria/Germline');
  expect(germlineOption).toExist();
  await germlineOption.click();

  await dataTypeSelect.click();

  // genomic indicator option has both required and optional columns
  const genomicIndicatorOption = await dataTypeSelect.$('aria/Genomic Indicator');
  expect(genomicIndicatorOption).toExist();
  await genomicIndicatorOption.click();
};

export const selectMutationToImport = async (isGermline: boolean) => {
  const geneticTypeSelect = await $(`div[id="${DATA_IMPORT_GENETIC_TYPE_SELECT_ID}"]`);
  const dataTypeSelect = await $(`div[id="${DATA_IMPORT_DATA_TYPE_SELECT_ID}"]`);

  await geneticTypeSelect.click();

  const geneticType = isGermline ? 'Germline' : 'Somatic';
  const geneticTypeOption = await geneticTypeSelect.$(`aria/${geneticType}`);
  expect(geneticTypeOption).toExist();
  await geneticTypeOption.click();

  await dataTypeSelect.click();

  // genomic indicator option has both required and optional columns
  const mutationOption = await dataTypeSelect.$('aria/Mutation');
  expect(mutationOption).toExist();
  await mutationOption.click();
};

export const uploadGenomicIndicatorToImport = async () => {
  await selectGenomicIndicatorToImport();

  const fileToUpload = path.join(process.cwd(), 'src/test/javascript/data/genomic_indicators.tsv');
  const remoteFilePath = await browser.uploadFile(fileToUpload);
  await $(`input[id=${DATA_IMPORT_FILE_UPLOAD_INPUT_ID}]`).setValue(remoteFilePath);
};

export const uploadMutationToImport = async (isGermline: boolean, importDataFileName: string) => {
  await selectMutationToImport(isGermline);

  const fileToUpload = path.join(process.cwd(), `src/test/javascript/data/${importDataFileName}`);
  const remoteFilePath = await browser.uploadFile(fileToUpload);
  await $(`input[id=${DATA_IMPORT_FILE_UPLOAD_INPUT_ID}]`).setValue(remoteFilePath);
};

export const uploadGeneratedDataToImport = async (isGermline: boolean, tsvContent: string) => {
  await selectMutationToImport(isGermline);

  // Step 1: Write TSV content to a temporary file
  const filePath = path.join(__dirname, 'temp-upload.tsv');
  fs.writeFileSync(filePath, tsvContent, 'utf-8');

  // Step 2: Upload it through the browser
  const remoteFilePath = await browser.uploadFile(filePath);
  await $(`input[id=${DATA_IMPORT_FILE_UPLOAD_INPUT_ID}]`).setValue(remoteFilePath);
};
