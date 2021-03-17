import type { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { MoveTarget } from "../../engine/components/MoveTarget";
import { HasHitCheckpoint } from "../components/HitCheckpoint";
import type { Runner } from "../entities/Runner";
import { currentMazingContest } from "../mazingContestContext";
import { terrain } from "../terrain";
import { isRunner } from "../typeguards";

export class RunnerTracker extends System<Runner> {
	readonly pure = true;
	static readonly components = [MoveTarget];

	test(entity: Entity): entity is Runner {
		return isRunner(entity);
	}

	modified(entity: Runner): void {
		if (!entity.idle || entity.has(HasHitCheckpoint)) {
			if (entity.idle) console.log("already hit checkpoint");
			else console.log("idle");
			return;
		}
		console.log("hit checkpoint");
		new HasHitCheckpoint(entity);

		const game = currentMazingContest();
		if (!game.settings.checkpoints) {
			console.log("not checkpoints");
			return;
		}

		entity.walkTo({
			x: terrain.width / 2,
			y: terrain.height / 2 + 10.5,
		});
	}

	get done(): boolean {
		return Array.from(this).every((r) => r.idle && r.has(HasHitCheckpoint));
	}
}
