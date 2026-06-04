import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PmidToolbarAddon } from './ReferenceToolbarAddon';
import { useRichTextEditorContext } from '../RichTextEditor';

jest.mock('../RichTextEditor', () => ({
  useRichTextEditorContext: jest.fn(),
}));

describe('ReferenceToolbarAddon', () => {
  it('restores the saved editor selection before inserting a PMID group', () => {
    const chain = {
      focus: jest.fn(),
      setTextSelection: jest.fn(),
      insertContent: jest.fn(),
      run: jest.fn(),
    };
    chain.focus.mockReturnValue(chain);
    chain.setTextSelection.mockReturnValue(chain);
    chain.insertContent.mockReturnValue(chain);
    chain.run.mockReturnValue(true);

    const setActiveToolbarPopover = jest.fn();
    const getSavedEditorSelection = jest.fn(() => ({ from: 4, to: 9 }));
    const editor = { chain: jest.fn(() => chain) };

    (useRichTextEditorContext as jest.Mock).mockReturnValue({
      activeToolbarPopover: 'pmid',
      setActiveToolbarPopover,
      editor,
      disabled: false,
      editorWrapperRef: { current: null },
      saveEditorSelection: jest.fn(),
      getSavedEditorSelection,
    });

    render(<PmidToolbarAddon />);

    fireEvent.change(screen.getByPlaceholderText('PubMed ID'), { target: { value: '12345' } });
    fireEvent.keyDown(screen.getByPlaceholderText('PubMed ID'), { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(editor.chain).toHaveBeenCalled();
    expect(getSavedEditorSelection).toHaveBeenCalled();
    expect(chain.focus).toHaveBeenCalled();
    expect(chain.setTextSelection).toHaveBeenCalledWith(4);
    expect(chain.insertContent).toHaveBeenCalledWith({ type: 'pmidGroup', attrs: { pmids: ['12345'] } });
    expect(chain.run).toHaveBeenCalled();
    expect(setActiveToolbarPopover).toHaveBeenCalledWith(null);
  });
});
