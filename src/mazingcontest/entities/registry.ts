import type { Entity } from "../../core/Entity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityConstructor = new (...args: any[]) => Entity;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityFactory = (...args: any[]) => Entity;

const _entityRegistry: Record<string, EntityConstructor | EntityFactory> = {};

export const entityRegistry = _entityRegistry as Readonly<
	typeof _entityRegistry
>;

const isConstructor = (obj: unknown) =>
	typeof obj === "function" && !!obj.prototype.constructor.name;

export const registerEntity = (
	factory: EntityConstructor | EntityFactory,
	name?: string,
): void => {
	if (!name) if (isConstructor(factory)) name = factory.name;
	if (!name) throw new Error("Expected a name with factory");

	_entityRegistry[name] = factory;
};
