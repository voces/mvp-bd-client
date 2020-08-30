import { appendErrorMessage } from "../ui/chat";
import { Obstruction } from "../entities/sprites/obstructions/index";
import { Game } from "../Game";
import { Mechanism } from "../core/Merchanism";
import { Mouse } from "../systems/Mouse";
import { Grid } from "notextures";
import { Entity } from "../core/Entity";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { MeshPhongMaterial } from "three";

const edgeSnap = (v: number) => Math.round(v);
const midSnap = (v: number) => Math.floor(v) + 0.5;

export class ObstructionPlacement extends Mechanism {
	static isObstructionPlacement = (
		mechanism: Mechanism,
	): mechanism is ObstructionPlacement =>
		mechanism instanceof ObstructionPlacement;

	private game: Game;
	private plannedObstruction: typeof Obstruction | undefined;
	private pathable = false;
	private mouse: Mouse;
	private requestedAnimationFrame: number | undefined;
	private grids: Grid[][] = [];
	private lastRadius?: number;
	private entity: Entity = { id: "OBSTRUCTION_PLACEMENT" };

	constructor(game: Game) {
		super();

		this.game = game;
		this.mouse = game.mouse;
		game.mouse.addEventListener("mouseMove", () => {
			if (this.plannedObstruction) this.updatePosition();
		});
	}

	snap(v: number): number {
		const snapFunc =
			!this.plannedObstruction ||
			this.plannedObstruction.defaults.radius % 1 === 0
				? edgeSnap
				: midSnap;

		return snapFunc(v);
	}

	private grid(): Grid | undefined {
		return SceneObjectComponent.get(this.entity)?.object as
			| Grid
			| undefined;
	}

	private newGrid(width: number, height: number) {
		const grid = new Grid(width, height);
		grid.material = new MeshPhongMaterial({
			vertexColors: true,
			flatShading: true,
			depthTest: false,
		});
		grid.renderOrder = 100;
		return grid;
	}

	// We shouldn't just nuke the cells
	private updateCells() {
		if (!this.game.round || !this.plannedObstruction) return;

		const unit = this.game.localPlayer.unit;
		if (!unit) return;

		const pathing = this.plannedObstruction.defaults.requiresPathing;
		const radius = this.plannedObstruction.defaults.radius;
		const xStart = this.snap(this.mouse.ground.x) - radius;
		const yStart = this.snap(this.mouse.ground.y) - radius;

		// Grab a reference to the current Grid
		const oldGrid = this.grid();

		// Grab a reference to the new Grid, or create if the size is new
		if (!this.grids[radius * 2]) this.grids[radius * 2] = [];
		const grid =
			this.grids[radius * 2][radius * 2] ??
			(this.grids[radius * 2][radius * 2] = this.newGrid(
				radius * 2,
				radius * 2,
			));

		// If changing grids, hide the old one and show the new one
		if (grid !== oldGrid) {
			if (oldGrid) {
				oldGrid.visible = false;
				SceneObjectComponent.clear(this.entity);
			}
			new SceneObjectComponent(this.entity, grid);
			grid.visible = true;
		}

		this.game.round.pathingMap.withoutEntity(unit, () => {
			const xFinal = xStart + radius * 2;
			const yFinal = yStart + radius * 2;

			let overallPathable = true;
			const pathingGrid = unit.round.pathingMap.grid;
			for (let y = yStart; y < yFinal; y += 1)
				for (let x = xStart; x < xFinal; x += 1) {
					const pathable =
						pathingGrid[y * 2]?.[x * 2]?.pathable(pathing) &&
						pathingGrid[y * 2]?.[x * 2 + 1]?.pathable(pathing) &&
						pathingGrid[y * 2 + 1]?.[x * 2]?.pathable(pathing) &&
						pathingGrid[y * 2 + 1]?.[x * 2 + 1]?.pathable(pathing);

					if (pathable)
						grid.setColor(x - xStart, yFinal - y - 1, 0.25, 1, 0.5);
					else {
						grid.setColor(
							x - xStart,
							yFinal - y - 1,
							1,
							0.25,
							0.25,
						);

						overallPathable = false;
					}
				}

			this.pathable = overallPathable;
		});
	}

	render(): void {
		this.updateCells();
	}

	private updatePosition() {
		if (!this.plannedObstruction) return;

		const grid = this.grid();

		if (grid) {
			grid.position.x = this.snap(this.mouse.ground.x);
			grid.position.y = this.snap(this.mouse.ground.y);
			grid.position.z = this.game.terrain!.groundHeight(
				grid.position.x,
				grid.position.y,
			);
		}
	}

	private updateSize() {
		if (!this.plannedObstruction) return;

		this.updateCells();
		this.updatePosition();
	}

	start(obstruction: typeof Obstruction): void {
		if (obstruction.defaults.cost) {
			const check = this.game.localPlayer.checkResources(
				obstruction.defaults.cost,
			);
			if (check.length) {
				appendErrorMessage(`Not enough ${check.join(" ")}`);
				return;
			}
		}

		this.plannedObstruction = obstruction;
		this.updateSize();
		const grid = this.grid();
		if (grid) grid.visible = true;
		this.game.add(this.entity);
	}

	stop(): void {
		if (!this.plannedObstruction) return;
		this.plannedObstruction = undefined;
		const grid = this.grid();
		if (grid) grid.visible = false;
		this.game.remove(this.entity);
	}

	get active(): typeof Obstruction | undefined {
		return this.plannedObstruction;
	}

	get valid(): boolean {
		return !!this.plannedObstruction && this.pathable;
	}
}
