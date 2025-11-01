import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFeedbackModal } from '../onboarding/OnboardingFeedbackModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Feedback System Tests', () => {
  it('renders feedback modal', () => {
    render(
      <OnboardingFeedbackModal 
        isOpen={true}
        onClose={vi.fn()}
        step="welcome"
      />,
      { wrapper }
    );

    expect(screen.getByText(/feedback/i)).toBeInTheDocument();
  });

  it('submits feedback successfully', async () => {
    const onClose = vi.fn();
    render(
      <OnboardingFeedbackModal 
        isOpen={true}
        onClose={onClose}
        step="welcome"
      />,
      { wrapper }
    );

    const textarea = screen.getByPlaceholderText(/feedback/i);
    fireEvent.change(textarea, { target: { value: 'Great experience!' } });

    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('validates feedback input', async () => {
    render(
      <OnboardingFeedbackModal 
        isOpen={true}
        onClose={vi.fn()}
        step="welcome"
      />,
      { wrapper }
    );

    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('allows rating selection', () => {
    render(
      <OnboardingFeedbackModal 
        isOpen={true}
        onClose={vi.fn()}
        step="welcome"
      />,
      { wrapper }
    );

    const rating5 = screen.getByLabelText(/5 stars/i);
    fireEvent.click(rating5);
    expect(rating5).toBeChecked();
  });
});
