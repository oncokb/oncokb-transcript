import { REFERENCE_LINK_REGEX, FDA_SUBMISSION_REGEX } from './regex';

describe('Regex constants test', () => {
  describe('Reference link regex', () => {
    it('Regex should capture PMID', () => {
      expect(REFERENCE_LINK_REGEX.test('test')).toBeFalsy();
      expect(REFERENCE_LINK_REGEX.test('test (PMID123)')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test (PMID:123)')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test (PMID:123,123)')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test ( PMID:123)')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test ( PMID:123 )')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test (PMID:123 )')).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test('test (PMID:123 ')).toBeFalsy();
      expect(REFERENCE_LINK_REGEX.test('test ( test PMID:123 )')).toBeFalsy();
    });
    it('Regex should capture NCT', () => {
      const nctContent = 'NCT03088176';
      expect(REFERENCE_LINK_REGEX.test('test')).toBeFalsy();
      expect(REFERENCE_LINK_REGEX.test(`test (${nctContent})`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test (${nctContent} )`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${nctContent})`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${nctContent} )`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${nctContent}`)).toBeFalsy();
    });
    it('Regex should capture Abstract', () => {
      const abstractContent = 'Abstract: Zeng et al. Abstract #0177, IDDF 2020. https://gut.bmj.com/content/69/Suppl_2/A22.1';
      expect(REFERENCE_LINK_REGEX.test('test')).toBeFalsy();
      expect(REFERENCE_LINK_REGEX.test(`test (${abstractContent})`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test (${abstractContent} )`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${abstractContent})`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${abstractContent} )`)).toBeTruthy();
      expect(REFERENCE_LINK_REGEX.test(`test ( ${abstractContent}`)).toBeFalsy();
    });
    it('Regex should capture expected matches', () => {
      const mixText =
        'A statistically (significant) hotspot (PMID: 23525077). To wildtype (Abstract: Zeng et al. Abstract #0177, IDDF 2020.). Preclinical st(udie)s suggest.';
      expect(mixText.split(REFERENCE_LINK_REGEX).length).toEqual(5);
    });
  });

  describe('FDA Submission regex', () => {
    it('should match all types of FDA submissions (including supplements)', () => {
      expect(FDA_SUBMISSION_REGEX.test('P190033')).toBeTruthy();
      expect(FDA_SUBMISSION_REGEX.test('P190033/S001')).toBeTruthy();
      expect(FDA_SUBMISSION_REGEX.test('P190033/S001-S004')).toBeTruthy();
      expect(FDA_SUBMISSION_REGEX.test('H140006')).toBeTruthy();

      expect(FDA_SUBMISSION_REGEX.test('PMA')).toBeFalsy();
      expect(FDA_SUBMISSION_REGEX.test('123')).toBeFalsy();
    });
  });
});
