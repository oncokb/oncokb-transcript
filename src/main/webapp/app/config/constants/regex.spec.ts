import { FDA_SUBMISSION_REGEX } from './regex';

describe('Regex constants test', () => {
  describe('FDA Submission regex', () => {
    test.each([
      ['P190033', true],
      ['P190033/S001', true],
      ['P190033/S001-S004', true],
      ['H140006', true],
      ['PMA', false],
      ['123', false],
      ['', false],
    ])('should match all types of FDA submissions including supplements', (submission, expected) => {
      expect(FDA_SUBMISSION_REGEX.test(submission)).toEqual(expected);
    });
  });
});
