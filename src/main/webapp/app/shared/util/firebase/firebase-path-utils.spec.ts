import { FB_COLLECTION } from 'app/config/constants/firebase';
import { buildFirebaseGenePath, extractArrayPath, isFirebaseArray, parseFirebaseGenePath } from './firebase-path-utils';

describe('FirebasePathUtils', () => {
  describe('parseFirebaseGenePath', () => {
    it('Should parse path', () => {
      const path = `${FB_COLLECTION.GENES}/BRAF/mutations/-mKey`;
      const pathDetails = parseFirebaseGenePath(path);
      expect(pathDetails?.fullPath).toEqual(path);
      expect(pathDetails?.hugoSymbol).toEqual('BRAF');
      expect(pathDetails?.pathFromGene).toEqual('mutations/-mKey');
    });
    it('Should not parse path with less than 3 parts', () => {
      let path = `${FB_COLLECTION.GENES}`;
      expect(parseFirebaseGenePath(path)).toBeUndefined();

      path = `${FB_COLLECTION.GENES}/BRAF`;
      expect(parseFirebaseGenePath(path)).toBeUndefined();

      path = `${FB_COLLECTION.GENES}/BRAF/`;
      expect(parseFirebaseGenePath(path)).toBeUndefined();
    });
  });

  describe('buildFirebaseGenePath', () => {
    it('should return firebase path', () => {
      const hugoSymbol = 'BRAF';
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/-mKey/name')).toEqual('Genes/BRAF/mutations/-mKey/name');
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/-mKey/tumors/-tKey/cancerTypes')).toEqual(
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/cancerTypes',
      );

      expect(buildFirebaseGenePath('', 'mutations_uuid')).toEqual(undefined);
    });
  });

  describe('extractArrayPath', () => {
    test.each([
      { path: 'mutations/-mKey/name', firebaseArrayPath: 'mutations', deleteArrayKey: '-mKey' },
      { path: 'mutations/-mKey/tumors/-tKey/cancerTypes', firebaseArrayPath: 'mutations/-mKey/tumors', deleteArrayKey: '-tKey' },
      {
        path: 'mutations/-mKey/tumors/-tKey/TIs/0/treatments/-txKey/name',
        firebaseArrayPath: 'mutations/-mKey/tumors/-tKey/TIs/0/treatments',
        deleteArrayKey: '-txKey',
      },
    ])('should return arrayPath = $arrayPath and index = $index when given $path', ({ path, firebaseArrayPath, deleteArrayKey }) => {
      expect(extractArrayPath(path)).toEqual({ firebaseArrayPath, deleteArrayKey });
    });
  });

  describe('isFirebaseArray', () => {
    test.each([
      ['Genes/TP53/mutations', true],
      ['Genes/EGFR/mutations/-mKey1/tumors', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/cancerTypes', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/excludedCancerTypes', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/prognostic/excludedRCTs', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/diagnostic/excludedRCTs', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/TIs/0/treatments', true],
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/TIs/2/treatments/-txKey1/excludedRCTs', true],
      ['Germline_Genes/BRCA1/genomic_indicators', true],
      ['Germline_Genes/BRCA1/genomic_indicators/-giKey1/associationVariants', true],
      ['Genes/BRAF/name_comments', true],
      ['Germline_Genes/FH/background_comments', true],
      ['SomeOtherPath/123/comments', false], // "_comments" only allowed as suffix
      ['Genes/EGFR/mutations/-mKey1/tumors/-tKey1/TIs/xyz/treatments', false], // Invalid (xyz should be a number)
      ['Random/Path/Not/Matching', false],
      ['Genes/TP53/mutations/-mKey', false], // Invalid (missing a necessary subpath)
      ['Germline_Genes/BRCA1/somethingElse', false], // Invalid (not in allowed patterns)
      ['Genes//mutations', false], // Empty gene name
      ['Genes/EGFR/mutations/', false], // Trailing slash
      ['Genes/EGFR/mutations//tumors', false], // Double slashes
    ])('isFirebaseArray(%s) should return %s', (path, expected) => {
      expect(isFirebaseArray(path)).toBe(expected);
    });
  });
});
