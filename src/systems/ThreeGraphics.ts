import { PerspectiveCamera } from "../../node_modules/three/src/cameras/PerspectiveCamera.js";
import { DirectionalLight } from "../../node_modules/three/src/lights/DirectionalLight.js";
import { HemisphereLight } from "../../node_modules/three/src/lights/HemisphereLight.js";
import { Vector2 } from "../../node_modules/three/src/math/Vector2.js";
import { Vector3 } from "../../node_modules/three/src/math/Vector3.js";
import { WebGLRenderer } from "../../node_modules/three/src/renderers/WebGLRenderer.js";
import { Scene } from "../../node_modules/three/src/scenes/Scene.js";
import { SphereBufferGeometry } from "../../node_modules/three/src/geometries/SphereGeometry.js";
import { BoxBufferGeometry } from "../../node_modules/three/src/geometries/BoxGeometry.js";
import { Mesh } from "../../node_modules/three/src/objects/Mesh.js";
import { MeshPhongMaterial } from "../../node_modules/three/src/materials/MeshPhongMaterial.js";
import {
	GraphicComponent,
	GraphicComponentManager,
} from "../components/graphics/GraphicComponent.js";
import { System } from "../core/System.js";
import { Sprite } from "../sprites/Sprite.js";
import { document, window } from "../util/globals.js";
import { Unit } from "../sprites/Unit.js";
import { MoveTargetManager } from "../components/MoveTarget.js";
import { Point } from "../pathing/PathingMap.js";
import { tweenPoints, PathTweener } from "../util/tweenPoints.js";

const getCanvas = () => {
	const canvas = document.createElement("canvas");
	document.body.prepend(canvas);

	return canvas;
};

const getRenderer = (canvas: HTMLCanvasElement) => {
	const renderer = new WebGLRenderer({ antialias: true, canvas });
	// renderer.gammaOutput = true;
	renderer.setClearColor(0x000000);
	// renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setPixelRatio(0.5);
	renderer.shadowMap.enabled = true;
	if (!renderer.domElement.parentElement)
		document.body.prepend(renderer.domElement);

	return renderer;
};

const getScene = () => {
	const scene = new Scene();

	// Basic lighting
	scene.add(new HemisphereLight(0xffffbb, 0x080820, 1));

	// Sun
	const sun = new DirectionalLight(0xffffff, 1);
	sun.target = sun;
	const sunTilt = new Vector3(-10, -15, 25);
	const updateLight = () => {
		const height = sun.position.z;
		sun.position.copy(sun.position).add(sunTilt);
		sun.shadow.camera.near = 0;
		sun.shadow.camera.far = height * 5 + 100;
		sun.shadow.camera.left = -height * 10;
		sun.shadow.camera.right = height * 6;
		sun.shadow.camera.top = height * 10;
		sun.shadow.camera.bottom = -height * 4;
		sun.shadow.mapSize.width = 4096;
		sun.shadow.mapSize.height = 4096;
	};
	updateLight();
	sun.castShadow = true;
	scene.add(sun);

	return scene;
};

const getCamera = (renderer: WebGLRenderer) => {
	const size = new Vector2();
	renderer.getSize(size);
	const camera = new PerspectiveCamera(75, size.x / size.y, 0.1, 10000);
	camera.position.z = 10;
	camera.position.y = -7;
	camera.rotation.x = 0.6;

	return camera;
};

const getColor = (entity: Sprite, graphic: GraphicComponent) =>
	graphic.color ?? entity.color ?? entity.owner?.color?.hex ?? "white";

const getMat = (entity: Sprite, graphic: GraphicComponent) =>
	new MeshPhongMaterial({ color: getColor(entity, graphic) });

const createSphere = (entity: Sprite, graphic: GraphicComponent): Mesh =>
	new Mesh(
		new SphereBufferGeometry(entity.radius / 2),
		getMat(entity, graphic),
	);

const createBox = (entity: Sprite, graphic: GraphicComponent): Mesh =>
	new Mesh(
		new BoxBufferGeometry(entity.radius, entity.radius, entity.radius),
		getMat(entity, graphic),
	);

type EntityData = {
	onChangePositionListener: () => void;
	onHealthChangeListener: (prop: string) => void;
	updatePosition: boolean;
	updateHealth: boolean;
};

export class ThreeGraphics extends System {
	static components = [GraphicComponent];

	static isThreeGraphics = (system: System): system is ThreeGraphics =>
		system instanceof ThreeGraphics;

	protected dirty = new Set<Sprite>();
	private entityData: Map<Sprite, EntityData> = new Map();
	private renderer: WebGLRenderer;
	private scene: Scene;

	// This should ideally be an entity...
	camera: PerspectiveCamera;

