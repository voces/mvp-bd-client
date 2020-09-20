// import { EntityID } from "../../core/Entity";
// import { currentGame } from "../gameContext";
// import { isSprite, isUnit } from "../typeguards";
// import { TargetOrPointActionProps } from "./types";

// export const cancelAction = {
// 	name: "Attack",
// 	hotkey: "a" as const,
// 	type: "targetOrPoint" as const,
// 	localHandler: ({
// 		player,
// 		target,
// 		point: { x, y },
// 	}: TargetOrPointActionProps): void => {
// 		const game = currentGame();

// 		const ownedSprites = game.selectionSystem.selection.filter(
// 			(s) => isSprite(s) && s.owner === game.localPlayer,
// 		);

// 		const units = ownedSprites.filter(isUnit);
// 		const toMove: EntityID[] = [];
// 		const toAttack: EntityID[] = [];

// 		units.forEach((unit) => {
// 			if (unit instanceof Crosser) toMove.push(unit.id);
// 			else if (unit instanceof Defender)
// 				if (
// 					(target && target instanceof Crosser) ||
// 					target instanceof Obstruction
// 				)
// 					toAttack.push(unit.id);
// 				else toMove.push(unit.id);
// 		});

// 		if (toMove.length)
// 			game.transmit({ type: "move", sprites: toMove, x, y });

// 		if (toAttack.length)
// 			game.transmit({
// 				type: "attack",
// 				attackers: toAttack,
// 				x,
// 				y,
// 				target: target?.id,
// 			});

// 		// Filter out obstructions when ordering to move
// 		if (
// 			toMove.length > 0 &&
// 			ownedSprites.some((u) => u instanceof Obstruction)
// 		)
// 			game.selectionSystem.setSelection(units);
// 	},
// };
