export function downloadFile(fileName: string, content: string, options: BlobPropertyBag = { type: 'text/tsv' }) {
  const blob = new Blob([content], options);
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
}

/**
 * Parses a delimited file into rows of values.
 *
 * A field that starts with a double quote is treated as quoted, which means separators and line breaks inside of it
 * belong to the value instead of ending the field or the row. This matters for the curation files, where free text
 * columns such as description regularly contain line breaks. A doubled quote inside a quoted field is an escaped quote.
 */
export const fileToArray = (fileString: string, separator: string): string[][] => {
  if (!fileString || !fileString.trim()) {
    return [];
  }

  const result: string[][] = [];
  let row: string[] = [];
  let field = '';
  let fieldIsQuoted = false;
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = '';
    fieldIsQuoted = false;
  };

  const endRow = () => {
    endField();
    // an empty line carries no value, so it is not a row
    if (row.length > 1 || row[0] !== '') {
      result.push(row);
    }
    row = [];
  };

  for (let i = 0; i < fileString.length; i++) {
    const char = fileString[i];

    if (inQuotes) {
      if (char !== '"') {
        field += char;
      } else if (fileString[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === '"' && !fieldIsQuoted && field === '') {
      // a quote opens a quoted field only when it is the first character of that field
      fieldIsQuoted = true;
      inQuotes = true;
    } else if (fileString.startsWith(separator, i)) {
      endField();
      i += separator.length - 1;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && fileString[i + 1] === '\n') {
        i++;
      }
      endRow();
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    endRow();
  }

  return result;
};

export const tsvToArray = (fileString: string): string[][] => {
  return fileToArray(fileString, '\t');
};

export const csvToArray = (fileString: string): string[][] => {
  return fileToArray(fileString, ',');
};
