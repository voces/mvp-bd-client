import { Component } from "../../core/Component";
import type { Mutable } from "../../engine/types";
import type { Player } from "../players/Player";

export class ForPlayer extends Component<[player: Player]> {
	readonly player!: Player;

	initialize(player: Player): void {
		const mutable: Mutable<ForPlayer> = this;
		mutable.player = player;
	}
}
