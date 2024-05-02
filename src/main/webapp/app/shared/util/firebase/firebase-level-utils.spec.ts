import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { FDA_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { convertToFdaLevelKey, getFdaPropagationInfo, getPropagatedLevelDropdownOptions } from './firebase-level-utils';
import { isBetweenDates } from './firebase-history-utils';

describe('Firebase Level Utils', () => {
  describe('convertToFdaLevelKey', () => {
    test.each([
      { fdaLevel: FDA_LEVELS.LEVEL_FDA1, expected: FDA_LEVEL_KEYS.LEVEL_FDA1 },
      { fdaLevel: FDA_LEVELS.LEVEL_FDA2, expected: FDA_LEVEL_KEYS.LEVEL_FDA2 },
      { fdaLevel: FDA_LEVELS.LEVEL_FDA3, expected: FDA_LEVEL_KEYS.LEVEL_FDA3 },
      { fdaLevel: FDA_LEVELS.LEVEL_FDA_NO, expected: FDA_LEVEL_KEYS.LEVEL_FDA_NO },
    ])('should convert $fdaLevel to $expected', ({ fdaLevel, expected }) => {
      expect(convertToFdaLevelKey(fdaLevel)).toEqual(expected);
    });
  });

  describe('getFdaPropagationInfo', () => {
    test.each([[TX_LEVELS.LEVEL_1], [TX_LEVELS.LEVEL_2], [TX_LEVELS.LEVEL_R1]])(
      'should return FDA levels 2, 3 and no when highest level is %s',
      txLevel => {
        const { dropdownOptions, defaultPropagation } = getFdaPropagationInfo(txLevel);
        expect(defaultPropagation).toEqual(FDA_LEVEL_KEYS.LEVEL_FDA2);
        expect(dropdownOptions.map(o => o.value)).toStrictEqual([
          FDA_LEVEL_KEYS.LEVEL_FDA2,
          FDA_LEVEL_KEYS.LEVEL_FDA3,
          FDA_LEVEL_KEYS.LEVEL_FDA_NO,
        ]);
      }
    );

    test.each([[TX_LEVELS.LEVEL_3B], [TX_LEVELS.LEVEL_4], [TX_LEVELS.LEVEL_R2]])(
      'should return FDA levels 3 and no when highest level is %s',
      txLevel => {
        const { dropdownOptions, defaultPropagation } = getFdaPropagationInfo(txLevel);
        expect(defaultPropagation).toEqual(FDA_LEVEL_KEYS.LEVEL_FDA3);
        expect(dropdownOptions.map(o => o.value)).toStrictEqual([FDA_LEVEL_KEYS.LEVEL_FDA3, FDA_LEVEL_KEYS.LEVEL_FDA_NO]);
      }
    );
  });

  describe('getPropagatedLevelDropdownOptions', () => {
    test.each([[TX_LEVELS.LEVEL_1], [TX_LEVELS.LEVEL_2], [TX_LEVELS.LEVEL_3A]])(
      'should return levels 3B, 4 and no when highest level is %s',
      txLevel => {
        const options = getPropagatedLevelDropdownOptions(txLevel);
        expect(options.map(o => o.value)).toStrictEqual([TX_LEVELS.LEVEL_3B, TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_NO]);
      }
    );

    it('should return levels 4 and no when highest level is 4', () => {
      const options = getPropagatedLevelDropdownOptions(TX_LEVELS.LEVEL_4);
      expect(options.map(o => o.value)).toStrictEqual([TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_NO]);
    });

    test.each([[TX_LEVELS.LEVEL_3B], [TX_LEVELS.LEVEL_R1], [TX_LEVELS.LEVEL_R2]])(
      'should not have propagation levels when highest level is %s',
      txLevel => {
        const options = getPropagatedLevelDropdownOptions(txLevel);
        expect(options.length).toEqual(0);
      }
    );
  });
});
