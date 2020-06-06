import { MIRROR_SEPARATION } from "../constants.js";
import { Unit, UnitProps } from "./Unit.js";
import { game } from "../index.js";
import { Sprite } from "./Sprite.js";
import { Point } from "../pathing/PathingMap.js";

const getMirroringPosition = (pos: Point, entity: Sprite, layer?: number) => {
	if (!game.round)
		throw new Error("called getMirroringPosition outsied a round");

	const nearest = game.round.pathingMap.nearestSpiralPathing(
		pos.x,
		pos.y,
		entity,
	);

	if (game.round.pathingMap.layer(nearest.x, nearest.y) === layer)
		return nearest;

	return game.round.pathingMap.nearestSpiralPathing(
		nearest.x,
		nearest.y,
		entity,
		layer,
	);
};

type DefenderProps = UnitProps & {
	autoAttack?: boolean;
};

export class Defender extends Unit {
	static isDefender = (sprite: Defender | Sprite): sprite is Defender =>
		sprite instanceof Defender;

	static defaults = {
		...Unit.defaults,
		maxHealth: Number.MAX_VALUE,
		speed: 6.5625,
		weapon: {
			enabled: true,
			damage: 50,
			cooldown: 1.5,
			// todo: add backswing (time before damage) and recovery (time after damage where the unit can't do anything)
			last: 0,
			range: 0.5,
			projectile: "instant" as const,
		},
		autoAttack: true,
	};

	autoAttack: boolean;

	constructor({
		autoAttack = Defender.defaults.autoAttack,
		...props
	}: DefenderProps) {
		super({ ...Defender.clonedDefaults, ...props });
		this.autoAttack = autoAttack;
	}

	mirror(): void {
		if (this.mirrors) this.mirrors.forEach((u) => u.kill());

		const oldFacing = this.facing;
		const angle1 = this.facing + Math.PI / 2;
		const angle2 = this.facing - Math.PI / 2;
		let pos1 = {
			x: this.x + Math.cos(angle1) * MIRROR_SEPARATION,
			y: this.y + Math.sin(angle1) * MIRROR_SEPARATION,
		};
		let pos2 = {
			x: this.x + Math.cos(angle2) * MIRROR_SEPARATION,
			y: this.y + Math.sin(angle2) * MIRROR_SEPARATION,
		};

		if (game.random() < 0.5) {
			const temp = pos1;
			pos1 = pos2;
			pos2 = temp;
		}

		this.action = undefined;

		const layer = this.round.pathingMap.layer(this.x, this.y);

		this.round.pathingMap.withoutEntity(this, () =>
			this.setPosition(getMirroringPosition(pos1, this, layer)),
		);
		this.facing = oldFacing;

		const mirror = new Defender({
			x: this.x,
			y: this.y,
			owner: this.owner,
			isIllusion: true,
		});
		const mirrorPos = getMirroringPosition(pos2, mirror, layer);
		mirror.setPosition(mirrorPos);
		mirror.facing = oldFacing;
		this.round.pathingMap.addEntity(mirror);
		this.mirrors = [mirror];
	}
}