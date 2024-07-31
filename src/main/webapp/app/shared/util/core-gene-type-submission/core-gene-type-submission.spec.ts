import 'jest-expect-message';
import { createGeneTypePayload } from './core-gene-type-submission';
import { GENE_TYPE } from 'app/config/constants/firebase';

describe('getGeneType', () => {
  const tests: [Parameters<typeof createGeneTypePayload>[0], Required<ReturnType<typeof createGeneTypePayload>>][] = [
    [
      { name: 'name', type: { ocg: GENE_TYPE.ONCOGENE, tsg: GENE_TYPE.TUMOR_SUPPRESSOR } },
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: true,
      },
    ],
    [
      { name: 'name', type: { ocg: undefined, tsg: GENE_TYPE.TUMOR_SUPPRESSOR } },
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: false,
      },
    ],
    [
      { name: 'name', type: { ocg: undefined, tsg: undefined } },
      {
        hugoSymbol: 'name',
        tsg: false,
        oncogene: false,
      },
    ],
  ];

  test.each(tests)('Should map to payload correctly %j', (args, expected) => {
    expect(createGeneTypePayload(args)).toEqual(expected);
  });
});
