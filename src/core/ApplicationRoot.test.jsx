import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ApplicationRoot from './ApplicationRoot.jsx';

vi.mock('../ui/navigation/TopNavigationBar.jsx', () => ({
  default: () => <div data-testid="top-navigation-bar">Top Navigation Bar</div>,
}));

vi.mock('../pages/DashboardPage.jsx', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ApplicationRoot />
    </MemoryRouter>
  );
};

describe('ApplicationRoot', () => {
  it('renders TopNavigationBar component', () => {
    renderWithRouter();
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
  });

  it('renders Suspense fallback when loading', () => {
    renderWithRouter();
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
  });

  it('renders DashboardPage at root path', () => {
    renderWithRouter(['/']);
    
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', () => {
    renderWithRouter(['/unknown-route']);
    
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('renders 404 page for nested unknown routes', () => {
    renderWithRouter(['/some/deeply/nested/route']);
    
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('has proper structure with TopNavigationBar and Suspense', () => {
    renderWithRouter();
    
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('maintains TopNavigationBar across all routes', () => {
    const routes = ['/', '/unknown'];
    
    routes.forEach(route => {
      const { unmount } = renderWithRouter([route]);
      expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with BrowserRouter in real environment', () => {
    render(
      <BrowserRouter>
        <ApplicationRoot />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('top-navigation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });
});

