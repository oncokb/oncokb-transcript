import 'jest-expect-message';
import { useLastReviewedOnly } from './core-submission-utils';
import { Gene } from 'app/shared/model/firebase/firebase.model';
import { GENE_TYPE } from 'app/config/constants/firebase';
import _ from 'lodash';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

describe('useLastReviewedOnly', () => {
  const tests: [RecursivePartial<Gene>, RecursivePartial<Gene> | undefined][] = [
    [
      {
        summary: 'XXXXXXXXXXX',
        summary_review: {
          lastReviewed: 'YYYYYYYYYYY',
          added: true,
          updateTime: 0,
          updatedBy: 'Test User',
        },
      },
      undefined,
    ],
    [
      {
        summary: 'XXXXXXXXXXX',
        summary_review: {
          lastReviewed: 'YYYYYYYYYYY',
          updateTime: 0,
          updatedBy: 'Test User',
        },
      },
      {
        summary: 'YYYYYYYYYYY',
        summary_review: {
          updateTime: 0,
          updatedBy: 'Test User',
        },
      },
    ],
    [
      {
        type: {
          ocg: GENE_TYPE.ONCOGENE,
          ocg_review: {
            lastReviewed: '',
            updateTime: 0,
            updatedBy: 'Test User',
          },
        },
      },
      {
        type: {
          ocg: '',
          ocg_review: {
            updateTime: 0,
            updatedBy: 'Test User',
          },
        },
      },
    ],
    [
      {
        mutations: [
          {
            name: 'mutation name',
            name_review: {
              updateTime: 0,
              updatedBy: 'Test User',
            },
          },
          {
            name: 'mutation name',
            name_review: {
              lastReviewed: 'new mutation name',
              updateTime: 0,
              updatedBy: 'Test User',
            },
          },
          {
            name: 'mutation name2',
          },
        ],
      },
      {
        mutations: [
          {
            name: 'mutation name',
            name_review: {
              updateTime: 0,
              updatedBy: 'Test User',
            },
          },
          {
            name: 'new mutation name',
            name_review: {
              updateTime: 0,
              updatedBy: 'Test User',
            },
          },
          {
            name: 'mutation name2',
          },
        ],
      },
    ],
  ];

  test.each(tests)('Should only use last reviewed value %j', (obj, expected) => {
    const copy = _.cloneDeep(obj);
    expect(useLastReviewedOnly(obj)).toEqual(expected);
    expect(copy, 'The passed object should be untouched').toEqual(obj);
  });
});
