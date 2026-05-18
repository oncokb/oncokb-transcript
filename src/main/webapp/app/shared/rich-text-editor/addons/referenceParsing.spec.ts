import { buildPastedRichTextContent, referencePasteHandler } from './referenceParsing';
import { normalizeNctId } from './ReferenceNodeExtensions';

describe('reference rich text parsing', () => {
  it('converts pasted PMIDs into PMID group nodes', () => {
    expect(buildPastedRichTextContent('Evidence (PMID: 123, 456).')).toEqual([
      { type: 'text', text: 'Evidence ' },
      { type: 'pmidGroup', attrs: { pmids: ['123', '456'] } },
      { type: 'text', text: '.' },
    ]);
  });

  it('converts bare URLs into genericLink nodes', () => {
    expect(buildPastedRichTextContent('See https://example.com')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'genericLink', attrs: { href: 'https://example.com', text: 'https://example.com' } },
    ]);
  });

  it('converts pasted abstracts into typed abstract reference nodes', () => {
    expect(buildPastedRichTextContent('(Abstract: ASCO abstract. https://example.com/abstract)')).toEqual([
      {
        type: 'abstractReference',
        attrs: {
          title: 'ASCO abstract.',
          href: 'https://example.com/abstract',
        },
      },
    ]);
  });

  it('preserves abstract casing inside ASCO abstract URLs', () => {
    expect(
      buildPastedRichTextContent('(Abstract: Ou et al. ASCO 2023, Abstract #3140. https://www.asco.org/abstracts-presentations/227039)'),
    ).toEqual([
      {
        type: 'abstractReference',
        attrs: {
          title: 'Ou et al. ASCO 2023, Abstract #3140.',
          href: 'https://www.asco.org/abstracts-presentations/227039',
        },
      },
    ]);
  });

  // The title "function" has the substring "nct". This test ensures that the presence of "function" in the title does not cause the parser to misinterpret.
  expect(
    buildPastedRichTextContent(
      '(Abstract: Loss-of-Function-of-The-Cell-Cycle-Regulator-Cdh1 https://ashpublications.org/blood/article/122/21/344/83783/Loss-of-Function-of-The-Cell-Cycle-Regulator-Cdh1)',
    ),
  ).toEqual([
    {
      type: 'abstractReference',
      attrs: {
        title: 'Loss-of-Function-of-The-Cell-Cycle-Regulator-Cdh1',
        href: 'https://ashpublications.org/blood/article/122/21/344/83783/Loss-of-Function-of-The-Cell-Cycle-Regulator-Cdh1',
      },
    },
  ]);

  it('converts pasted NCT references into typed NCT nodes', () => {
    expect(buildPastedRichTextContent('(NCT03088176)')).toEqual([
      {
        type: 'nctReference',
        attrs: {
          nctId: '03088176',
        },
      },
    ]);
  });

  it('normalizes NCT IDs from full ClinicalTrials links', () => {
    expect(normalizeNctId('https://clinicaltrials.gov/study/NCT03088176')).toEqual('03088176');
  });

  it('keeps pasted line breaks as separate paragraphs', () => {
    expect(buildPastedRichTextContent('A\nB')).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
    ]);
  });

  it('skips plain text with no refs or URLs', () => {
    const insertContent = jest.fn();
    const editor = {
      commands: { insertContent },
    } as any;

    expect(referencePasteHandler('Just plain text', editor)).toBe(false);
    expect(insertContent).not.toHaveBeenCalled();
  });
});
