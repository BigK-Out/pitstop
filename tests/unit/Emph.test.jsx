import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Emph from "../../src/components/Emph";

describe("Emph", () => {
  it("renders text and emphasised segments in order", () => {
    const { container } = render(
      <p>
        <Emph parts={[{ text: "We took the " }, { em: "pit" }, { text: " out." }]} />
      </p>,
    );
    expect(container.textContent).toBe("We took the pit out.");
    expect(container.querySelector("em").textContent).toBe("pit");
  });
});