	private activePan?: PathTweener & { duration: number };

	constructor() {
		super();

		const canvas = getCanvas();
		this.renderer = getRenderer(canvas);
		this.scene = getScene();
		this.camera = getCamera(this.renderer);

		// helps with camera -> renderer -> updateSize -> camera
		(async () => this.updateSize())();

		window.addEventListener("resize", () => this.updateSize());
	}

	updateSize(): void {
		const container = this.renderer.domElement.parentElement;
		if (!container) return;

		this.renderer.setSize(container.offsetWidth, container.offsetHeight);

		this.camera.aspect = container.offsetWidth / container.offsetHeight;
		this.camera.updateProjectionMatrix();
	}

	test(entity: Sprite): entity is Sprite {
		return GraphicComponentManager.has(entity);
	}

	onAddEntity(entity: Sprite): void {
		const graphic = GraphicComponentManager.get(entity);
		if (!graphic) return;

		// Build/set the mesh
		const builder = graphic.shape === "circle" ? createSphere : createBox;
		const mesh = builder(entity, graphic);
		mesh.position.x = entity.position.x;
		mesh.position.y = entity.position.y;
		mesh.position.z = entity.radius;
		this.scene.add(mesh);
		graphic.mesh = mesh;

		// Add listeners
		const data = {
			onChangePositionListener: () => {
				this.dirty.add(entity);
				data.updatePosition = true;
			},
			onHealthChangeListener: (prop: string) => {
				if (prop !== "health") return;
				this.dirty.add(entity);
				data.updateHealth = true;
			},
			updatePosition: true,
			updateHealth: true,
		};
		entity.position.addEventListener(
			"change",
			data.onChangePositionListener,
		);
		entity.addEventListener("change", data.onHealthChangeListener);
		this.entityData.set(entity, data);
	}

	onRemoveEntity(entity: Sprite): void {
		const graphicComponent = GraphicComponentManager.get(entity);
		if (graphicComponent) {
			const mesh = graphicComponent?.mesh;
			if (mesh) this.scene.remove(mesh);
			graphicComponent.mesh = undefined;
		}

		const data = this.entityData.get(entity);
		if (data) {
			entity.position.removeEventListener(
				"change",
				data.onChangePositionListener,
			);
			entity.removeEventListener("change", data.onHealthChangeListener);
		}

		this.entityData.delete(entity);
	}

	panTo(point: Point, duration = 0.125): void {
		this.activePan = Object.assign(
			tweenPoints([
				{ x: this.camera.position.x, y: this.camera.position.y },
				{ x: point.x, y: point.y - 7 },
			]),
			{ duration },
		);
		this.updateCamera();
	}

	private updatePosition(
		mesh: Mesh,
		entity: Sprite,
		delta: number,
		time: number,
		data: EntityData,
	): boolean {
		const moveTarget = MoveTargetManager.get(entity);
		if (moveTarget && Unit.isUnit(entity)) {
			moveTarget.renderProgress += entity.speed * delta;
			const { x, y } = moveTarget.path(moveTarget.renderProgress);
			mesh.position.x = x;
			mesh.position.y = y;
			return true;
		}

		// Otherwise update the rendering position and mark clean
		mesh.position.x = entity.position.x;
		mesh.position.y = entity.position.y;

		data.updatePosition = false;
		return false;
	}

	private updateHealth(
		mesh: Mesh,
		entity: Sprite,
		data: EntityData,
	): boolean {
		// if (entity.health <= 0) elem.classList.add("death");
		// else
		// 	elem.style.opacity = Math.max(
		// 		entity.health / entity.maxHealth,
		// 		0.1,
		// 	).toString();

		// data.updateHealth = false;
		return false;
	}

	render(entity: Sprite, delta: number, time: number): void {
		const graphicComponent = GraphicComponentManager.get(entity);
		const mesh = graphicComponent?.mesh;
		const data = this.entityData.get(entity);
		if (!data || !mesh) return;

		const stillDirty = [
			data.updatePosition &&
				this.updatePosition(mesh, entity, delta, time, data),
			data.updateHealth && this.updateHealth(mesh, entity, data),
		].some((v) => v);

		if (!stillDirty) this.dirty.delete(entity);
	}

	private updateCamera(delta = 17 / 1000): void {
		const activePan = this.activePan;
		if (activePan) {
			console.log("activePan");
			const { x, y } = activePan.step(
				(delta * activePan.distance) / activePan.duration,
			);
			this.camera.position.x = x;
			this.camera.position.y = y;
			if (activePan.remaining === 0) this.activePan = undefined;
		}
	}

	postRender(delta: number): void {
		this.updateCamera(delta);
		this.renderer.render(this.scene, this.camera);
	}
}
