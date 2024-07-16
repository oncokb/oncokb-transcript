export function downloadFile(fileName: string, content: string, options: BlobPropertyBag = { type: 'text/tsv' }) {
  const blob = new Blob([content], options);
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
}

export const fileToArray = (fileString: string, separator: string): string[][] => {
  if (!fileString || !fileString.trim()) {
    return [];
  }

  const result: string[][] = [];
  fileString
    .split(/\r\n|\n|\r/)
    .filter(row => !!row)
    .forEach(row => {
      result.push(row.split(separator));
    });
  return result;
};

export const tsvToArray = (fileString: string): string[][] => {
  return fileToArray(fileString, '\t');
};

export const csvToArray = (fileString: string): string[][] => {
  return fileToArray(fileString, ',');
};
