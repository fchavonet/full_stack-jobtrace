import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  ToastProvider,
} from "../src/contexts/ToastContext";

import {
  useToast,
} from "../src/hooks/useToast";

function ToastConsumer() {
  const {
    showToast,
  } = useToast();

  return (
    <div>
      <button
        type="button"
        onClick={function () {
          showToast(
            "Information de test.",
          );
        }}
      >
        Afficher une information
      </button>

      <button
        type="button"
        onClick={function () {
          showToast(
            "Opération réussie.",
            "success",
          );
        }}
      >
        Afficher un succès
      </button>

      <button
        type="button"
        onClick={function () {
          showToast(
            "Une erreur est survenue.",
            "error",
          );
        }}
      >
        Afficher une erreur
      </button>

      <button
        type="button"
        onClick={function () {
          showToast(
            "Attention.",
            "warning",
          );
        }}
      >
        Afficher un avertissement
      </button>
    </div>
  );
}

function renderToastProvider() {
  return render(
    <ToastProvider>
      <ToastConsumer />
    </ToastProvider>,
  );
}

afterEach(function () {
  vi.useRealTimers();
});

describe("Toast context", function () {
  test("ToastProvider - Should display information toast by default", async function () {
    const user = userEvent.setup();

    renderToastProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Afficher une information",
        },
      ),
    );

    const toast = screen.getByText(
      "Information de test.",
    ).closest(".alert");

    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass("alert-info");
    expect(toast).toHaveClass("text-info-content");
  });

  test("ToastProvider - Should display success toast", async function () {
    const user = userEvent.setup();

    renderToastProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Afficher un succès",
        },
      ),
    );

    const toast = screen.getByText(
      "Opération réussie.",
    ).closest(".alert");

    expect(toast).toHaveClass("alert-success");
    expect(toast).toHaveClass("text-success-content");
  });

  test("ToastProvider - Should display error toast", async function () {
    const user = userEvent.setup();

    renderToastProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Afficher une erreur",
        },
      ),
    );

    const toast = screen.getByText(
      "Une erreur est survenue.",
    ).closest(".alert");

    expect(toast).toHaveClass("alert-error");
    expect(toast).toHaveClass("text-error-content");
  });

  test("ToastProvider - Should display warning toast", async function () {
    const user = userEvent.setup();

    renderToastProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Afficher un avertissement",
        },
      ),
    );

    const toast = screen.getByText(
      "Attention.",
    ).closest(".alert");

    expect(toast).toHaveClass("alert-warning");
    expect(toast).toHaveClass("text-warning-content");
  });

  test("ToastProvider - Should remove toast after three seconds", function () {
    vi.useFakeTimers();

    renderToastProvider();

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Afficher un succès",
        },
      ),
    );

    expect(
      screen.getByText("Opération réussie."),
    ).toBeInTheDocument();

    act(function () {
      vi.advanceTimersByTime(2999);
    });

    expect(
      screen.getByText("Opération réussie."),
    ).toBeInTheDocument();

    act(function () {
      vi.advanceTimersByTime(1);
    });

    expect(
      screen.queryByText("Opération réussie."),
    ).not.toBeInTheDocument();
  });

  test("useToast - Should throw outside ToastProvider", function () {
    function InvalidConsumer() {
      useToast();

      return null;
    }

    expect(function () {
      render(<InvalidConsumer />);
    }).toThrow(
      "useToast must be used inside ToastProvider.",
    );
  });
});
