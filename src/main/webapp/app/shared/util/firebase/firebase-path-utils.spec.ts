import { FB_COLLECTION } from 'app/config/constants/firebase';
import { buildFirebaseGenePath, parseFirebaseGenePath } from './firebase-path-utils';

describe('FirebasePathUtils', () => {
  describe('parseFirebaseGenePath', () => {
    it('Should parse path', () => {
      const path = `${FB_COLLECTION.GENES}/BRAF/mutations/0`;
      const pathDetails = parseFirebaseGenePath(path);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(pathDetails.fullPath).toEqual(path);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(pathDetails.hugoSymbol).toEqual('BRAF');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  describe('buildFirebaseGenePath', () => {
    it('should return firebase path', () => {
      const hugoSymbol = 'BRAF';
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/0/name')).toEqual('Genes/BRAF/mutations/0/name');
      expect(buildFirebaseGenePath(hugoSymbol, 'mutations/0/tumors/0/cancerTypes')).toEqual('Genes/BRAF/mutations/0/tumors/0/cancerTypes');

      expect(buildFirebaseGenePath('', 'mutations_uuid')).toEqual(undefined);
    });
  });
});
