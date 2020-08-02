import { Sprite } from "../entities/sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";
import { ObstructionSubclass } from "../entities/sprites/obstructions/index";
import { Blueprint } from "../entities/sprites/obstructions/Blueprint";
import { Point } from "../pathing/PathingMap";

export class BuildTarget extends Component {
	obstructionClass: ObstructionSubclass;
	target: Point;
	blueprint?: Blueprint;

	constructor(
		entity: Sprite,
		obstructionClass: ObstructionSubclass,
		target: Point,
	) {
		super(entity);
		this.obstructionClass = obstructionClass;

		this.target = target;

		this.blueprint =
			entity.owner === entity.game.localPlayer
				? new Blueprint({
						...target,
						game: entity.game,
						radius: obstructionClass.defaults.radius,
				  })
				: undefined;
	}

	dispose(): void {
		this.blueprint?.kill({ removeImmediately: true });
	}
}

export const BuildTargetManager = new ComponentManager<BuildTarget>(
	BuildTarget,
);
