import { Result } from '@wdio/visual-service/dist/types';
import { ALLOWED_MISMATCH_PERCENTAGE } from '../constants';

export const assertScreenShotMatch = (result: Result) => {
  expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
};

export async function expectSvgInElementToExist(element: WebdriverIO.Element, className: string, timeout = 2500) {
  const svg = await element.$(`svg.${className}`);
  await svg.waitForExist({ timeout });
  expect(await svg.isExisting()).toBe(true);
}
