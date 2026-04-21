import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileToolbar } from "@/components/tactics/MobileToolbar";

describe("mobile toolbar touch", () => {
  it("opens the player tool tray and selects the player tool on touch devices", async () => {
    const onToolChange = vi.fn();

    render(
      <MobileToolbar
        currentTool="select"
        fieldFormat="11v11"
        playerPlacementTeam="home"
        onToolChange={onToolChange}
        onPlayerPlacementTeamChange={vi.fn()}
        onOpenSteps={vi.fn()}
        onOpenProperties={vi.fn()}
        onOpenFormations={vi.fn()}
      />,
    );

    fireEvent.touchEnd(screen.getByRole("button", { name: "对象" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "球员" })).toBeInTheDocument();
    });

    fireEvent.touchEnd(screen.getByRole("button", { name: "球员" }));

    expect(onToolChange).toHaveBeenCalledWith("player");
  });
});
