export const BASE_URL = process.env.DOCKER ? 'https://app:9000' : 'http://localhost:9000';
export const DATABASE_EMULATOR_URL = process.env.DOCKER ? 'http://firebase/?ns=mock-data' : 'http://localhost/?ns=mock-data';

export const PUB_MED_ARTICLE_TITLE = 'The RAF proteins take centre stage.';
export const PUB_MED_PMID = '15520807';
