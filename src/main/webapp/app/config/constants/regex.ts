export const SINGLE_NUCLEOTIDE_POS_REGEX = /[a-zA-Z]+(\d+)(?!.*Fusion)/;

export const REFERENCE_LINK_REGEX = /(\(\s*(?:PMID|NCT|Abstract):?.*?\))/i;

export const FDA_SUBMISSION_REGEX = new RegExp('^([A-Z]+[0-9]+)(\\/((S[0-9]+)(-(S[0-9]+))?))?');

export const UUID_REGEX = new RegExp('\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}');

export const WHOLE_NUMBER_REGEX = new RegExp('^\\d+$');

export const INTEGER_REGEX = /^-?\d+$/;
