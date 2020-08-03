import { Entity } from "./Entity";
import { App } from "./App";

export abstract class Component<T extends Entity = Entity> {
	readonly entity: T;

	constructor(entity: T) {
		this.entity = entity;
	}

	dispose(): void {
		/* do nothing */
	}
}

type EntityWithApp = { app: App };

const hasAppProp = (entity: Entity): entity is EntityWithApp =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	"app" in entity && (<EntityWithApp>entity).app instanceof App;

export abstract class EComponent<
	InitializationParameters extends unknown[] = []
> extends Component<Entity> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected static map = new WeakMap<Entity, EComponent<any>>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static get(entity: Entity): EComponent<any> | undefined {
		return this.map.get(entity);
	}
	static has(entity: Entity): boolean {
		return this.map.has(entity);
	}
	static clear(entity: Entity): boolean {
		const cleared = this.map.delete(entity);
		if (cleared && hasAppProp(entity))
			entity.app.entityComponentUpdated(
				entity,
				(this as unknown) as ComponentConstructor<EComponent>,
			);
		return cleared;
	}

	constructor(entity: Entity, ...rest: InitializationParameters) {
		super(entity);

		const constructor = <typeof EComponent>this.constructor;
		if (constructor.has(entity))
			throw new Error(
				`Adding duplicate component ${constructor.name} to Entity ${entity.constructor.name}`,
			);

		constructor.map.set(entity, this);

		if (this.initialize) this.initialize(...rest);
		if (hasAppProp(this.entity))
			this.entity.app.entityComponentUpdated(
				entity,
				<ComponentConstructor<EComponent>>this.constructor,
			);
	}

	// This method is invoked by the constructor before notifying the App of a
	// change
	protected initialize?(...rest: InitializationParameters): void;
}

export type ComponentConstructor<T extends Component> = new (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	...args: any[]
) => T;
