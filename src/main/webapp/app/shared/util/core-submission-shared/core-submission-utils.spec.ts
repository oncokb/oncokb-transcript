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
        mutations: [
          {
            name_uuid: '37a65ce9-1165-487a-be98-6975805d7e0f',
            name_review: {
              added: true,
            },
            name: 'created mutation',
          },
        ],
      },
      {
        summary: 'XXXXXXXXXXX',
        mutations: [],
      },
    ],
    [
      {
        summary: 'XXXXXXXXXXX',
        mutations: [
          {
            name: 'created cancer type test',
            tumors: [
              {
                cancerTypes: [
                  {
                    code: 'b2f013d0-608c-43a1-abdf-cba892b1f523',
                  },
                ],
                cancerTypes_review: { added: true },
              },
            ],
          },
        ],
      },
      {
        summary: 'XXXXXXXXXXX',
        mutations: [
          {
            name: 'created cancer type test',
            tumors: [],
          },
        ],
      },
    ],
    [
      {
        summary: 'XXXXXXXXXXX',
        mutations: [
          {
            tumors: [
              {
                TIs: [
                  {
                    name: 'created treatment test',
                    treatments: [
                      {
                        name: 'test',
                        name_review: { added: true },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        summary: 'XXXXXXXXXXX',
        mutations: [
          {
            tumors: [
              {
                TIs: [
                  {
                    name: 'created treatment test',
                    treatments: [],
                  },
                ],
              },
            ],
          },
        ],
      },
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
          lastReviewed: 'YYYYYYYYYYY',
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
            lastReviewed: '',
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
    ],
  ];

  test.each(tests)('Should only use last reviewed value %j', (obj, expected) => {
    const copy = _.cloneDeep(obj);
    expect(useLastReviewedOnly(obj)).toEqual(expected);
    expect(copy, 'The passed object should be untouched').toEqual(obj);
  });
});
