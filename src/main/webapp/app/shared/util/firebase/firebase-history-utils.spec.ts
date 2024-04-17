import { HistoryOperationType } from 'app/shared/model/firebase/firebase.model';
import { findEntriesInObjectByUuids, parseAddRecord, parseUpdateRecord } from './firebase-history-utils';

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
          updatedBy: 'Lindsay LaFave',
        },
        name_uuid: '3fa31d79-c683-40ca-8285-41b10262ccb5',
        tumors_uuid: '8c942426-59b2-483f-9683-7c9092ec75ee',
      };

      const uuids = ['10b17d3f-da30-4fae-aa27-d776ea894e8d', '0c967537-b34b-4d6d-8c95-fb5e69f5575f', '123', '456', '789'];

      const [oncogenic, effect, mutation, cancerType, treatment] = findEntriesInObjectByUuids(object, uuids, []);
      expect(oncogenic).toStrictEqual(['Mutation Effect, Oncogenic', 'No']);
      expect(effect).toStrictEqual(['Mutation Effect', 'Likely Gain-of-function']);
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
      expect(parsedRecords[2].location).toBe('V600E, Mutation Effect');
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
      expect(parsedRecords[2].location).toBe('Mutation, Cancer Type, 12a3, Propagation');
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
      expect(parsedRecords[1].location).toBe('Mutation, Cancer Type, 12a3, Propagation');

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
});
