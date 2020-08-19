import { CircleGeometry, LineBasicMaterial, Line } from "three";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { Position } from "../components/Position";
import { App } from "../core/App";

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
		const geometry = new CircleGeometry(radius, 64);
		const material = new LineBasicMaterial({
			color,
			linewidth: radius / 32,
		});

		geometry.vertices.shift();
		const mesh = new Line(geometry, material);

		new SceneObjectComponent(this, mesh);
		new Position(this, x, y);

		App.manager.context?.add(this);
	}
}
