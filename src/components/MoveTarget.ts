import { Point } from "../pathing/PathingMap.js";
import { Sprite } from "../sprites/Sprite.js";
import {
	PathTweener,
	tweenPoints,
	distanceBetweenPoints,
	shortenPath,
	calcAndTweenShortenedPath,
} from "../util/tweenPoints.js";
import { Component } from "../core/Component.js";
import { ComponentManager } from "../core/ComponentManager.js";

export class MoveTarget extends Component {
	target: Point | Sprite;
	path: PathTweener;
	distance: number;

	constructor({
		entity,
		target,
		distance = 0,
		path,
	}: {
		entity: Sprite;
		target: Point | Sprite;
		distance?: number;
		path?: PathTweener;
	}) {
		super(entity);
		this.target = target;
		this.distance = distance;

		if (!path) path = calcAndTweenShortenedPath(entity, target, distance);
		else if (
			distance > 0 &&
			Math.abs(
				distanceBetweenPoints(
					path.target,
					Sprite.isSprite(target) ? target.position : target,
				) - distance,
			) < 1e-7
		)
			path = tweenPoints(shortenPath(path.points, distance));

		this.path = path;
	}
}

export const MoveTargetManager = new ComponentManager<MoveTarget>(MoveTarget);
