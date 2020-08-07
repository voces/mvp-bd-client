import { WORLD_TO_GRAPHICS_RATIO } from "../constants";
import { document } from "../util/globals";
import { clientToWorld } from "../players/camera";
import { appendErrorMessage } from "../ui/chat";
import { Obstruction } from "../entities/sprites/obstructions/index";
import { emptyElement } from "../util/html";
import { Game } from "../Game";
import { Mechanism } from "../core/Merchanism";

const edgeSnap = (v: number) => Math.round(v);
const midSnap = (v: number) => Math.floor(v) + 0.5;

const createCell = (pathable: boolean) => {
	const cell = document.createElement("div");
	cell.style.width = WORLD_TO_GRAPHICS_RATIO + "px";
	cell.style.height = WORLD_TO_GRAPHICS_RATIO + "px";
	cell.style.display = "inline-block";
	cell.style.backgroundColor = pathable
		? "rgba( 63, 255, 127, 0.5 )"
		: "rgba( 255, 63, 63, 0.5 )";

	return cell;
};

export class ObstructionPlacement extends Mechanism {
	static isObstructionPlacement = (
		mechanism: Mechanism,
	): mechanism is ObstructionPlacement =>
		mechanism instanceof ObstructionPlacement;

	private game: Game;
	private plannedObstruction: typeof Obstruction | undefined;
	private pathable = false;
	private readonly mouse = { x: 0, y: 0 };
	private readonly arena = document.getElementById("arena")!;
	private readonly container = document.createElement("div");
	private readonly pathableCells: HTMLDivElement[] = [];
	private readonly unpathableCells: HTMLDivElement[] = [];
	private requestedAnimationFrame: number | undefined;

	constructor(game: Game) {
		super();

		this.container.style.position = "absolute";
		this.container.style.display = "flex";
		this.container.style.flexWrap = "wrap";

		this.game = game;
		game.ui.addEventListener("mouseMove", ({ x, y }) => {
			Object.assign(this.mouse, clientToWorld({ x, y }));

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

	// We shouldn't just nuke the cells
	private updateCells() {
		if (!this.game.round || !this.plannedObstruction) return;

		const pathing = this.plannedObstruction.defaults.requiresPathing;
		const radius = this.plannedObstruction.defaults.radius;
		const xStart = this.snap(this.mouse.x) - radius;
		const yStart = this.snap(this.mouse.y) - radius;

		// We should link cells to grid tiles and update them in this case
		// if ( radius === updateCells.radiusLast &&
		//     xStart === updateCells.xStartLast &&
		//     yStart === updateCells.yStartLast
		// ) return;
		// radiusLast = radius;
		// xStartLast = xStart;
		// yStartLast = yStart;

		const unit = this.game.localPlayer.unit;
		if (!unit) return;

		this.game.round.pathingMap.withoutEntity(unit, () => {
			const xFinal = xStart + radius * 2;
			const yFinal = yStart + radius * 2;

			emptyElement(this.container);

			let overallPathable = true;
			const grid = unit.round.pathingMap.grid;
			let pathableIndex = 0;
			let unpathableIndex = 0;
			for (let y = yStart; y < yFinal; y += 1)
				for (let x = xStart; x < xFinal; x += 1) {
					const pathable =
						grid[y * 2] &&
						grid[y * 2][x * 2] &&
						grid[y * 2][x * 2].pathable(pathing) &&
						grid[y * 2] &&
						grid[y * 2][x * 2 + 1] &&
						grid[y * 2][x * 2 + 1].pathable(pathing) &&
						grid[y * 2 + 1] &&
						grid[y * 2 + 1][x * 2] &&
						grid[y * 2 + 1][x * 2].pathable(pathing) &&
						grid[y * 2 + 1] &&
						grid[y * 2 + 1][x * 2 + 1] &&
						grid[y * 2 + 1][x * 2 + 1].pathable(pathing);

					if (pathable) {
						if (!this.pathableCells[pathableIndex])
							this.pathableCells[pathableIndex] = createCell(
								true,
							);

						this.container.appendChild(
							this.pathableCells[pathableIndex],
						);
						pathableIndex++;
					} else {
						if (!this.unpathableCells[unpathableIndex])
							this.unpathableCells[unpathableIndex] = createCell(
								false,
							);

						this.container.appendChild(
							this.unpathableCells[unpathableIndex],
						);
						unpathableIndex++;

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

		this.container.style.left = `${
			(this.snap(this.mouse.x) -
				this.plannedObstruction.defaults.radius) *
			WORLD_TO_GRAPHICS_RATIO
		}px`;
		this.container.style.top = `${
			(this.snap(this.mouse.y) -
				this.plannedObstruction.defaults.radius) *
			WORLD_TO_GRAPHICS_RATIO
		}px`;
		this.updateCells();
	}

	private updateSize() {
		if (!this.plannedObstruction) return;

		this.container.style.width = `${
			this.plannedObstruction.defaults.radius *
			WORLD_TO_GRAPHICS_RATIO *
			2
		}px`;
		this.container.style.height = `${
			this.plannedObstruction.defaults.radius *
			WORLD_TO_GRAPHICS_RATIO *
			2
		}px`;
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
		this.arena.appendChild(this.container);
	}

	stop(): void {
		if (!this.plannedObstruction) return;
		this.plannedObstruction = undefined;
		this.arena.removeChild(this.container);
	}

	get active(): typeof Obstruction | undefined {
		return this.plannedObstruction;
	}

	get valid(): boolean {
		return !!this.plannedObstruction && this.pathable;
	}
}
