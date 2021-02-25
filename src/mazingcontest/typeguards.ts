import type { App } from "../core/App";
import type { MazingContest } from "./MazingContest";

export const isMazingContest = (obj: App): obj is MazingContest =>
	"isMazingContest" in obj.constructor;
