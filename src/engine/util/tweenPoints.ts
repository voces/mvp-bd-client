import type { Sprite } from "../entities/widgets/Sprite";
import { currentGame } from "../gameContext";
import type { Point } from "../pathing/PathingMap";

export const distanceBetweenPoints = (
	{ x: x1, y: y1 }: Point,
	{ x: x2, y: y2 }: Point,
): number => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

export const pathDistance = (points: Point[]): number => {
	let sum = 0;
	for (let i = 0; i < points.length - 2; i++)
		sum += distanceBetweenPoints(points[i], points[i + 1]);

	return sum;
};

// const elems = [];
const elems: HTMLDivElement[] | false = false as HTMLDivElement[] | false;

type AnnotatedPoint = Point & {
	start: number;
	end: number;
	xDeltaToNext: number;
	yDeltaToNext: number;
	distance: number;
};

export type PathTweener = {
	(progress: number): { x: number; y: number };
	readonly remaining: number;
	step: (deltaProgress: number) => Point;
	distance: number;
	radialStepBack: (distance: number) => Point;
	target: Point;
	readonly points: Point[];
};

export const shortenPath = (points: Point[], amount: number): Point[] => {
	// Not shortening, return the original path
	if (amount <= 0) return points;

	// Path has a single note, return it
	if (points.length === 1) return points;

	let index = points.length - 2;
	const origin = points[index + 1];

	let distance = Math.sqrt(
		(origin.x - points[index].x) ** 2 + (origin.y - points[index].y) ** 2,
	);
	while (distance < amount && index >= 0) {
		index--;
		if (index < 0) break;
		distance = Math.sqrt(
			(origin.x - points[index].x) ** 2 +
				(origin.y - points[index].y) ** 2,
		);
	}

	// Stepping back past the first point, return it
	if (index < 0) return [points[0]];

	// Tween between the last two points
	// https://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
	// https://www.geogebra.org/geometry/dm7vez7p
	const u = {
		x: points[index].x - origin.x,
		y: points[index].y - origin.y,
	};
	const v = {
		x: points[index + 1].x - origin.x,
		y: points[index + 1].y - origin.y,
	};

	const a = (u.x - v.x) ** 2 + (u.y - v.y) ** 2;
	const b = 2 * (v.x * (u.x - v.x) + v.y * (u.y - v.y));
	const c = v.x ** 2 + v.y ** 2 - amount ** 2;
	const disc = b ** 2 - 4 * a * c;
	const progress = (-b + Math.sqrt(disc)) / (2 * a);

	const path = points.slice(0, index + 1);
	path.push({
		x:
			points[index + 1].x +
			(points[index].x - points[index + 1].x) * progress,
		y:
			points[index + 1].y +
			(points[index].y - points[index + 1].y) * progress,
	});

	return path;
};

