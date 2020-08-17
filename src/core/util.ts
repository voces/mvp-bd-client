import { App } from "./App";
import { Entity } from "./Entity";

type EntityWithApp = { app: App };

export const hasAppProp = (entity: Entity): entity is EntityWithApp =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	"app" in entity && (<EntityWithApp>entity).app instanceof App;
