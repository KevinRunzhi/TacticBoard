import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PitchCanvas } from "@/components/tactics/PitchCanvas";
import type { StepFrame } from "@/types/tactics";

describe("player avatar render", () => {
  it("renders the imported avatar inside card-style players", () => {
    const step: StepFrame = {
      id: "step-1",
      label: "第 1 步",
      description: "",
      players: [
        {
          id: "player-1",
          number: 9,
          name: "前锋",
          position: "ST",
          team: "home",
          avatarLocalUri: "data:image/png;base64,ZmFrZS1hdmF0YXI=",
          x: 50,
          y: 50,
        },
      ],
      lines: [],
      ball: {
        id: "ball-1",
        x: 50,
        y: 50,
      },
      texts: [],
      areas: [],
    };

    const { container } = render(
      <PitchCanvas
        projectName="测试项目"
        currentTool="select"
        players={step.players}
        lines={step.lines}
        ball={step.ball}
        texts={step.texts}
        areas={step.areas ?? []}
        allSteps={[step]}
        currentStepIndex={0}
        matchMeta={{
          title: "",
          score: "",
          minute: "",
          phaseLabel: "",
        }}
        referenceImage={null}
        fieldView="full"
        fieldStyle="flat"
        playerStyle="card"
        selectedPlayerId={null}
        selectedLineId={null}
        selectedTextId={null}
        selectedAreaId={null}
        onSelectPlayer={() => {}}
        onSelectLine={() => {}}
        onSelectText={() => {}}
        onSelectArea={() => {}}
        onAddPlayer={() => {}}
        onAddText={() => {}}
        onAddLine={() => {}}
        onAddArea={() => {}}
        onMovePlayer={() => {}}
        onMoveBall={() => {}}
        onMoveArea={() => {}}
        onMoveText={() => {}}
      />,
    );

    const avatarImage = container.querySelector("image");
    expect(avatarImage).not.toBeNull();
    expect(avatarImage?.getAttribute("href")).toBe("data:image/png;base64,ZmFrZS1hdmF0YXI=");
  });
});
