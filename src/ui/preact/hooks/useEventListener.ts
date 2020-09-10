import { useEffect, useRef } from "preact/hooks";
import { Emitter, EventMap } from "../../../emitter";

export const useEventListener = <
	Events extends EventMap,
	EventTarget extends Emitter<Events>,
	EventName extends keyof Events
>(
	eventTarget: EventTarget,
	eventName: EventName,
	callback: Events[EventName],
): void => {
	const savedHandler = useRef<Events[EventName]>();

	useEffect(() => {
		savedHandler.current = callback;
	}, [callback]);

	useEffect(() => {
		const eventListener = ((...args) =>
			savedHandler.current(...args)) as Events[EventName];

		eventTarget.addEventListener(eventName, eventListener);

		return () => {
			eventTarget.removeEventListener(eventName, eventListener);
		};
	}, [eventName, eventTarget]);
};
