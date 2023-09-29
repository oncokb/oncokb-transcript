const mockUuidReturnValue = 'fake-uuid';

import { Gene, GeneType, Review } from './firebase.model';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue(mockUuidReturnValue) }));

describe('Firebase Models', () => {
  const DEFAULT_UUID = mockUuidReturnValue;
  const DEFAULT_DATE = new Date('2023-01-01');
  const DEFAULT_USER = 'test user';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
  });

  describe('When Gene model is created', () => {
    it('should have default fields', () => {
      const gene = new Gene('EGFR');

      expect(gene).toEqual({
        name: 'EGFR',
        names_comments: [],
        background: '',
        background_uuid: DEFAULT_UUID,
        dmp_refseq_id: '',
        isoform_override: '',
        mutations: [],
        mutations_uuid: DEFAULT_UUID,
        summary: '',
        summary_uuid: DEFAULT_UUID,
        penetrance: '',
        penetrance_uuid: DEFAULT_UUID,
        type: new GeneType(),
        type_uuid: DEFAULT_UUID,
        dmp_refseq_id_grch38: '',
        isoform_override_grch38: '',
      });
    });
  });

  describe('When GeneType model is created', () => {
    it('should have default fields', () => {
      const geneType = new GeneType();

      expect(geneType).toEqual({
        ocg: '',
        ocg_uuid: DEFAULT_UUID,
        tsg: '',
        tsg_uuid: DEFAULT_UUID,
      });
    });
  });

  describe('When Review model is created', () => {
    it('should have default fields', () => {
      const review = new Review(DEFAULT_USER);

      expect(review).toEqual({
        updateTime: DEFAULT_DATE.getTime(),
        updatedBy: DEFAULT_USER,
      });
    });
  });
});
