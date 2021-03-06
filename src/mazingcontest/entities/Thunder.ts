import type { ObstructionProps } from "../../engine/entities/widgets/sprites/units/Obstruction";
import { Obstruction } from "../../engine/entities/widgets/sprites/units/Obstruction";

export class Thunder extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		buildHotkey: "n" as const,
		cost: { gold: 1, lumber: 1 },
	};

	constructor(props: ObstructionProps) {
		super({ ...Thunder.clonedDefaults, ...props });
	}
}

// const obj: unknown = {};
// if (
// 	typeof obj === "object" &&
// 	obj &&
// 	"foo" in obj &&

// 	typeof obj.foo === "string"
// ) {
// 	const foo = obj.foo;
// }

interface Foo {
	foo: string;
}

const foo: Foo = { foo: "A", b: 3 };

console.log(foo);
