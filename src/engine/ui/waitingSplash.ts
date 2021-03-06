import { document } from "../../core/util/globals";
import type { Game } from "../../engine/Game";

const elem = document.getElementById("waiting-splash");

export const initSplashListeners = (game: Game): void => {
	if (!elem) return;
	game.addNetworkListener("init", ({ connections }) => {
		if (connections !== 0) elem.style.visibility = "visible";
	});

	game.addNetworkListener("state", () => {
		elem.style.visibility = "hidden";
	});
};
