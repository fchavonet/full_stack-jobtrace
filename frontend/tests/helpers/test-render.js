import {
  render,
} from "@testing-library/react";

import {
  MemoryRouter,
} from "react-router-dom";

import {
  ThemeProvider,
} from "../../src/contexts/ThemeContext";

import {
  ToastProvider,
} from "../../src/contexts/ToastContext";

function TestProviders({
  children,
  initialEntries,
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderWithProviders(
  element,
  options = {},
) {
  const {
    initialEntries = ["/"],
    ...renderOptions
  } = options;

  return render(
    element,
    {
      wrapper: function TestWrapper({ children }) {
        return (
          <TestProviders initialEntries={initialEntries}>
            {children}
          </TestProviders>
        );
      },
      ...renderOptions,
    },
  );
}

export {
  TestProviders,
  renderWithProviders,
};
