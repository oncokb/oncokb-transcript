import 'jest-expect-message';
import {
  getCancerTypeName,
  expandAlterationName,
  generateUuid,
  getAlterationComparisonName,
  getFusionPartners,
  getFusionsWithoutCuratedGene,
  isUuid,
  parseAlterationName,
} from './utils';

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

  describe('getFusionPartners', () => {
    it('should parse gene partners regardless of casing', () => {
      expect(getFusionPartners('BCR::ABL1 Fusion')).toEqual(['BCR', 'ABL1']);
      expect(getFusionPartners('bcr::abl1 fusion')).toEqual(['BCR', 'ABL1'].map(partner => partner.toLowerCase()));
      expect(getFusionPartners('BCR::ABL1 Fusions')).toEqual(['BCR', 'ABL1']);
      // the double colon is what makes a hugo symbol containing a hyphen readable
      expect(getFusionPartners('NKX2-1::BRAF Fusion')).toEqual(['NKX2-1', 'BRAF']);
    });

    it('should return undefined when the alteration is not a two gene partner fusion', () => {
      expect(getFusionPartners('Fusions')).toBeUndefined();
      expect(getFusionPartners('V600E')).toBeUndefined();
      expect(getFusionPartners('Intragenic fusion')).toBeUndefined();
      // only the double colon separates the gene partners
      expect(getFusionPartners('BCR-ABL1 Fusion')).toBeUndefined();
      expect(getFusionPartners('MAP2K1_SMAD3 Fusion')).toBeUndefined();
    });
  });

  describe('getFusionsWithoutCuratedGene', () => {
    it('should accept fusions that include the curated gene', () => {
      expect(getFusionsWithoutCuratedGene(['BCR::ABL1 Fusion', 'ABL1::BCR fusion'], 'ABL1')).toEqual([]);
      expect(getFusionsWithoutCuratedGene(['bcr::abl1 Fusion'], 'ABL1')).toEqual([]);
    });

    it('should reject fusions where neither partner is the curated gene', () => {
      expect(getFusionsWithoutCuratedGene(['BCR::ABL1 Fusion'], 'BRAF')).toEqual(['BCR::ABL1 Fusion']);
      // ABL is an alias, only the main hugo symbol is accepted
      expect(getFusionsWithoutCuratedGene(['BCR::ABL Fusion'], 'ABL1')).toEqual(['BCR::ABL Fusion']);
    });

    it('should ignore alterations that are not two gene partner fusions', () => {
      expect(getFusionsWithoutCuratedGene(['Fusions', 'V600E'], 'BRAF')).toEqual([]);
    });

    it('should ignore everything when there is no gene being curated', () => {
      expect(getFusionsWithoutCuratedGene(['BCR::ABL1 Fusion'], undefined)).toEqual([]);
    });
  });

  describe('getAlterationComparisonName', () => {
    it('should canonicalize fusions so partner ordering does not matter', () => {
      const expected = 'abl1::bcr fusion';
      expect(getAlterationComparisonName('BCR::ABL1 Fusion')).toEqual(expected);
      expect(getAlterationComparisonName('ABL1::BCR Fusion')).toEqual(expected);
      expect(getAlterationComparisonName('abl1::bcr fusions')).toEqual(expected);
    });

    it('should only lowercase non fusion alterations', () => {
      expect(getAlterationComparisonName('V600E')).toEqual('v600e');
      expect(getAlterationComparisonName('Fusions')).toEqual('fusions');
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
