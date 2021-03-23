import { UpgradeComponent } from "../components/UpgradeComponent";
import type { Obstruction } from "../entities/widgets/sprites/units/Obstruction";
import { currentGame } from "../gameContext";
import type { UpgradeEvent } from "../Network";
import { appendErrorMessage } from "../ui/chat";
import type { Action, ImmediateActionProps } from "./types";

export const makeUpgradeAction = ({
	name,
	hotkey,
	description,
	cost,
	obstruction,
}: {
	name: string;
	description?: string;
	hotkey: Action["hotkey"];
	cost?: { [key: string]: number };
	obstruction: typeof Obstruction;
}): Action => ({
	name,
	description,
	hotkey,
	cost,
	type: "custom" as const,
	localHandler: ({ player }: ImmediateActionProps): void => {
		const u = player.getPrimarySelectedUnit();
		if (!u || u.owner !== player) return;
		player.game.transmit({
			type: "upgrade",
			obstructions: [u.id],
			upgrade: obstruction.name,
		});
	},
	syncHandler: ({
		time,
		connection,
		obstructions: obstructionIds,
		upgrade,
	}: UpgradeEvent): void => {
		const game = currentGame();
		game.update({ time });

		const player = game.players.find((p) => p.id === connection); 
		if (!player) return;

		const obstructions = player.sprites.filter((s): s is Obstruction =>
			obstructionIds.includes(s.id),
		);

		let obstructionClass: typeof Obstruction | undefined;
		let hasUpgradedOne = false;

		for (const obstruction of obstructions) {
			if (!obstruction.isAlive) continue;

			let hasUpgrade = false;

			if (!obstructionClass) {
				const upgrades = obstruction
					.get(UpgradeComponent)
					.filter((v): v is UpgradeComponent => !!v);
				obstructionClass = upgrades.find(
					(u) => u.obstruction.name === upgrade,
				)?.obstruction;
				if (!obstructionClass) continue;
				hasUpgrade = true;
			}

			if (
				!hasUpgrade &&
				!obstruction
					.get(UpgradeComponent)
					.some((v) => v && v.obstruction.name === upgrade)
			)
				continue;

			const check = player.checkResources(obstructionClass.defaults.cost);
			if (check?.length) {
				if (!hasUpgradedOne)
					appendErrorMessage(`Not enough ${check.join(" ")}`);
				return;
			}

			hasUpgradedOne = true;

			const { x, y } = obstruction.position;
			obstruction.remove();

			new obstructionClass({ x, y, owner: player });
		}
	},
});
