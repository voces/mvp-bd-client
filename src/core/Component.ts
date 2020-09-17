import { currentApp } from "./appContext";
import { Entity } from "./Entity";

let replacing = false;

export class Component<
	InitializationParameters extends unknown[] = [],
	E extends Entity = Entity
> {
	static has(entity: Entity): boolean {
		return entity.has(this);
	}

	static clear(entity: Entity): boolean {
		return entity.clear(this);
	}

	/**
	 * Helper for when replacing a component with another. Reduces calls to
	 * App#entityComponentUpdated.
	 */
	static whileReplacing<T>(fn: () => T): T {
		const oldReplacing = replacing;
		const ret = fn();
		replacing = oldReplacing;
		return ret;
	}

	readonly entity: E;

	constructor(entity: E, ...rest: InitializationParameters) {
		this.entity = entity;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const constructor = <ComponentConstructor<any>>this.constructor;
		entity.add(constructor, this);

		if (this.initialize) this.initialize(...rest);

		currentApp().entityComponentUpdated(
			entity,
			<ComponentConstructor<Component>>this.constructor,
		);
	}

	// This method is invoked by the constructor before notifying the App of a
	// change
	protected initialize?(...rest: InitializationParameters): void;

	dispose(): void {
		if (!replacing)
			currentApp().entityComponentUpdated(
				this.entity,
				this.constructor as ComponentConstructor<Component>,
			);
	}

	/**
	 * Disposes `this` and adds a new component of the same type to the entity.
	 * Skips informing the app the original component was removed and instead
	 * relies on the new component informing the app of the change.
	 */
	replace(
		...args: InitializationParameters
	): Component<InitializationParameters, E> {
		return Component.whileReplacing(() => {
			this.entity.clear(this);
			return new (this.constructor as new (
				entity: E,
				...args: InitializationParameters
			) => Component<InitializationParameters, E>)(this.entity, ...args);
		});
	}

	toJSON(): Pick<this, Exclude<keyof this, "entity">> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { entity, ...props } = this;
		return props;
	}
}

export type ComponentConstructor<T extends Component> = new (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	...args: any[]
) => T;
