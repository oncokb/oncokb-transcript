import { csvToArray, fileToArray, tsvToArray } from 'app/shared/util/file-utils';

describe('File utils', () => {
  describe('fileToArray', () => {
    it('empty string should return empty list', () => {
      expect(fileToArray('', '\t').length).toEqual(0);
    });
    it('row without only space will return empty list', () => {
      expect(fileToArray(' ', '\t').length).toEqual(0);
    });
    describe('row is properly parsed with different line breaks', () => {
      const runTestsForNewLines = (fileContent: string) => {
        const parsedResult = fileToArray('a\tb\nc\td', '\t');
        expect(parsedResult.length).toEqual(2);
        expect(parsedResult[0][0]).toEqual('a');
        expect(parsedResult[1][1]).toEqual('d');
      };
      // support multiple scenarios https://stackoverflow.com/a/20056634/1868022
      it('with \n', () => {
        runTestsForNewLines('a\tb\nc\td');
      });
      it('with \r\n', () => {
        runTestsForNewLines('a\tb\r\nc\td');
      });
      it('with \r', () => {
        runTestsForNewLines('a\tb\r\nc\td');
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
    describe('quoted fields', () => {
      it('surrounding quotes are removed', () => {
        const parsedResult = fileToArray('"a"\t"b"', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', 'b']);
      });
      it('separator inside a quoted field does not end the field', () => {
        const parsedResult = fileToArray('a\t"b\tc"', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', 'b\tc']);
      });
      it('line break inside a quoted field does not end the row', () => {
        const parsedResult = fileToArray('a\t"b\nc"\nd\te', '\t');
        expect(parsedResult.length).toEqual(2);
        expect(parsedResult[0]).toEqual(['a', 'b\nc']);
        expect(parsedResult[1]).toEqual(['d', 'e']);
      });
      it('line break right before the closing quote does not end the row', () => {
        const parsedResult = fileToArray('a\t"b\n"\nc\td', '\t');
        expect(parsedResult.length).toEqual(2);
        expect(parsedResult[0]).toEqual(['a', 'b\n']);
        expect(parsedResult[1]).toEqual(['c', 'd']);
      });
      it('doubled quotes inside a quoted field are unescaped', () => {
        const parsedResult = fileToArray('a\t"b ""c"" d"', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', 'b "c" d']);
      });
      it('a quote that is not the first character of the field is kept', () => {
        const parsedResult = fileToArray('a\tb"c', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', 'b"c']);
      });
      it('an empty quoted field is parsed as an empty value', () => {
        const parsedResult = fileToArray('a\t""\tb', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', '', 'b']);
      });
      it('an unterminated quoted field runs to the end of the file', () => {
        const parsedResult = fileToArray('a\t"b\nc', '\t');
        expect(parsedResult.length).toEqual(1);
        expect(parsedResult[0]).toEqual(['a', 'b\nc']);
      });
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