export const tweenPoints = (points: Point[]): PathTweener => {
	// remove duplicates
	points = points.filter(
		(p, i) => points.findIndex((p2) => p2.x === p.x && p2.y === p.y) === i,
	);

	if (points.some((p) => isNaN(p.x) || isNaN(p.y)))
		console.error(new Error("received bad point"));

	if (typeof document !== "undefined")
		if (elems) {
			elems.forEach((elem) => document.body.removeChild(elem));
			elems.splice(0);
			points.forEach((p) => {
				const div = document.createElement("div");
				div.style.position = "absolute";
				div.style.top = p.y * 32 - 2 + "px";
				div.style.left = p.x * 32 - 2 + "px";
				div.style.zIndex = (10000).toString();
				div.style.width = "4px";
				div.style.height = "4px";
				div.style.background = "black";
				document.body.appendChild(div);
				elems.push(div);
			});
		}

	const annotatedPoints: AnnotatedPoint[] = points.map((p) => ({
		x: p.x,
		y: p.y,
		start: 0,
		end: 0,
		xDeltaToNext: NaN,
		yDeltaToNext: NaN,
		distance: NaN,
	}));

	if (points[1])
		annotatedPoints[0].end = distanceBetweenPoints(points[1], points[0]);

	for (let i = 0; i < points.length; i++) {
		if (i > 0) annotatedPoints[i].start = annotatedPoints[i - 1].end;

		if (i < points.length - 1) {
			annotatedPoints[i].xDeltaToNext =
				annotatedPoints[i + 1].x - annotatedPoints[i].x;
			annotatedPoints[i].yDeltaToNext =
				annotatedPoints[i + 1].y - annotatedPoints[i].y;
			annotatedPoints[i].end =
				(annotatedPoints[i].start ?? 0) +
				distanceBetweenPoints(points[i], points[i + 1]);
			annotatedPoints[i].distance =
				(annotatedPoints[i].end ?? 0) - (annotatedPoints[i].start ?? 0);
		}
	}

	let curPoint = 0;
	const func =
		points.length > 1
			? (progress: number) => {
					if (progress < 0)
						throw new Error("Progress should be greater than 0");

					while (progress < annotatedPoints[curPoint].start)
						curPoint--;

					while (
						progress > annotatedPoints[curPoint].end &&
						curPoint < points.length - 1
					)
						curPoint++;

					// Cap at the end
					if (annotatedPoints[curPoint].end === undefined)
						return annotatedPoints[curPoint];

					// Calc percentage progress
					const percentProgress =
						(progress - annotatedPoints[curPoint].start) /
						(annotatedPoints[curPoint].distance || Infinity);

					if (curPoint === points.length - 1) return points[curPoint];

					if (
						isNaN(annotatedPoints[curPoint].x) ||
						isNaN(
							percentProgress *
								annotatedPoints[curPoint].xDeltaToNext,
						)
					)
						throw "NaN";

					return {
						x:
							annotatedPoints[curPoint].x +
							percentProgress *
								annotatedPoints[curPoint].xDeltaToNext,
						y:
							annotatedPoints[curPoint].y +
							percentProgress *
								annotatedPoints[curPoint].yDeltaToNext,
					};
			  }
			: () => points[0];

	const distance = annotatedPoints[points.length - 1].start;
	let internalProgress = 0;

	Object.defineProperty(func, "remaining", {
		get: () => distance - internalProgress,
	});

	return Object.assign(func, {
		distance,
		step: (deltaProgress: number) => {
			internalProgress = Math.min(
				distance,
				internalProgress + deltaProgress,
			);
			return func(internalProgress);
		},
		origin: points[0],
		target: points[points.length - 1],
		// https://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
		// https://www.geogebra.org/geometry/dm7vez7p
		radialStepBack: (amount: number) => {
			if (points.length === 1) return points[0];

			let index = points.length - 2;
			const origin = points[index + 1];

			let distance = Math.sqrt(
				(origin.x - points[index].x) ** 2 +
					(origin.y - points[index].y) ** 2,
			);
			while (distance < amount && index >= 0) {
				index--;
				if (index < 0) break;
				distance = Math.sqrt(
					(origin.x - points[index].x) ** 2 +
						(origin.y - points[index].y) ** 2,
				);
			}

			if (index < 0) return points[0];

			const u = {
				x: points[index].x - origin.x,
				y: points[index].y - origin.y,
			};
			const v = {
				x: points[index + 1].x - origin.x,
				y: points[index + 1].y - origin.y,
			};

			const a = (u.x - v.x) ** 2 + (u.y - v.y) ** 2;
			const b = 2 * (v.x * (u.x - v.x) + v.y * (u.y - v.y));
			const c = v.x ** 2 + v.y ** 2 - amount ** 2;
			const disc = b ** 2 - 4 * a * c;
			const progress = (-b + Math.sqrt(disc)) / (2 * a);

			return {
				x:
					points[index + 1].x +
					(points[index].x - points[index + 1].x) * progress,
				y:
					points[index + 1].y +
					(points[index].y - points[index + 1].y) * progress,
			};
		},
		points,
		toJSON: () => ({ points }),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any);
};

// eslint-disable-next-line @typescript-eslint/ban-types
const isPoint = (target: Object): target is Point =>
	"x" in target && "y" in target;

export const calcAndTweenShortenedPath = (
	entity: Sprite,
	target: Point | Sprite,
	distanceToShorten: number,
): PathTweener => {
	// Normalize the target
	const targetPoint = isPoint(target) ? target : target.position;

	const pathingMap = currentGame().pathingMap;

	// Calculate the path, which may not get to the target
	const path = isPoint(target)
		? pathingMap.path(entity, targetPoint)
		: pathingMap.withoutEntity(target, () =>
				pathingMap.path(entity, targetPoint),
		  );

	// Check how far we are away from the target and get remaining distance
	// E.g., if we don't make it to the target, we don't need to shorten (as
	// much).
	const end = path[path.length - 1];
	const distanceFromPathEndToTarget = distanceBetweenPoints(end, targetPoint);
	const remainingDistance = distanceToShorten - distanceFromPathEndToTarget;

	// We are a far distance from the target; don't shorten at all
	if (remainingDistance <= 0) return tweenPoints(path);

	// We're close, so shorten
	return tweenPoints(shortenPath(path, remainingDistance));
};
