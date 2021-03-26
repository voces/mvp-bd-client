import type { Entity } from "../../core/Entity";
import { isConstructor } from "../helpers";

interface EntityConstructor {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): Entity;
	fromJSON?: boolean | ((entity: ReturnType<Entity["toJSON"]>) => Entity);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityFactory = (...args: any[]) => Entity;

const _entityRegistry: Record<string, EntityConstructor | EntityFactory> = {};

export const entityRegistry = _entityRegistry as Readonly<
	typeof _entityRegistry
>;

export const registerEntity = (
	factory: EntityConstructor | EntityFactory,
	name?: string,
): void => {
	if (!name) if (isConstructor(factory)) name = factory.name;
	if (!name) throw new Error("Expected a name with factory");

	_entityRegistry[name] = factory;
};
