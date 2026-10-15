import { render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollProgress } from "../../src/pitstop/useScrollProgress";

function Probe({ enabled, out }) {
  const ref = useRef(null);
  const progress = useScrollProgress(ref, enabled);
  if (out) out.current = progress;
  return <section ref={ref} data-testid="hero" />;
}

const mockRect = (top, height) =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top, height });

afterEach(() => vi.unstubAllGlobals());

describe("useScrollProgress", () => {
  it("measures on mount (deep link mid-page)", () => {
    vi.stubGlobal("innerHeight", 1000);
    mockRect(-2000, 3000);
    const out = { current: null };
    render(<Probe enabled out={out} />);
    const hero = screen.getByTestId("hero");
    expect(out.current.current).toBe(1);
    expect(hero).toHaveAttribute("data-revealed");
    expect(hero.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(hero.style.getPropertyValue("--intro-opacity")).toBe("0");
    expect(hero.style.getPropertyValue("--intro-shift")).toBe("40px");
  });

  it("updates on scroll and resize", async () => {
    vi.stubGlobal("innerHeight", 1000);
    const rect = mockRect(0, 3000);
    render(<Probe enabled />);
    const hero = screen.getByTestId("hero");
    expect(hero.style.getPropertyValue("--intro-opacity")).toBe("1");
    expect(hero).not.toHaveAttribute("data-revealed");

    rect.mockReturnValue({ top: -1500, height: 3000 }); // p = 0.75
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(hero).toHaveAttribute("data-revealed"));

    rect.mockReturnValue({ top: -200, height: 3000 }); // p = 0.1
    window.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(hero).not.toHaveAttribute("data-revealed"));
  });

  it("pins to the final frame when disabled", () => {
    mockRect(0, 3000);
    const out = { current: null };
    render(<Probe enabled={false} out={out} />);
    const hero = screen.getByTestId("hero");
    expect(out.current.current).toBe(1);
    expect(hero).toHaveAttribute("data-revealed");
    expect(hero.style.getPropertyValue("--reveal-opacity")).toBe("1");
  });
});
