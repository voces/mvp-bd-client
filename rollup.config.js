import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
	input: "src/index.ts",
	output: [{ dir: "public/js", format: "es" }],
	plugins: [
		typescript({
			tsconfig: "tsconfig.build.json",
			tsconfigOverride: { compilerOptions: { declaration: false } },
		}),
		nodeResolve(),
	],
};