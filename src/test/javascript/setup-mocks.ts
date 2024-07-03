import { browser } from '@wdio/globals';
import { DATABASE_EMULATOR_URL, PUB_MED_PMID, PUB_MED_ARTICLE_TITLE } from './constants';

export default async function setUpMocks() {
  const firebaseConfig = JSON.stringify({
    firebase: {
      enabled: true,
      connectToFirebaseEmulators: true,
      databaseURL: DATABASE_EMULATOR_URL,
      apiKey: 'AIzaSyCUd3bf-TEg5T78w_-RKT6uV_pf3VTVvo8',
      projectId: 'oncokb-curation-test-54b6c',
    },
  });
  const indexMock = await browser.mock(`**`, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
    statusCode: 200,
  });
  indexMock.respond(req => {
    if (typeof req.body === 'string') {
      req.body = req.body.replace(/(window\.serverConfig\.frontend\s*=\s*.*)({.*})(;)/, `$1${firebaseConfig}$3`);
    }
    return req.body;
  });
  const authMock = await browser.mock('**/api/account');
  authMock.respond(
    {
      authorities: ['ROLE_CURATOR', 'ROLE_USER'],
    },
    {
      statusCode: 200,
      fetchResponse: false,
    },
  );
  const firebaseTokenMock = await browser.mock('**/api/account/firebase-token');
  firebaseTokenMock.respond(
    'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJmaXJlYmFzZUF1dGhvcml6ZWRVc2VyIjp0cnVlfSwiZXhwIjoxNzE1MTk2MDAxLCJpYXQiOjE3MTUxOTI0MDEsImlzcyI6ImZpcmViYXNlLWFkbWluc2RrLXVrNjRhQGRldi1vbmNva2ItY3VyYXRpb24tdjIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay11azY0YUBkZXYtb25jb2tiLWN1cmF0aW9uLXYyLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiYnByaXplMTVAZ21haWwuY29tIn0.XCZVZG4RgwZ3XoO_uKERJFRsHNAn9pVXT12NkHTN4LgWIlfZPzKAszHinWGK9XQqbxWWxryDCE8YtJ-BNvIFNU-J5cFUgUzbYCYhoNWQy4g4M90Zwf1U478F2LjL6kYbSTxcCpfUBGI3RT-cea9GhOx8PjE_T78JZYeI-1xCHPOm78ABfaDEnfcb7l8mFVyCUqbXRhRtZa6Sl-K1TnFtuXgZQLK24Yp9iXTBbFKvndc7J6ymS2OTL7aRQGROMMSyWMNs8rdThW2e5eHz4tl9ICH0gWvzRXCwH7sXgGXw5o0XoCH4hFUlhxhkT2yjThY1b10GTS_BWB3PF2bi3a-JXA',
    {
      statusCode: 200,
      fetchResponse: false,
    },
  );
  const drugsMock = await browser.mock('**/api/drugs*');
  drugsMock.respond(
    [
      {
        id: 1,
        uuid: '2e8ce490-86c2-45a4-a6e4-db5e5314981c',
        name: 'Prednisolone',
        nciThesaurus: {
          id: 158405,
          version: '23.11d',
          code: 'C769',
          preferredName: 'Prednisolone',
          displayName: 'Prednisolone',
          synonyms: null,
        },
        fdaDrugs: [],
        flags: [],
        associations: [],
      },
      {
        id: 15,
        uuid: '939cd40b-b515-499d-b099-fd29027c0d17',
        name: 'Dabrafenib',
        nciThesaurus: {
          id: 163898,
          version: '23.11d',
          code: 'C82386',
          preferredName: 'Dabrafenib',
          displayName: 'Dabrafenib',
          synonyms: null,
        },
        fdaDrugs: [],
        flags: [],
        associations: [],
      },
    ],
    {
      statusCode: 200,
      fetchResponse: false,
    },
  );
  const genesMock = await browser.mock('**/api/genes/search*');
  genesMock.respond([{ hugoSymbol: 'BRAF' }, { hugoSymbol: 'ROS1' }, { hugoSymbol: 'TP53' }], {
    statusCode: 200,
    fetchResponse: false,
  });
  const annotateAlterationsMock = await browser.mock('**/api/annotate-alterations');
  annotateAlterationsMock.respond(
    [
      {
        entity: {
          id: null,
          type: 'PROTEIN_CHANGE',
          name: 'V600E',
          alteration: 'V600E',
          proteinChange: 'V600E',
          start: 600,
          end: 600,
          refResidues: 'V',
          variantResidues: 'E',
          flags: [],
          genes: [
            {
              id: 41135,
              entrezGeneId: 673,
              hugoSymbol: 'BRAF',
              hgncId: '1097',
            },
          ],
          transcripts: [],
          consequence: {
            id: 16,
            term: 'MISSENSE_VARIANT',
            name: 'Missense Variant',
            isGenerallyTruncating: false,
            description:
              'A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved',
          },
          associations: [],
        },
        message: '',
        type: 'OK',
        queryId: 'V600E',
        annotation: {
          hotspot: {
            associatedHotspots: [
              {
                type: 'HOTSPOT_V1',
                alteration: 'V600',
              },
              {
                type: 'THREE_D',
                alteration: 'V600',
              },
              {
                type: 'HOTSPOT_V1',
                alteration: 'V600',
              },
              {
                type: 'THREE_D',
                alteration: 'V600',
              },
            ],
            hotspot: true,
          },
          exons: [
            {
              range: {
                start: 581,
                end: 620,
              },
              exon: 15,
            },
          ],
        },
        warning: false,
        ok: true,
        error: false,
      },
    ],
    {
      statusCode: 200,
      fetchResponse: false,
    },
  );

  const pubMedArticleMock = await browser.mock('**/api/articles/pubmed/*');
  pubMedArticleMock.respond(
    {
      id: 451,
      type: 'PUBMED',
      pmid: PUB_MED_PMID,
      title: PUB_MED_ARTICLE_TITLE,
      content:
        'Since their discovery over 20 years ago, the RAF proteins have been intensely studied. For most of that time, the focus of the field has been the C-RAF isoform and its role as an effector of the RAS proteins. However, a report that implicates B-RAF in human cancer has highlighted the importance of all members of this protein kinase family and recent studies have uncovered intriguing new data relating to their complex regulation and biological functions.',
      link: null,
      authors: 'Wellbrock et al.',
      date: '2004-12-15T00:00:00Z',
      additionalInfo: {
        abstractTexts: [
          {
            label: null,
            nlmCategory: null,
            value:
              'Since their discovery over 20 years ago, the RAF proteins have been intensely studied. For most of that time, the focus of the field has been the C-RAF isoform and its role as an effector of the RAS proteins. However, a report that implicates B-RAF in human cancer has highlighted the importance of all members of this protein kinase family and recent studies have uncovered intriguing new data relating to their complex regulation and biological functions.',
          },
        ],
        journal: {
          issn: '1471-0072',
          volume: '5',
          issue: '11',
          pages: '875-85',
          title: 'Nature reviews. Molecular cell biology',
          isoAbbreviation: 'Nat Rev Mol Cell Biol',
        },
        completedDate: '2004-12-15T00:00:00Z',
        revisedDate: '2022-04-08T00:00:00Z',
        dataBanks: [],
      },
      flags: [],
      synonyms: [
        {
          id: 434469,
          type: 'ARTICLE',
          source: 'pubmed',
          code: null,
          name: PUB_MED_PMID,
          note: null,
        },
        {
          id: 434470,
          type: 'ARTICLE',
          source: 'doi',
          code: null,
          name: '10.1038/nrm1498',
          note: null,
        },
        {
          id: 434471,
          type: 'ARTICLE',
          source: 'pii',
          code: null,
          name: 'nrm1498',
          note: null,
        },
      ],
    },
    {
      statusCode: 200,
      fetchResponse: false,
    },
  );
}
