import 'jest-expect-message';
import { getCancerTypeName, expandAlterationName, generateUuid, isUuid, parseAlterationName, buildAlterationName } from './utils';

describe('Utils', () => {
  describe('getCancerTypeName', () => {
    it('should return correct cancer type name when code, main type and subtype are available', () => {
      const cancerType = { code: 'MEL', mainType: 'Melanoma', subtype: 'Ocular Melanoma' };
      expect(getCancerTypeName(cancerType)).toEqual('Ocular Melanoma (MEL)');
      expect(getCancerTypeName(cancerType, true)).toEqual('Ocular Melanoma');
    });

    it('should return correct cancer type name when no subtype', () => {
      const cancerType = { code: 'MEL', mainType: 'Melanoma' };
      expect(getCancerTypeName(cancerType)).toEqual('Melanoma');
      expect(getCancerTypeName(cancerType, true)).toEqual('Melanoma');
    });
  });

  describe('expandAlterationName', () => {
    it('should expand alterations when correctly formatted', () => {
      const correctlyFormattedNames = ['V600E', 'V600E/G', 'V600E/G/F', 'V 600 E', 'V 600 E/G', 'V600 E/G/ F', 'V 600 E / G / F'];
      const expectedOutput = [
        ['V600E'],
        ['V600E', 'V600G'],
        ['V600E', 'V600G', 'V600F'],
        ['V600E'],
        ['V600E', 'V600G'],
        ['V600E', 'V600G', 'V600F'],
        ['V600E', 'V600G', 'V600F'],
      ];

      const results = correctlyFormattedNames.map(name => expandAlterationName(name));
      expect(JSON.stringify(results)).toEqual(JSON.stringify(expectedOutput));
    });

    it('should expand alterations that are comma seperated', () => {
      expect(expandAlterationName('V600E, V600G, V600F', true)).toEqual(['V600E', 'V600G', 'V600F']);
    });

    it('should return original alteration when incorrectly formatted', () => {
      const incorrectlyFormattedNames = ['VE600 G', 'V600GF', 'V600E/G/FL'];
      const expectedOutput = [['VE600 G'], ['V600GF'], ['V600E/G/FL']];

      const results = incorrectlyFormattedNames.map(name => expandAlterationName(name));
      expect(JSON.stringify(results)).toEqual(JSON.stringify(expectedOutput));
    });
  });

  describe('parseAlterationName', () => {
    const alterationNames = [
      'V600E',
      'V600E {excluding 1 ; 2}',
      'V600E [Test]',
      'V600E {excluding 1;2} (comment)',
      'V600E {excluding 1;2} (comment) [test]',
      'V600E (comment) [test] {excluding 1}',
      'V600E/G [test] {excluding 1;2} (comment)',
    ];

    const expectedOutputs = [
      [
        {
          alteration: 'V600E',
          excluding: [],
          comment: '',
          name: '',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: ['1', '2'],
          comment: '',
          name: '',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: [],
          comment: '',
          name: 'Test',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: ['1', '2'],
          comment: 'comment',
          name: '',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: ['1', '2'],
          comment: 'comment',
          name: 'test',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: ['1'],
          comment: 'comment',
          name: 'test',
        },
      ],
      [
        {
          alteration: 'V600E',
          excluding: ['1', '2'],
          comment: 'comment',
          name: 'test',
        },
        {
          alteration: 'V600G',
          excluding: ['1', '2'],
          comment: 'comment',
          name: 'test',
        },
      ],
    ];

    it('should correctly parse alterations', () => {
      const results = alterationNames.map(alt => parseAlterationName(alt));
      expect(JSON.stringify(results)).toEqual(JSON.stringify(expectedOutputs));
    });
  });

  describe('buildAlterationName', () => {
    test.each([
      ['V600E', undefined, undefined, undefined, 'V600E'],
      ['V600E', 'Renamed', undefined, undefined, 'V600E [Renamed]'],
      ['V600E', 'Renamed', ['A', 'B'], undefined, 'V600E [Renamed] {excluding A; B}'],
      ['V600E', 'Renamed', ['A', 'B'], 'Test mutation', 'V600E [Renamed] {excluding A; B} (Test mutation)'],
      ['V600E', '', [], '', 'V600E'],
    ])('should build alteration name', (alteration, name, excluding, comment, expected) => {
      expect(buildAlterationName(alteration, name, excluding, comment)).toEqual(expected);
    });
  });

  describe('isUuid', () => {
    it('should indentify uuids', () => {
      const uuid = generateUuid();
      expect(isUuid(uuid)).toBeTruthy();

      const notUuid = '12345ase';
      expect(isUuid(notUuid)).toBeFalsy();
    });
  });
});
