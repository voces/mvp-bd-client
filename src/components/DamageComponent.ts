import { Sprite } from "../entities/sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";
import { NonEmptyArray } from "../types";

export type Weapon = {
	damage: number;
	cooldown: number;
	range: number;
	projectile:
		| "instant"
		| (<T extends Sprite>(target: Sprite, attacker: T) => void);
	last: number;
	enabled: boolean;
	onDamage?: (target: Sprite, damage: number, attacker: Sprite) => void;
};

export class DamageComponent extends Component {
	weapons: NonEmptyArray<Weapon>;
	autoAttack: boolean;

	constructor(
		entity: Sprite,
		weapons: NonEmptyArray<Weapon>,
		autoAttack: boolean,
	) {
		super(entity);
		this.weapons = weapons;
		this.autoAttack = autoAttack;
	}
}

export const DamageComponentManager = new ComponentManager<DamageComponent>(
	DamageComponent,
);
