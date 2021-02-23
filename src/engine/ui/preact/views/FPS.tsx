import { h, JSX } from "preact";
import { useContext } from "preact/hooks";

import { Mechanism } from "../../../../core/Merchanism";
import { Game, GameType } from "../contexts/Game";
import { useForceRender } from "../hooks/useForceRender";

const attached = new Set<GameType>();

export const FPS = (): JSX.Element => {
	const game = useContext(Game);
	const forceRender = useForceRender();

	if (!attached.has(game)) {
		game.addMechanism(
			new (class extends Mechanism {
				render() {
					forceRender();
				}
			})(),
		);
		attached.add(game);
	}

	const fps = game.fpsMonitor.fps.toFixed(0);

	return <span className="diagnostic">{fps}fps</span>;
};
