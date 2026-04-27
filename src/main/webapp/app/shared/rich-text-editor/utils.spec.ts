import { isRichTextDoc } from './richTextSchema';
import { isSafeHttpUrl, normalizeHttpUrl, plainTextToTipTapDoc, tipTapJsonToPlainText } from './utils';

describe('Rich text editor utils', () => {
  describe('plainTextToTipTapDoc', () => {
    it('creates an editable paragraph for empty text', () => {
      expect(plainTextToTipTapDoc('')).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      });
    });

    it('keeps plain text as text nodes instead of HTML', () => {
      expect(plainTextToTipTapDoc('<b>EGFR</b>')).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '<b>EGFR</b>' }] }],
      });
    });

    it('preserves line boundaries as paragraphs', () => {
      expect(plainTextToTipTapDoc('line 1\nline 2')).toEqual({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'line 1' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'line 2' }] },
        ],
      });
    });
  });

  describe('tipTapJsonToPlainText', () => {
    it('serializes paragraphs with line breaks', () => {
      expect(
        tipTapJsonToPlainText({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'line 1' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'line 2' }] },
          ],
        }),
      ).toEqual('line 1\nline 2');
    });

    it('serializes PMID group nodes to the Firebase text form', () => {
      expect(
        tipTapJsonToPlainText({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'See ' },
                { type: 'pmidGroup', attrs: { pmids: ['1', '2'] } },
              ],
            },
          ],
        }),
      ).toEqual('See (PMID: 1, 2)');
    });

    it('serializes typed abstract and NCT reference nodes', () => {
      expect(
        tipTapJsonToPlainText({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'abstractReference', attrs: { title: 'ASCO abstract', href: 'https://example.com/abstract' } },
                { type: 'text', text: ' ' },
                { type: 'nctReference', attrs: { nctId: '01234567' } },
              ],
            },
          ],
        }),
      ).toEqual('(Abstract: ASCO abstract https://example.com/abstract) (NCT01234567)');
    });
  });

  describe('URL helpers', () => {
    it('normalizes URLs without a protocol', () => {
      expect(normalizeHttpUrl('example.com')).toEqual('https://example.com');
    });

    it('only allows http URLs', () => {
      expect(isSafeHttpUrl('https://example.com')).toEqual(true);
      expect(isSafeHttpUrl('javascript:alert(1)')).toEqual(false);
    });
  });

  describe('rich text JSON validation', () => {
    it('accepts known editor node types', () => {
      expect(
        isRichTextDoc({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'See ' },
                { type: 'pmidGroup', attrs: { pmids: ['1'] } },
              ],
            },
          ],
        }),
      ).toEqual(true);
    });

    it('rejects unknown node types', () => {
      expect(
        isRichTextDoc({
          type: 'doc',
          content: [{ type: 'totallyMadeUpNode' }],
        }),
      ).toEqual(false);
    });
  });
});
