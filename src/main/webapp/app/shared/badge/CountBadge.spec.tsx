import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CountBadge from './CountBadge';

describe('CountBadge tests', () => {
  it('hides number when hidesWhenOne is true', () => {
    render(<CountBadge base="Test" count={1} hideWhenOne />);
    expect(screen.queryByText('1')).toBeNull();
  });
});
