import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PeriodBreakdownCell from './PeriodBreakdownCell.jsx';

describe('PeriodBreakdownCell', () => {
  it('renders table headers correctly', () => {
    const mockBreakdown = {
      "2025-01": { points: 100, amountSpent: 50.25 },
      "2025-02": { points: 200, amountSpent: 75.50 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders period data correctly', () => {
    const mockBreakdown = {
      "2025-01": { points: 100, amountSpent: 50.25 },
      "2025-02": { points: 200, amountSpent: 75.50 },
      "2025-03": { points: 150, amountSpent: 60.00 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('2025-01')).toBeInTheDocument();
    expect(screen.getByText('2025-02')).toBeInTheDocument();
    expect(screen.getByText('2025-03')).toBeInTheDocument();

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    expect(screen.getByText('$50.25')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
    expect(screen.getByText('$60.00')).toBeInTheDocument();
  });

  it('formats currency amounts to 2 decimal places', () => {
    const mockBreakdown = {
      "2025-01": { points: 100, amountSpent: 50 },
      "2025-02": { points: 200, amountSpent: 75.5 },
      "2025-03": { points: 150, amountSpent: 60.123 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
    expect(screen.getByText('$60.12')).toBeInTheDocument();
  });

  it('displays "No data" when breakdown is empty', () => {
    render(<PeriodBreakdownCell breakdown={{}} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('displays "No data" when breakdown is null', () => {
    render(<PeriodBreakdownCell breakdown={null} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('displays "No data" when breakdown is undefined', () => {
    render(<PeriodBreakdownCell breakdown={undefined} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders table structure correctly', () => {
    const mockBreakdown = {
      "2025-01": { points: 100, amountSpent: 50.25 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Points' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
  });

  it('handles single period data correctly', () => {
    const mockBreakdown = {
      "2025-12": { points: 500, amountSpent: 125.75 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('2025-12')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('$125.75')).toBeInTheDocument();
  });

  it('handles multiple periods in order they appear in object', () => {
    const mockBreakdown = {
      "2025-03": { points: 300, amountSpent: 90.00 },
      "2025-01": { points: 100, amountSpent: 30.00 },
      "2025-02": { points: 200, amountSpent: 60.00 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);

    const cells = screen.getAllByRole('cell');
    const periodCells = cells.filter((cell, index) => index % 3 === 0);
    expect(periodCells[0]).toHaveTextContent('2025-03');
    expect(periodCells[1]).toHaveTextContent('2025-01');
    expect(periodCells[2]).toHaveTextContent('2025-02');
  });

  it('handles zero values correctly', () => {
    const mockBreakdown = {
      "2025-01": { points: 0, amountSpent: 0 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const mockBreakdown = {
      "2025-01": { points: 99999, amountSpent: 12345.67 }
    };

    render(<PeriodBreakdownCell breakdown={mockBreakdown} />);

    expect(screen.getByText('99999')).toBeInTheDocument();
    expect(screen.getByText('$12345.67')).toBeInTheDocument();
  });
});
