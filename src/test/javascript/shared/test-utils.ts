import { Result } from '@wdio/visual-service/dist/types';
import { ALLOWED_MISMATCH_PERCENTAGE } from '../constants';

export const assertScreenShotMatch = (result: Result) => {
  expect(result).toBeLessThanOrEqual(ALLOWED_MISMATCH_PERCENTAGE);
};
