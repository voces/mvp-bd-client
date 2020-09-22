import { Emitter } from "../core/emitter";
import { Network } from "../engine/Network";
import { Katma } from "./Katma";

type Event = {
	time: number;
};

type InitEvent = Event & {
	type: "init";
	connections: number;
	state: ReturnType<Katma["toJSON"]>;
};

type StateEvent = Event & {
	type: "state";
	state: ReturnType<Katma["toJSON"]>;
};

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
const networkEvents = {
	...Network.networkEvents,
	init: (data: InitEvent) => {},
	state: (data: StateEvent) => {},
} as const;
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

export type NetworkEventCallback = typeof networkEvents;

class KatmaNetwork extends Network implements Emitter<NetworkEventCallback> {
	// These are implemented via calling emitter(this)
	addEventListener!: Emitter<NetworkEventCallback>["addEventListener"];
	removeEventListener!: Emitter<NetworkEventCallback>["removeEventListener"];
	removeEventListeners!: Emitter<
		NetworkEventCallback
	>["removeEventListeners"];
	dispatchEvent!: Emitter<NetworkEventCallback>["dispatchEvent"];
}

export { KatmaNetwork };
