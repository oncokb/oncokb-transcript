import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Collapsible, { CollapsibleProps } from './Collapsible';
import { DANGER } from 'app/config/colors';
import { DISABLED_COLLAPSIBLE_COLOR } from 'app/config/constants/constants';

function buildCollapsible(props?: Partial<CollapsibleProps>) {
  return (
    <Collapsible title={'Default Title'} {...props}>
      <div>Default content</div>
    </Collapsible>
  );
}

function assertToggleDisabled() {
  expect(screen.getByRole('button')).toBeDisabled();
  fireEvent.click(screen.getByTestId('collapsible-title-wrapper'));
  expect(screen.queryByText('Default content')).toBeNull();
}

describe('Collapsible tests', () => {
  it('toggling collapsible opens and closes it', () => {
    render(buildCollapsible());

    expect(screen.queryByText('Default content')).toBeNull();
    fireEvent.click(screen.getByTestId('collapsible-title-wrapper'));
    expect(screen.getByText('Default content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('collapsible-title-wrapper'));
    expect(screen.queryByText('Default content')).toBeNull();
  });

  it('toggling should have no effect when hideToggle is true', () => {
    render(buildCollapsible({ displayOptions: { hideToggle: true } }));
    assertToggleDisabled();
  });

  describe('collapsible that is disabled', () => {
    beforeEach(() => {
      render(
        buildCollapsible({
          displayOptions: { disableCollapsible: true },
          action: <div>Action section</div>,
          info: <div>Info section</div>,
        }),
      );
    });

    it('should have grey border', () => {
      expect(screen.getByTestId('collapsible-card')).toHaveStyle(`border-left-color: ${DISABLED_COLLAPSIBLE_COLOR}`);
    });

    it('toggle button should be disabled', () => {
      assertToggleDisabled();
    });

    it('should display info and action sections', () => {
      expect(screen.getByText('Action section')).toBeInTheDocument();
      expect(screen.getByText('Info section')).toBeInTheDocument();
    });
  });

  describe('collapsible that is pending deletion', () => {
    beforeEach(() => {
      render(buildCollapsible({ isPendingDelete: true, action: <div>Action section</div>, info: <div>Info section</div> }));
    });

    it('should have red left border', () => {
      expect(screen.getByTestId('collapsible-card')).toHaveStyle(`border-left-color: ${DANGER}`);
    });

    it('toggle button should be disabled', () => {
      assertToggleDisabled();
    });

    it('should display info and action sections', () => {
      expect(screen.getByText('Action section')).toBeInTheDocument();
      expect(screen.getByText('Info section')).toBeInTheDocument();
    });
  });
});
