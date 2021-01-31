import { Emitter } from "../core/emitter";
// eslint-disable-next-line no-restricted-imports
import {
	ConnectionEvent,
	InitEvent,
	Network,
	StateEvent,
} from "../engine/Network";
import { MazingContest } from "./MazingContest";

type MazingContestInitEvent = InitEvent & {
	state: ReturnType<MazingContest["toJSON"]>;
};

type MazingContestStateEvent = StateEvent & {
	state: ReturnType<MazingContest["toJSON"]>;
};

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
const networkEvents = {
	...Network.networkEvents,
	init: (data: MazingContestInitEvent) => {},
	state: (data: MazingContestStateEvent) => {},
} as const;
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

export type NetworkEventCallback = typeof networkEvents;

class MazingContestNetwork
	extends Network
	implements Emitter<NetworkEventCallback> {
	// These are implemented via calling emitter(this)
	addEventListener!: Emitter<NetworkEventCallback>["addEventListener"];
	removeEventListener!: Emitter<NetworkEventCallback>["removeEventListener"];
	removeEventListeners!: Emitter<NetworkEventCallback>["removeEventListeners"];
	dispatchEvent!: Emitter<NetworkEventCallback>["dispatchEvent"];
}

export { ConnectionEvent, MazingContestNetwork };
