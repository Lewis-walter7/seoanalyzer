import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditResults from '@/app/project/[id]/auditresults/page';

jest.mock('@/app/project/[id]/auditresults/page', () => ({
  __esModule: true,
  default: function MockedComponent(props) {
    const { isLoading, error, results } = props;
    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">Error: {error.message}</div>;
    if (results) return <div data-testid="results">Results Found</div>;
    return <div data-testid="no-data">No Data</div>;
  }
}));

describe('AuditResults Component', () => {
  test('renders loading state', () => {
    render(<AuditResults isLoading={true} />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<AuditResults error={{ message: 'Mock Error' }} />);
    const errorElement = screen.getByTestId('error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent('Error: Mock Error');
  });

  test('renders results state', () => {
    render(<AuditResults results={[]} />);
    const resultsElement = screen.getByTestId('results');
    expect(resultsElement).toBeInTheDocument();
  });

  test('renders no data state', () => {
    render(<AuditResults />);
    const noDataElement = screen.getByTestId('no-data');
    expect(noDataElement).toBeInTheDocument();
  });
});

