import 'jest-expect-message';
import { expandAlterationName, parseAlterationName } from './utils';

describe('Utils', () => {
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
});
