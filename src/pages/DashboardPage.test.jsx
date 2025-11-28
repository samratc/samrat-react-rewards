import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import DashboardPage from "./DashboardPage.jsx";

vi.mock("../modules/rewards/components/PeriodSummaryTable.jsx", () => ({
  default: () => <div data-testid="period-summary-table" />,
}));

describe("DashboardPage", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-09-05T00:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders PeriodSummaryTable", () => {
    render(<DashboardPage />);

    expect(screen.getByTestId("period-summary-table")).toBeInTheDocument();
  });
});

