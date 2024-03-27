import { cleanEntity, getEntityTitle, mapIdList } from './entity-utils';
import { ENTITY_TYPE } from 'app/config/constants/constants';

describe('Entity utils', () => {
  describe('cleanEntity', () => {
    it('should not remove fields with an id', () => {
      const entityA = {
        a: {
          id: 5,
        },
      };
      const entityB = {
        a: {
          id: '5',
        },
      };

      expect(cleanEntity({ ...entityA })).toEqual(entityA);
      expect(cleanEntity({ ...entityB })).toEqual(entityB);
    });

    it('should remove fields with an empty id', () => {
      const entity = {
        a: {
          id: '',
        },
      };

      expect(cleanEntity({ ...entity })).toEqual({});
    });

    it('should not remove fields that are not objects', () => {
      const entity = {
        a: '',
        b: 5,
        c: [],
        d: '5',
      };

      expect(cleanEntity({ ...entity })).toEqual(entity);
    });
  });

  describe('mapIdList', () => {
    it("should map ids no matter the element's type", () => {
      const ids = ['jhipster', '', 1, { key: 'value' }];

      expect(mapIdList(ids)).toEqual([{ id: 'jhipster' }, { id: 1 }, { id: { key: 'value' } }]);
    });

    it('should return an empty array', () => {
      const ids = [];

      expect(mapIdList(ids)).toEqual([]);
    });
  });

  describe('getEntityTitle', () => {
    it('should generate a title when the route have a predefined title', () => {
      expect(getEntityTitle(ENTITY_TYPE.FDA_SUBMISSION)).toEqual('FDA Submissions');
    });
    it('should generate a title when the route does not have a predefined title, but part of page route', () => {
      expect(getEntityTitle(ENTITY_TYPE.ALTERATION)).toEqual('Alterations');
    });
    it('should generate a title when the route does not have a predefined title, and not part of page route', () => {
      expect(getEntityTitle(ENTITY_TYPE.ASSOCIATION_CANCER_TYPE)).toEqual('Association Cancer Types');
    });
  });
});
