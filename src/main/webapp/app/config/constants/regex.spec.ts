import { REFERENCE_LINK_REGEX, FDA_SUBMISSION_REGEX, EXON_ALTERATION_REGEX } from './regex';

describe('Regex constants test', () => {
  describe('Reference link regex', () => {
    test.each([
      ['test', false],
      ['test (PMID123)', true],
      ['test (PMID:123)', true],
      ['test (PMID:123,123)', true],
      ['test ( PMID:123)', true],
      ['test ( PMID:123 )', true],
      ['test (PMID:123 )', true],
      ['test (PMID:123 ', false],
      ['test ( test PMID:123 )', false],
    ])('Regex should capture PMID', (reference, expected) => {
      expect(REFERENCE_LINK_REGEX.test(reference)).toEqual(expected);
    });

    describe('NCT reference test', () => {
      const nctContent = 'NCT03088176';

      test.each([
        ['test', false],
        [`test (${nctContent})`, true],
        [`test (${nctContent} )`, true],
        [`test ( ${nctContent})`, true],
        [`test ( ${nctContent} )`, true],
        [`test ( ${nctContent}`, false],
      ])('Regex should capture NCT', (reference, expected) => {
        expect(REFERENCE_LINK_REGEX.test(reference)).toEqual(expected);
      });
    });

    describe('Abstract reference test', () => {
      const abstractContent = 'Abstract: Zeng et al. Abstract #0177, IDDF 2020. https://gut.bmj.com/content/69/Suppl_2/A22.1';

      test.each([
        ['test', false],
        ['test (Abstract:', false],
        [`test (${abstractContent})`, true],
        [`test (${abstractContent} )`, true],
        [`test ( ${abstractContent})`, true],
        [`test ( ${abstractContent} )`, true],
        [`test ( ${abstractContent}`, false],
      ])('Regex should capture Abstract', (reference, expected) => {
        expect(REFERENCE_LINK_REGEX.test(reference)).toEqual(expected);
      });

      it('should handle abstracts with one level of nested parenthesis in url', () => {
        expect(
          REFERENCE_LINK_REGEX.test(
            '(Abstract: Solomon, BJ. Abstract #1372P, Annals of Oncology Vol 34, Suppl 2. https://www.annalsofoncology.org/article/S0923-7534(23)03242-8/fulltext)',
          ),
        ).toEqual(true);
      });
    });

    it('Regex should capture expected matches', () => {
      const mixText =
        'A statistically (significant) hotspot (PMID: 23525077). To wildtype (Abstract: Zeng et al. Abstract #0177, IDDF 2020.). Preclinical st(udie)s suggest.';
      expect(mixText.split(REFERENCE_LINK_REGEX).length).toEqual(5);
    });
  });

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

  describe('Exon alteration regex', () => {
    test.each([
      ['Exon 14 Deletion', true],
      ['Exon 14 Duplication', true],
      ['Exon 4 Insertion', true],
      ['Exon 4-8 Deletion', true],
      ['Exon 4 InSERTion', true],
      ['Exon  4 Duplication', true],
      ['Exon 4 Deletion + Exon 5 Deletion + Exon 6 Deletion', true],
      ['Exon 4-8 Deletion + Exon 10 Deletion', true],
      ['Exon 4 Deletion+Exon 5 Deletion', true],
      ['Exon 14 Del', false],
      ['Exon 4 8 Insertion', false],
    ])('should return %b for %s', (alteration, expected) => {
      expect(EXON_ALTERATION_REGEX.test(alteration)).toEqual(expected);
    });
  });
});
