import { FB_COLLECTION } from 'app/config/constants/firebase';
import { buildFirebaseGenePath, extractArrayPath, parseFirebaseGenePath } from './firebase-path-utils';

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
});
