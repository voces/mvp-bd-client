import { ImmediateActionProps } from "./types";

export const cancel = {
	name: "Cancel",
	hotkey: "Escape" as const,
	type: "custom" as const,
	localHandler: ({ player }: ImmediateActionProps): void => {
		player.game.obstructionPlacement?.stop();
	},
};
