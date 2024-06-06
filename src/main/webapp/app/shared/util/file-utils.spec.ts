import { csvToArray, fileToArray, tsvToArray } from 'app/shared/util/file-utils';

describe('File utils', () => {
  describe('fileToArray', () => {
    it('empty string should return empty list', () => {
      expect(fileToArray('', '\t').length).toEqual(0);
    });
    it('row without only space will return empty list', () => {
      expect(fileToArray(' ', '\t').length).toEqual(0);
    });
    describe('row is properly parsed with different line break', () => {
      it('with \n', () => {
        const parsedResult = fileToArray('a\tb\nc\td', '\t');
        expect(parsedResult.length).toEqual(2);
        expect(parsedResult[0][0]).toEqual('a');
        expect(parsedResult[1][1]).toEqual('d');
      });
      it('with \r\n', () => {
        const parsedResult = fileToArray('a\tb\r\nc\td', '\t');
        expect(parsedResult.length).toEqual(2);
        expect(parsedResult[0][0]).toEqual('a');
        expect(parsedResult[1][1]).toEqual('d');
      });
    });
    it('row is properly parsed with proper separator', () => {
      const parsedResult = fileToArray('a\tb\nc\td', '\t');
      expect(parsedResult.length).toEqual(2);
      expect(parsedResult[0][0]).toEqual('a');
      expect(parsedResult[1][1]).toEqual('d');
    });
    it('row is properly parsed with unintended separator', () => {
      const parsedResult = fileToArray('a\tb\nc\td', ',');
      expect(parsedResult.length).toEqual(2);
      expect(parsedResult[0].length).toEqual(1);
      expect(parsedResult[0][0]).toEqual('a\tb');
    });
  });
  describe('tsvToArray', () => {
    it('row is properly parsed with proper separator', () => {
      const parsedResult = tsvToArray('a\tb\nc\td');
      expect(parsedResult.length).toEqual(2);
      expect(parsedResult[0][0]).toEqual('a');
      expect(parsedResult[1][1]).toEqual('d');
    });
  });
  describe('csvToArray', () => {
    it('row is properly parsed with proper separator', () => {
      const parsedResult = csvToArray('a,b\nc,d');
      expect(parsedResult.length).toEqual(2);
      expect(parsedResult[0][0]).toEqual('a');
      expect(parsedResult[1][1]).toEqual('d');
    });
  });
});
