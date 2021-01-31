import { App } from "../core/App";
import { MazingContest } from "./MazingContest";

export const isMazingContest = (obj: App): obj is MazingContest =>
	"isMazingContest" in obj.constructor;
