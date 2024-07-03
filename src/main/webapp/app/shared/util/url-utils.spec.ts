import 'jest-expect-message';
import { getCbioportalResultsPageMutationTabUrl, replaceUrlParams } from './url-utils';

describe('UrlUtils', () => {
  describe('replaceUrlParams', () => {
    it('replaces all params in url', () => {
      expect(replaceUrlParams('/:hugoSymbol', 'BRAF'), 'the hugo symbol should be replaced with BRAF').toBe('/BRAF');
      expect(replaceUrlParams('/:hugoSymbol/mutations/:index', 'BRAF', '0'), 'all parameters should be replaced').toBe('/BRAF/mutations/0');

      expect(replaceUrlParams('https://www.curation.oncokb.org/:hugoSymbol', 'BRAF'), 'should replace param given https url').toBe(
        'https://www.curation.oncokb.org/BRAF',
      );
      expect(replaceUrlParams('http://www.curation.oncokb.org/:hugoSymbol', 'BRAF'), 'should replace param given http url').toBe(
        'http://www.curation.oncokb.org/BRAF',
      );

      expect(
        replaceUrlParams('/:hugoSymbol/mutations/:index', 'BRAF'),
        'should return empty string when insufficient params passed in',
      ).toBe('');
      expect(replaceUrlParams('/sample/path', 'BRAF'), 'should return original string if there are no params').toBe('/sample/path');

      expect(replaceUrlParams('', 'BRAF')).toBe('');
      expect(replaceUrlParams(undefined, 'BRAF')).toBe('');
      expect(replaceUrlParams('/:hugoSymbol', '')).toBe('');
      expect(replaceUrlParams('/:hugoSymbol/mutations/:index', '', undefined)).toBe('');
      expect(replaceUrlParams('/:hugoSymbol', undefined)).toBe('');

      expect(replaceUrlParams('/:index', 0)).toBe('/0');
      expect(replaceUrlParams('/:index', '0')).toBe('/0');
    });
  });

  describe('getCbioportalResultsPageMutationTabUrl', () => {
    it('empty hugo symbol should not generate a cbioportal page url', () => {
      expect(getCbioportalResultsPageMutationTabUrl('')).toEqual('');
    });
    it('empty hugo symbol should not generate a cbioportal page url', () => {
      const portalLink = getCbioportalResultsPageMutationTabUrl('BRAF');
      expect(portalLink.includes('cbioportal.mskcc.org')).toBeTruthy();
      expect(portalLink.includes('BRAF')).toBeTruthy();
    });
  });
});
