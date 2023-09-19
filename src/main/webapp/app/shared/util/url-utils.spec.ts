import 'jest-expect-message';
import { replaceUrlParams } from './url-utils';

describe('UrlUtils', () => {
  describe('replaceUrlParams', () => {
    it('replaces all params in url', () => {
      expect(replaceUrlParams('/:hugoSymbol', 'BRAF'), 'the hugo symbol should be replaced with BRAF').toBe('/BRAF');
      expect(replaceUrlParams('/:hugoSymbol/mutations/:index', 'BRAF', '0'), 'all parameters should be replaced').toBe('/BRAF/mutations/0');

      expect(replaceUrlParams('https://www.curation.oncokb.org/:hugoSymbol', 'BRAF'), 'real url').toBe(
        'https://www.curation.oncokb.org/BRAF'
      );
      expect(replaceUrlParams('http://www.curation.oncokb.org/:hugoSymbol', 'BRAF'), 'real url').toBe(
        'http://www.curation.oncokb.org/BRAF'
      );

      expect(replaceUrlParams('/:hugoSymbol/mutations/:index', 'BRAF'), 'last param was not passed, so should not be replaced').toBe(
        '/BRAF/mutations/:index'
      );
      expect(replaceUrlParams('/sample/path', 'BRAF')).toBe('/sample/path');

      expect(replaceUrlParams('', 'BRAF')).toBe('');
      expect(replaceUrlParams(undefined, 'BRAF')).toBe('');
      expect(replaceUrlParams('/:hugoSymbol', '')).toBe('/:hugoSymbol');
      expect(replaceUrlParams('/:hugoSymbol', undefined)).toBe('/:hugoSymbol');
    });
  });
});
