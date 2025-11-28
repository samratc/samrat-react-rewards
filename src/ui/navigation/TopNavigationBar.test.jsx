import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import TopNavigationBar from "./TopNavigationBar.jsx";

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("TopNavigationBar", () => {
  it("renders Home navigation link", () => {
    renderWithRouter(<TopNavigationBar />);

    const homeLinks = screen.getAllByRole("link", { name: /home/i });
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0]).toBeInTheDocument();
  });

  it("toggles the mobile menu with the hamburger", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TopNavigationBar />);

    const hamburger = screen.getByTestId("hamburger-menu");
    expect(hamburger).toBeInTheDocument();

    const mobileMenu = screen.getByTestId("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();

    expect(mobileMenu.className.includes("translate-x-full")).toBe(true);

    await user.click(hamburger);
    expect(mobileMenu.className.includes("translate-x-0")).toBe(true);

    await user.click(hamburger);
    expect(mobileMenu.className.includes("translate-x-full")).toBe(true);
  });

  it("closes the mobile menu when a menu link is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TopNavigationBar />);

    const hamburger = screen.getByTestId("hamburger-menu");
    const mobileMenu = screen.getByTestId("mobile-menu");

    await user.click(hamburger);
    expect(mobileMenu.className.includes("translate-x-0")).toBe(true);

    const homeLinks = screen.getAllByRole("link", { name: /home/i });
    const mobileHomeLink = homeLinks[homeLinks.length - 1];
    await user.click(mobileHomeLink);

    expect(mobileMenu.className.includes("translate-x-full")).toBe(true);
  });
});

