import "@testing-library/jest-dom/vitest";

import {
  cleanup,
} from "@testing-library/react";

import {
  afterEach,
  vi,
} from "vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(function () {
  cleanup();

  localStorage.clear();
  sessionStorage.clear();

  document.documentElement.removeAttribute("data-theme");

  vi.clearAllMocks();
  vi.useRealTimers();
});

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation(function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  writable: true,
  value: vi.fn(),
});

class ResizeObserverMock {
  observe() { }

  unobserve() { }

  disconnect() { }
}

class IntersectionObserverMock {
  observe() { }

  unobserve() { }

  disconnect() { }
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: IntersectionObserverMock,
});
