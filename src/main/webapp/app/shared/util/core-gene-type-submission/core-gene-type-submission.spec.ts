import 'jest-expect-message';
import { createGeneTypePayload } from './core-gene-type-submission';
import { GENE_TYPE } from 'app/config/constants/firebase';

describe('getGeneType', () => {
  type CreateGeneTypePayloadParameters = Parameters<typeof createGeneTypePayload>;
  const tests: [
    CreateGeneTypePayloadParameters[0],
    CreateGeneTypePayloadParameters[1],
    Required<ReturnType<typeof createGeneTypePayload>>,
  ][] = [
    [
      { name: 'name', type: { ocg: GENE_TYPE.ONCOGENE, tsg: GENE_TYPE.TUMOR_SUPPRESSOR } },
      'type/ocg',
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: true,
      },
    ],
    [
      {
        name: 'name',
        type: {
          ocg: GENE_TYPE.ONCOGENE,
          ocg_review: { lastReviewed: '', updatedBy: '', updateTime: 0 },
          tsg: GENE_TYPE.TUMOR_SUPPRESSOR,
          tsg_review: { lastReviewed: '', updatedBy: '', updateTime: 0 },
        },
      },
      'type/ocg',
      {
        hugoSymbol: 'name',
        tsg: false,
        oncogene: true,
      },
    ],
    [
      {
        name: 'name',
        type: { ocg: GENE_TYPE.ONCOGENE, tsg: '', tsg_review: { lastReviewed: GENE_TYPE.TUMOR_SUPPRESSOR, updatedBy: '', updateTime: 0 } },
      },
      'type/ocg',
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: true,
      },
    ],
    [
      {
        name: 'name',
        type: { ocg: GENE_TYPE.ONCOGENE, tsg: '', tsg_review: { lastReviewed: GENE_TYPE.TUMOR_SUPPRESSOR, updatedBy: '', updateTime: 0 } },
      },
      'type/tsg',
      {
        hugoSymbol: 'name',
        tsg: false,
        oncogene: true,
      },
    ],
    [
      {
        name: 'name',
        type: { ocg: '', ocg_review: { lastReviewed: GENE_TYPE.ONCOGENE, updatedBy: '', updateTime: 0 }, tsg: GENE_TYPE.TUMOR_SUPPRESSOR },
      },
      'type/ocg',
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: false,
      },
    ],
    [
      {
        name: 'name',
        type: { ocg: '', ocg_review: { lastReviewed: GENE_TYPE.ONCOGENE, updatedBy: '', updateTime: 0 }, tsg: GENE_TYPE.TUMOR_SUPPRESSOR },
      },
      'type/tsg',
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: true,
      },
    ],
    [
      { name: 'name', type: { ocg: '', tsg: GENE_TYPE.TUMOR_SUPPRESSOR } },
      'type/tsg',
      {
        hugoSymbol: 'name',
        tsg: true,
        oncogene: false,
      },
    ],
    [
      { name: 'name', type: { ocg: '', tsg: '' } },
      'type/tsg',
      {
        hugoSymbol: 'name',
        tsg: false,
        oncogene: false,
      },
    ],
  ];

  test.each(tests)('Should map to payload correctly %j with value path "%s"', (gene, valuePath, expected) => {
    expect(createGeneTypePayload(gene, valuePath)).toEqual(expected);
  });
});
