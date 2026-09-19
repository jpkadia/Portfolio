import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

test('renders portfolio without crashing', () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(container).toBeInTheDocument();
});

test('renders Orbit Lander game with proper Download Game button and download attribute', () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const downloadLink = container.querySelector('a[download="OrbitLanderSetup.exe"]');
  expect(downloadLink).toBeInTheDocument();
  expect(downloadLink.textContent).toContain('Download Game');
  expect(downloadLink.getAttribute('href')).toContain('OrbitLanderSetup.exe');
  expect(downloadLink.getAttribute('aria-label')).toBe('Download Orbit Lander by Parth Kadiya');
});

test('renders Techie Growera experience with Visit Techie Growera button', () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(container.textContent).toContain('Techie Growera');
  expect(container.textContent).toContain('Co-Founder & Lead Developer');
  expect(container.textContent).toContain('September 2026 to Present');

  const visitBtn = container.querySelector('a[href="https://techiegrowera.vercel.app/"]');
  expect(visitBtn).toBeInTheDocument();
  expect(visitBtn.textContent).toContain('Visit Techie Growera');
  expect(visitBtn.getAttribute('target')).toBe('_blank');
  expect(visitBtn.getAttribute('rel')).toContain('noopener');
  const startupBadge = container.querySelector('.timeline-badge.startup');
  expect(startupBadge).toBeInTheDocument();
  expect(startupBadge.textContent).toContain('Startup');
});

test('ErrorBoundary renders fallback UI when a child component throws an error', () => {
  const ProblemChild = () => {
    throw new Error('Simulated runtime failure');
  };

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const { getByRole, getByText } = render(
    <ErrorBoundary>
      <ProblemChild />
    </ErrorBoundary>
  );

  expect(getByRole('alert')).toBeInTheDocument();
  expect(getByText('Something went wrong')).toBeInTheDocument();
  expect(getByText('Reload Page')).toBeInTheDocument();

  consoleSpy.mockRestore();
});



