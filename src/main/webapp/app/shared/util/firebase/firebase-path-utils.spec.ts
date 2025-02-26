import { FB_COLLECTION } from 'app/config/constants/firebase';
import { buildFirebaseGenePath, extractArrayPath, parseFirebaseGenePath } from './firebase-path-utils';

describe('FirebasePathUtils', () => {
  describe('parseFirebaseGenePath', () => {
    it('Should parse path', () => {
      const path = `${FB_COLLECTION.GENES}/BRAF/mutations/0`;
      const pathDetails = parseFirebaseGenePath(path);
      expect(pathDetails?.fullPath).toEqual(path);
      expect(pathDetails?.hugoSymbol).toEqual('BRAF');
      expect(pathDetails?.pathFromGene).toEqual('mutations/0');
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
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/0/name')).toEqual('Genes/BRAF/mutations/0/name');
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/0/tumors/0/cancerTypes')).toEqual('Genes/BRAF/mutations/0/tumors/0/cancerTypes');

      expect(buildFirebaseGenePath('', 'mutations_uuid')).toEqual(undefined);
    });
  });

  describe('extractArrayPath', () => {
    test.each([
      { path: 'mutations/0/name', firebaseArrayPath: 'mutations', deleteIndex: 0 },
      { path: 'mutations/0/tumors/10/cancerTypes', firebaseArrayPath: 'mutations/0/tumors', deleteIndex: 10 },
      { path: 'mutations/0/tumors/0/TIs/0/treatments/0/name', firebaseArrayPath: 'mutations/0/tumors/0/TIs/0/treatments', deleteIndex: 0 },
    ])('should return arrayPath = $arrayPath and index = $index when given $path', ({ path, firebaseArrayPath, deleteIndex }) => {
      expect(extractArrayPath(path)).toEqual({ firebaseArrayPath, deleteIndex });
    });
  });
});
