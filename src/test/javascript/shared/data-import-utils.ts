import { $, browser, expect } from '@wdio/globals';
import {
  DATA_IMPORT_DATA_TYPE_SELECT_ID,
  DATA_IMPORT_FILE_UPLOAD_INPUT_ID,
  DATA_IMPORT_GENETIC_TYPE_SELECT_ID,
} from '../../../main/webapp/app/config/constants/html-id.ts';
import * as path from 'node:path';

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

export const uploadGenomicIndicatorToImport = async () => {
  await selectGenomicIndicatorToImport();

  const fileToUpload = path.join(process.cwd(), 'src/test/javascript/data/genomic_indicators.tsv');
  const remoteFilePath = await browser.uploadFile(fileToUpload);
  await $(`input[id=${DATA_IMPORT_FILE_UPLOAD_INPUT_ID}]`).setValue(remoteFilePath);
};
