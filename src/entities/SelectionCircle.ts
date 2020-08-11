import { CircleGeometry, LineBasicMaterial, Line } from "three";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { Position } from "../components/Position";

export class SelectionCircle {
	constructor({
		radius,
		color,
		x,
		y,
	}: {
		radius: number;
		color: string;
		x: number;
		y: number;
	}) {
		const geometry = new CircleGeometry(radius / 2, 64);
		const material = new LineBasicMaterial({
			color,
		});

		geometry.vertices.shift();
		const mesh = new Line(geometry, material);

		new SceneObjectComponent(this, mesh);
		new Position(this, x, y);
	}
}
