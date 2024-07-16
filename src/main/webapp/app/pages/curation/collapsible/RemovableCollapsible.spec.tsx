import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RemovableCollapsible } from './RemovableCollapsible';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { CollapsibleDataTestIdType, getCollapsibleDataTestId } from 'app/shared/util/test-id-utils';

const DEFAULT_TITLE = 'Default Title';

function buildCollapsible(review: Review) {
  return (
    <RemovableCollapsible
      idPrefix={DEFAULT_TITLE}
      title={DEFAULT_TITLE}
      review={review}
      info={<div>Info section</div>}
      action={<div>Action section</div>}
    >
      <div>Default content</div>
    </RemovableCollapsible>
  );
}

describe('Removable Collapsible', () => {
  describe('deleted entity', () => {
    let collapsible;
    beforeEach(() => {
      const review = new Review('Test User');
      review.removed = true;
      collapsible = buildCollapsible(review);
      render(collapsible);
    });

    it('should hide actions when pending deletion', () => {
      expect(screen.queryByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.ACTION, DEFAULT_TITLE))).toBeNull();
    });

    it('should have info section', () => {
      expect(screen.getByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.INFO, DEFAULT_TITLE))).toBeInTheDocument();
    });
  });

  describe('demoted mutation', () => {
    let collapsible;
    beforeEach(() => {
      const review = new Review('Test User');
      review.demotedToVus = true;
      collapsible = buildCollapsible(review);
      render(collapsible);
    });

    it('should hide actions when pending deletion', () => {
      expect(screen.queryByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.ACTION, DEFAULT_TITLE))).toBeNull();
    });

    it('should have info section', () => {
      expect(screen.getByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.INFO, DEFAULT_TITLE))).toBeInTheDocument();
    });
  });

  describe('not deleted entity', () => {
    let collapsible;
    beforeEach(() => {
      const review = new Review('Test User');
      collapsible = buildCollapsible(review);
      render(collapsible);
    });

    it('should have action section', () => {
      expect(screen.getByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.ACTION, DEFAULT_TITLE))).toBeInTheDocument();
    });

    it('should have info section', () => {
      expect(screen.getByTestId(getCollapsibleDataTestId(CollapsibleDataTestIdType.INFO, DEFAULT_TITLE))).toBeInTheDocument();
    });
  });
});
