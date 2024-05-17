import { HistoryList, HistoryOperationType, MutationEffect, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import {
  DownloadableHistoryEntry,
  DownloadableHistoryResult,
  findEntriesInObjectByUuids,
  getGeneHistoryForDateRange,
  getHistoryEntryStrings,
  isBetweenDates,
  makeHistoryLocationReadable,
  parseAddRecord,
  parseUpdateRecord,
} from './firebase-history-utils';
import { IDrug } from 'app/shared/model/drug.model';
import { generateUuid } from '../utils';

describe('FirebaseHistoryUtils', () => {
  describe('findEntriesInObjectByUuids', () => {
    it('should extract fields in uuids', () => {
      const object = {
        mutation_effect: {
          description: 'V600E description',
          description_review: {
            lastReviewed: '',
            updateTime: 1550582491718,
            updatedBy: 'User',
          },
          description_uuid: '73fd71c5-4191-4192-b28a-e6a9b2eb4e83',
          effect: 'Likely Gain-of-function',
          effect_review: {
            lastReviewed: '',
            updateTime: 1550458935149,
            updatedBy: 'User',
          },
          effect_uuid: '0c967537-b34b-4d6d-8c95-fb5e69f5575f',
          oncogenic: 'No',
          oncogenic_review: {
            lastReviewed: '',
            updateTime: 1550458736955,
            updatedBy: 'User',
          },
          oncogenic_uuid: '10b17d3f-da30-4fae-aa27-d776ea894e8d',
          short: '',
        },
        mutation_effect_uuid: 'be1dad42-02ae-41a1-902b-2deff0ffb060',
        mutations: [
          {
            name: 'Mutation',
            name_uuid: '123',
            tumors: [
              {
                TIs: [
                  {
                    treatments: [
                      {
                        name: 'Treatment',
                        name_uuid: '789',
                      },
                    ],
                  },
                ],
                cancerTypes: [
                  {
                    code: 'MEL',
                    naubType: 'Melanoma',
                    subtype: 'Melanoma',
                  },
                ],
                cancerTypes_uuid: '456',
              },
            ],
          },
        ],
        name: 'V600E',
        name_review: {
          added: true,
          updateTime: 1550458712327,
          updatedBy: 'User',
        },
        name_uuid: '3fa31d79-c683-40ca-8285-41b10262ccb5',
        tumors_uuid: '8c942426-59b2-483f-9683-7c9092ec75ee',
      };

      const uuids = ['10b17d3f-da30-4fae-aa27-d776ea894e8d', '0c967537-b34b-4d6d-8c95-fb5e69f5575f', '123', '456', '789'];

      const [oncogenic, effect, mutation, cancerType, treatment] = findEntriesInObjectByUuids(object, uuids, []);
      expect(oncogenic).toStrictEqual(['Mutation Effect, Oncogenic', 'No']);
      expect(effect).toStrictEqual(['Mutation Effect, Effect', 'Likely Gain-of-function']);
      expect(mutation).toStrictEqual(['Mutation, Name', 'Mutation']);
      expect(cancerType[0]).toStrictEqual('Mutation, Melanoma, Name');
      expect(treatment).toStrictEqual(['Mutation, Melanoma, Treatment, Name', 'Treatment']);
    });
  });

  describe('parseAddRecord', () => {
    const record = {
      lastEditBy: 'User',
      location: 'V600E',
      new: {
        mutation_effect: {
          description: 'V600E description',
          description_review: {
            lastReviewed: '',
            updateTime: 1550582491718,
            updatedBy: 'User',
          },
          description_uuid: '73fd71c5-4191-4192-b28a-e6a9b2eb4e83',
          effect: 'Likely Gain-of-function',
          effect_review: {
            lastReviewed: '',
            updateTime: 1550458935149,
            updatedBy: 'User',
          },
          effect_uuid: '0c967537-b34b-4d6d-8c95-fb5e69f5575f',
          oncogenic: 'No',
          oncogenic_review: {
            lastReviewed: '',
            updateTime: 1550458736955,
            updatedBy: 'User',
          },
          oncogenic_uuid: '10b17d3f-da30-4fae-aa27-d776ea894e8d',
          short: '',
        },
        mutation_effect_uuid: 'be1dad42-02ae-41a1-902b-2deff0ffb060',
        name: 'V600E',
        name_review: {
          added: true,
          updateTime: 1550458712327,
          updatedBy: 'Lindsay LaFave',
        },
        name_uuid: '3fa31d79-c683-40ca-8285-41b10262ccb5',
        tumors_uuid: '8c942426-59b2-483f-9683-7c9092ec75ee',
      },
      operation: HistoryOperationType.ADD,
      uuids: '10b17d3f-da30-4fae-aa27-d776ea894e8d,0c967537-b34b-4d6d-8c95-fb5e69f5575f',
    };

    it('should only stringify new object when duplicateNestedUpdates is false', () => {
      const parsedRecords = parseAddRecord(record, [], false);
      expect(parsedRecords.length).toBe(1);
      expect(parsedRecords[0].new).toBe(JSON.stringify(record.new, null, 4));
    });

    it('should stringify new object and create update objects for uuids when duplicateNestedUpdates is true', () => {
      const parsedRecords = parseAddRecord(record, [], true);

      expect(parsedRecords.length).toBe(3);
      expect(parsedRecords[0].new).toBe(JSON.stringify(record.new, null, 4));

      expect(parsedRecords[1].new).toBe('No');
      expect(parsedRecords[1].location).toBe('V600E, Mutation Effect, Oncogenic');
      expect(parsedRecords[1].operation).toBe(HistoryOperationType.UPDATE);

      expect(parsedRecords[2].new).toBe('Likely Gain-of-function');
      expect(parsedRecords[2].location).toBe('V600E, Mutation Effect, Effect');
      expect(parsedRecords[1].operation).toBe(HistoryOperationType.UPDATE);
    });
  });

  describe('parseUpdateRecord', () => {
    it('should produce multiple records when new is an object', () => {
      const record = {
        lastEditBy: 'User',
        location: 'Mutation, Cancer Type, STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY, 12a3',
        new: {
          description: 'New Description',
          indication: 'New Indication',
          propagation: 'New Propagation',
        },
        old: {
          description: 'Old Description',
          indication: 'Old Indication',
        },
        operation: HistoryOperationType.UPDATE,
        uuids: '8b9dc0bb-e481-49e4-87b9-0e93d7ef531c',
      };

      const parsedRecords = parseUpdateRecord(record, []);

      expect(parsedRecords.length).toBe(3);

      expect(parsedRecords[0].new).toBe('New Description');
      expect(parsedRecords[0].old).toBe('Old Description');
      expect(parsedRecords[0].location).toBe('Mutation, Cancer Type, 12a3, Description');

      expect(parsedRecords[1].new).toBe('New Indication');
      expect(parsedRecords[1].old).toBe('Old Indication');
      expect(parsedRecords[1].location).toBe('Mutation, Cancer Type, 12a3, Indication');

      expect(parsedRecords[2].new).toBe('New Propagation');
      expect(parsedRecords[2].old).toBe(undefined);
      expect(parsedRecords[2].location).toBe('Mutation, Cancer Type, 12a3, Propagation to Other Solid Tumor Types');
    });

    it('should produce records with undefined new when old has field not in new', () => {
      const record = {
        lastEditBy: 'User',
        location: 'Mutation, Cancer Type, STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY, 12a3',
        new: {
          description: 'New Description',
          propagation: 'New Propagation',
        },
        old: {
          description: 'Old Description',
          indication: 'Old Indication',
        },
        operation: HistoryOperationType.UPDATE,
        uuids: '8b9dc0bb-e481-49e4-87b9-0e93d7ef531c',
      };

      const parsedRecords = parseUpdateRecord(record, []);

      expect(parsedRecords.length).toBe(3);

      expect(parsedRecords[0].new).toBe('New Description');
      expect(parsedRecords[0].old).toBe('Old Description');
      expect(parsedRecords[0].location).toBe('Mutation, Cancer Type, 12a3, Description');

      expect(parsedRecords[1].new).toBe('New Propagation');
      expect(parsedRecords[1].old).toBe(undefined);
      expect(parsedRecords[1].location).toBe('Mutation, Cancer Type, 12a3, Propagation to Other Solid Tumor Types');

      expect(parsedRecords[2].new).toBe(undefined);
      expect(parsedRecords[2].old).toBe('Old Indication');
      expect(parsedRecords[2].location).toBe('Mutation, Cancer Type, 12a3, Indication');
    });

    it('should produce one record when new is a string', () => {
      const record = {
        lastEditBy: 'User',
        location: 'Mutation, Cancer Type, STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY, 12a3',
        new: 'New',
        old: 'Old',
        operation: HistoryOperationType.UPDATE,
        uuids: '8b9dc0bb-e481-49e4-87b9-0e93d7ef531c',
      };

      const parsedRecords = parseUpdateRecord(record, []);

      expect(parsedRecords.length).toBe(1);

      expect(parsedRecords[0].new).toBe('New');
      expect(parsedRecords[0].old).toBe('Old');
      expect(parsedRecords[0].location).toBe('Mutation, Cancer Type, 12a3');
    });
  });

  describe('makeHistoryLocationReadable', () => {
    it('should convert history strings that are recognized and leave others alone', () => {
      const uuid1 = generateUuid();
      const uuid2 = generateUuid();
      const uuid3 = 'Not a real uuid';
      const drugList: readonly IDrug[] = [
        {
          name: 'Drug1',
          uuid: uuid1,
        },
        {
          name: 'Drug2',
          uuid: uuid2,
        },
        {
          name: 'Drug3',
          uuid: uuid3,
        },
      ];

      const location = ['Gene Summary', 'Tumor Type Summary', 'Gene Background', `${uuid1} + ${uuid2}`, uuid3, 'Not a recognized string'];

      const readableLocation = makeHistoryLocationReadable(location, drugList);
      expect(readableLocation).toStrictEqual(['Summary', 'Summary', 'Background', 'Drug1 + Drug2', uuid3, 'Not a recognized string']);
    });
  });

  describe('getHistoryEntryStrings', () => {
    const entries: DownloadableHistoryEntry[] = [
      {
        location: 'Mutation, Cancer Type',
        operation: HistoryOperationType.UPDATE,
        hugoSymbol: 'BRAF',
        timeStamp: 2,
        new: 'new',
        old: 'old',
      },
      {
        location: 'Mutation, Cancer Type',
        operation: HistoryOperationType.ADD,
        hugoSymbol: 'BRAF',
        timeStamp: 1,
        level: '3A',
      },
      {
        location: 'Mutation, Cancer Type',
        operation: HistoryOperationType.DELETE,
        hugoSymbol: 'BRAF',
        timeStamp: 3,
        new: 'new',
        old: 'new',
      },
    ];

    it('should sort and parse entries into strings', () => {
      expect(getHistoryEntryStrings(entries)).toStrictEqual([
        'BRAF Mutation, Cancer Type 3A Added',
        'BRAF Mutation, Cancer Type Updated\n\t New: new\n\t Old: old',
      ]);
    });
  });

  describe('isBetweenDates', () => {
    // Date(1) = 1970-01-01T00:00:00.001Z
    // Date(2) = 1970-01-01T00:00:00.002Z
    // Date(3) = 1970-01-01T00:00:00.003Z

    test.each([
      {
        date: new Date(2),
        start: new Date(1),
        end: new Date(3),
        expected: true,
      },
      {
        date: new Date(1),
        start: new Date(2),
        end: new Date(3),
        expected: false,
      },
      {
        date: new Date(2),
        start: new Date(3),
        end: new Date(1),
        expected: false,
      },
    ])('returns $expected when for isBetweenDates with date = $date, start = $start, and end = $end', ({ date, start, end, expected }) => {
      expect(isBetweenDates(date, start, end)).toBe(expected);
    });
  });

  describe('getGeneHistoryForDateRange', () => {
    const admin = '';
    const lastEditBy = '';
    const timeStamp = 0;

    it('should only attach new and old for name change, effect, and level', () => {
      const historyList: HistoryList = {
        1: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type',
              operation: HistoryOperationType.NAME_CHANGE,
              new: 'New name',
              old: 'Old name',
            },
          ],
          timeStamp,
        },
        2: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Level',
              operation: HistoryOperationType.UPDATE,
              new: '1',
              old: '2',
            },
          ],
          timeStamp,
        },
        3: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Oncogenic',
              operation: HistoryOperationType.UPDATE,
              new: 'New oncogenic',
              old: 'Old oncogenic',
            },
          ],
          timeStamp,
        },
        4: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Effect',
              operation: HistoryOperationType.UPDATE,
              new: 'New effect',
              old: 'Old effect',
            },
          ],
          timeStamp,
        },
        5: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Description',
              operation: HistoryOperationType.UPDATE,
              new: 'New description',
              old: 'Old description',
            },
          ],
          timeStamp,
        },
      };

      const expected: DownloadableHistoryResult = {
        gene: [],
        alteration: [],
        evidence: [
          {
            location: 'Mutation, Cancer Type',
            operation: HistoryOperationType.NAME_CHANGE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: 'New name',
            old: 'Old name',
          },
          {
            location: 'Mutation, Cancer Type, Level',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: '1',
            old: '2',
          },
          {
            location: 'Mutation, Cancer Type, Oncogenic',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: 'New oncogenic',
            old: 'Old oncogenic',
          },
          {
            location: 'Mutation, Cancer Type, Effect',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: 'New effect',
            old: 'Old effect',
          },
          {
            location: 'Mutation, Cancer Type, Description',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
          },
        ],
      };

      expect(getGeneHistoryForDateRange('BRAF', historyList, [], new Date(0), new Date(6))).toStrictEqual(expected);
    });

    it('should put history as correct type (gene, alteration, or evidence)', () => {
      const historyList: HistoryList = {
        1: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type',
              operation: HistoryOperationType.NAME_CHANGE,
              new: 'New name',
              old: 'Old name',
            },
          ],
          timeStamp,
        },
        2: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Summary',
              operation: HistoryOperationType.UPDATE,
              new: 'New summary',
              old: 'Old summary',
            },
          ],
          timeStamp,
        },
        3: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Mutation Effect, Oncogenic',
              operation: HistoryOperationType.UPDATE,
              new: 'New oncogenic',
              old: 'Old oncogenic',
            },
          ],
          timeStamp,
        },
        4: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation',
              operation: HistoryOperationType.ADD,
              new: { mutation_effect: new MutationEffect() },
              old: {},
            },
          ],
          timeStamp,
        },
        5: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type',
              operation: HistoryOperationType.ADD,
              new: {},
              old: {},
            },
          ],
          timeStamp,
        },
      };

      const expected: DownloadableHistoryResult = {
        gene: [
          {
            location: 'Summary',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
          },
        ],
        alteration: [
          {
            location: 'Mutation, Cancer Type, Mutation Effect, Oncogenic',
            operation: HistoryOperationType.UPDATE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: 'New oncogenic',
            old: 'Old oncogenic',
          },
          {
            location: 'Mutation',
            operation: HistoryOperationType.ADD,
            hugoSymbol: 'BRAF',
            timeStamp,
          },
        ],
        evidence: [
          {
            location: 'Mutation, Cancer Type',
            operation: HistoryOperationType.NAME_CHANGE,
            hugoSymbol: 'BRAF',
            timeStamp,
            new: 'New name',
            old: 'Old name',
          },
          {
            location: 'Mutation, Cancer Type',
            operation: HistoryOperationType.ADD,
            hugoSymbol: 'BRAF',
            timeStamp,
          },
        ],
      };
      const results = getGeneHistoryForDateRange('BRAF', historyList, [], new Date(0), new Date(6));
      expect(results).toStrictEqual(expected);
    });

    it('should include level when adding or delting therapy (i.e. level field is present)', () => {
      const historyList: HistoryList = {
        1: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Therapy',
              operation: HistoryOperationType.ADD,
              new: { level: TX_LEVELS.LEVEL_3A },
            },
          ],
          timeStamp,
        },
        2: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Therapy',
              operation: HistoryOperationType.DELETE,
              old: { level: TX_LEVELS.LEVEL_1 },
            },
          ],
          timeStamp,
        },
        3: {
          admin,
          records: [
            {
              lastEditBy,
              location: 'Mutation, Cancer Type, Therapy',
              operation: HistoryOperationType.ADD,
              new: {},
            },
          ],
          timeStamp,
        },
      };

      const expectedEvidence: DownloadableHistoryEntry[] = [
        {
          location: 'Mutation, Cancer Type, Therapy',
          operation: HistoryOperationType.ADD,
          hugoSymbol: 'BRAF',
          timeStamp,
          level: TX_LEVELS.LEVEL_3A,
        },
        {
          location: 'Mutation, Cancer Type, Therapy',
          operation: HistoryOperationType.DELETE,
          hugoSymbol: 'BRAF',
          timeStamp,
          level: TX_LEVELS.LEVEL_1,
        },
        {
          location: 'Mutation, Cancer Type, Therapy',
          operation: HistoryOperationType.ADD,
          hugoSymbol: 'BRAF',
          timeStamp,
        },
      ];

      const results = getGeneHistoryForDateRange('BRAF', historyList, [], new Date(0), new Date(6));
      expect(results.evidence).toStrictEqual(expectedEvidence);
    });
  });
});
