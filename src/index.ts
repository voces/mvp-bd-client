import { Network, activeHost } from "./network";
import { Game } from "./Game";
import { document, window } from "./util/globals";
import { App } from "./core/App";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const network = ((globalThis as any).network = new Network());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const game = ((globalThis as any).game = new Game(network));
Game.manager._setContext(game);
App.manager._setContext(game);

Object.assign(document.getElementById("arena")!, { x: 0, y: 0, scale: 1 });

window.addEventListener("contextmenu", (e: Event) => {
	e.preventDefault();
});

let remainingErrors = 3;
window.addEventListener("error", (event: { error: Error }) => {
	if (remainingErrors === 0) return;
	remainingErrors--;

	fetch(`http://${activeHost}/error`, {
		method: "POST",
		body: JSON.stringify({ stack: event.error.stack }),
		headers: { "Content-Type": "application/json" },
	});

	console.error(event.error);
});
setInterval(() => (remainingErrors = Math.min(3, remainingErrors + 1)), 5000);
