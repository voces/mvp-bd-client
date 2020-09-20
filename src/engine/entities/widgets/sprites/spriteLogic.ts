import { EntityID } from "../../../../core/Entity";
import { DamageComponent } from "../../../components/DamageComponent";
import { Unit } from "./Unit";
import { Obstruction } from "./units/Obstruction";
import { Game } from "../../../Game";
import { currentGame } from "../../../gameContext";
import { MouseEvents } from "../../../systems/Mouse";
import { isSprite, isUnit } from "../../../typeguards";

const rightClick: MouseEvents["mouseDown"] = ({ mouse }) => {
	const { x, y } = mouse.ground;
	const game = currentGame();

	const ownedSprites = game.selectionSystem.selection.filter(
		(s) => isSprite(s) && s.owner === game.localPlayer,
	);

	const units = ownedSprites.filter(isUnit);
	const toMove: EntityID[] = [];
	const toAttack: EntityID[] = [];
	const target = mouse.entity;

	units.forEach((unit) => {
		if (
			unit.has(DamageComponent) &&
			target &&
			isUnit(target) &&
			target.owner.isEnemy(unit.owner)
		)
			return toAttack.push(unit.id);

		toMove.push(unit.id);
	});

	if (toMove.length) game.transmit({ type: "move", sprites: toMove, x, y });

	if (toAttack.length)
		game.transmit({
			type: "attack",
			attackers: toAttack,
			x,
			y,
			target: target?.id,
		});

	// Filter out obstructions when ordering to move
	if (toMove.length > 0 && ownedSprites.some((u) => u instanceof Obstruction))
		game.selectionSystem.setSelection(units);
};

const leftClick: MouseEvents["mouseDown"] = ({ mouse }) => {
	const game = currentGame();

	const obstructionPlacement = game.obstructionPlacement;
	if (!obstructionPlacement) return;
	if (!obstructionPlacement.valid) return;
	const obstruction = obstructionPlacement.active!;

	const x = obstructionPlacement.snap(mouse.ground.x);
	const y = obstructionPlacement.snap(mouse.ground.y);

	obstructionPlacement.stop();

	const builder = game.selectionSystem.selection.find(
		(s) =>
			isUnit(s) &&
			s.owner === game.localPlayer &&
			s.builds.includes(obstruction),
	);

	if (!builder) return;

	game.transmit({
		type: "build",
		builder: builder.id,
		x,
		y,
		obstruction: obstruction.name,
	});
};

export const initSpriteLogicListeners = (game: Game): void => {
	game.mouse.addEventListener("mouseDown", (e) => {
		if (e.button === 2 || e.ctrlDown) return rightClick(e);
		if (e.button === 0) leftClick(e);
	});

	game.ui.addEventListener("keyDown", (e) => {
		const hotkey = game.actions.activeActions.find(
			(b) => b.hotkey === e.key,
		);
		if (!hotkey) return;

		// if (typeof hotkey === "function") return hotkey();
		if (hotkey.type === "custom")
			return hotkey.localHandler({ player: game.localPlayer });

		if (hotkey.type === "build") {
			const ownBuilders = game.selectionSystem.selection.filter(
				(u) =>
					isUnit(u) &&
					u.owner === game.localPlayer &&
					u.builds.includes(hotkey.obstruction),
			);

			if (ownBuilders.length) {
				const obstructionPlacement = game.obstructionPlacement;
				if (!obstructionPlacement) return;
				obstructionPlacement.start(hotkey.obstruction);
			}
		}
	});

	game.addNetworkListener("build", (e) => {
		const { x, y, time, connection, obstruction, builder } = e;

		game.update({ time });

		const player = game.players.find((p) => p.id === connection);
		if (!player) return;

		const unit = player.sprites.find(
			(s): s is Unit =>
				s.id === builder &&
				isUnit(s) &&
				s.builds.some((b) => b.name === obstruction),
		);
		if (!unit) return;

		const obstructionClass = unit.builds.find(
			(o) => o.name === obstruction,
		);
		if (!obstructionClass) return;

		unit.buildAt({ x, y }, obstructionClass);
	});

	game.addNetworkListener("move", ({ time, connection, sprites, x, y }) => {
		game.update({ time });

		const player = game.players.find((p) => p.id === connection);
		if (!player) return;

		player.sprites
			.filter((s) => sprites.includes(s.id))
			.filter(isUnit)
			.forEach((s) => s.walkTo({ x, y }));
	});

	game.addNetworkListener(
		"attack",
		({ time, connection, attackers, target: targetId }) => {
			game.update({ time });

			const player = game.players.find((p) => p.id === connection);
			if (!player) return;

			const target = game.entities.find((s) => s.id === targetId);
			if (!target || !isSprite(target)) return;

			player.sprites
				.filter((s) => attackers.includes(s.id))
				.filter(isUnit)
				.forEach((s) => s.attack(target));
		},
	);
};
