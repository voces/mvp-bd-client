import { ComponentConstructor } from "./Component";
import { Unit } from "../entities/sprites/Unit";
import { Entity } from "./Entity";
import { isSprite } from "../typeguards";

abstract class System<T extends Entity = Entity> {
	private set: Set<T> = new Set();
	protected dirty?: Set<T>;
	private _callbacks: Map<
		Entity,
		{
			changeListener: ((prop: keyof Unit) => void) | undefined;
		}
	> = new Map();

	static readonly components: ReadonlyArray<
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ComponentConstructor<any>
	> = [];

	static props = new Array<keyof Unit>();

	abstract test(entity: Entity | T): entity is T;

	private _add(entity: T): void {
		this.set.add(entity);
		this.dirty?.add(entity);

		if (isSprite(entity)) {
			const props = (this.constructor as typeof System).props;
			const changeListener = props.length
				? (prop: keyof Unit) => {
						if (props.includes(prop)) this.check(entity);
				  }
				: undefined;
			this._callbacks.set(entity, {
				changeListener,
			});
			if (changeListener)
				entity.addEventListener("change", changeListener);
		}

		this.onAddEntity?.(entity);
	}

	add(...entites: Entity[]): void {
		for (const entity of entites)
			if (this.test(entity) && !this.set.has(entity)) this._add(entity);
	}

	private _remove(entity: Entity): void {
		this.set.delete(entity as T);
		this.dirty?.delete(entity as T);

		if (isSprite(entity)) {
			const callbacks = this._callbacks.get(entity);
			if (callbacks)
				if (callbacks.changeListener)
					entity.removeEventListener(
						"change",
						callbacks.changeListener,
					);

			this._callbacks.delete(entity);
		}

		this.onRemoveEntity?.(entity);
	}

	remove(...entites: Entity[]): void {
		for (const entity of entites)
			if (this.set.has(entity as T)) this._remove(entity);
	}

	/**
	 * If the passed entity satisifies `set`, then the entity is added to the
	 * system. Otherwise, it is removed.
	 */
	check(entity: Entity): void {
		if (this.test(entity)) {
			if (!this.set.has(entity)) this._add(entity);
		} else if (this.set.has(entity as T)) this._remove(entity);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	preUpdate(delta: number, time: number): void {
		/* do nothing */
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	postUpdate(delta: number, time: number): void {
		/* do nothing */
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	preRender(delta: number, time: number): void {
		/* do nothing */
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	postRender(delta: number, time: number): void {
		/* do nothing */
	}

	dispose(): void {
		for (const entity of this.set) this._remove(entity);
	}

	[Symbol.iterator](): IterableIterator<T> {
		return (this.dirty ?? this.set)[Symbol.iterator]();
	}
}

interface System<T> {
	update?(entity: T, delta: number, time: number): void;
	render?(entity: T, delta: number, time: number): void;
	onAddEntity?(entity: T): void;
	onRemoveEntity?(entity: Entity): void;
}

export { System };
