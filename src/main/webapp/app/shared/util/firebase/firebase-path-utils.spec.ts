import { FB_COLLECTION } from 'app/config/constants/firebase';
import { parseFirebaseGenePath } from './firebase-path-utils';

describe('Firebase path utils test', () => {
  describe('Parse firebase gene path', () => {
    it('Should parse path', () => {
      const path = `${FB_COLLECTION.GENES}/BRAF/mutations/0`;
      const pathDetails = parseFirebaseGenePath(path);
      expect(pathDetails.fullPath).toEqual(path);
      expect(pathDetails.hugoSymbol).toEqual('BRAF');
      expect(pathDetails.pathFromGene).toEqual('mutations/0');
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
});
