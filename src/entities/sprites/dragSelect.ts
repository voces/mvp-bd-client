import { active } from "./obstructionPlacement";
import { swallow } from "../../util/swallow";
import { emitter } from "../../emitter";
import { Sprite, SpriteElement } from "./Sprite";
import DragSelectClass from "../../lib/DragSelect";
import { defined } from "../../types";
import { MeshBuilderComponentManager } from "../../components/graphics/MeshBuilderComponent";
import { Selected } from "../../components/Selected";

let allSelectables: SpriteElement[] | undefined;

const base: {
	selection: readonly Sprite[];
	getSelection: () => Sprite[];
	setSelection: (sprites: Sprite[]) => void;
	addSelectables: (sprites: Sprite[]) => void;
	removeSelectables: (sprites: Sprite[]) => void;
} = {
	selection: [],
	// These are set below
	getSelection: () => [],
	setSelection: () => {
		/* do nothing */
	},
	addSelectables: () => {
		/* do nothing */
	},
	removeSelectables: () => {
		/* do nothing */
	},
};

type DragSelectEvents = {
	selection: (sprites: readonly Sprite[]) => void;
};

const host = emitter<typeof base, DragSelectEvents>(base);

export const dragSelect = typeof window !== "undefined" ? host : swallow(host);

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}

if (typeof window !== "undefined")
	(async () => {
		const DragSelect = await import("../../lib/DragSelect.js").then(
			(i) => i.default,
		);

		const selector = document.createElement("div");
		selector.style.background = "rgba( 70, 145, 246, 0.3 )";
		selector.style.border = "1px solid rgba( 70, 145, 246, 0.7 )";
		selector.style.position = "absolute";
		document.body.appendChild(selector);

		const internalDragSelect = new DragSelect({
			selector,
			onDragStartBegin: () => {
				if (active()) return internalDragSelect.break();
			},
			onDragMove: () => {
				if (allSelectables) return;
				allSelectables = [...internalDragSelect.getSelectables()];
				const firstSelectable = allSelectables[0];
				if (firstSelectable) {
					const localPlayer = firstSelectable.sprite.game.localPlayer;
					internalDragSelect.setSelectables(
						allSelectables.filter(
							(s) => s.sprite.owner === localPlayer,
						),
					);
				} else internalDragSelect.setSelectables([]);
			},
			callback: (selection: SpriteElement[]) => {
				if (allSelectables)
					internalDragSelect.addSelectables(allSelectables);
				allSelectables = undefined;

				dragSelect.selection = selection
					.map((e) => e.sprite)
					.filter(notEmpty);
				dragSelect.dispatchEvent("selection", dragSelect.selection);
			},
			onElementSelect: (element: SpriteElement) => {
				const sprite = element.sprite;
				if (!Selected.has(sprite)) new Selected(sprite);
			},
			onElementUnselect: (element: SpriteElement) => {
				Selected.clear(element.sprite);
			},
		}) as DragSelectClass<SpriteElement>;

		dragSelect.getSelection = () =>
			internalDragSelect
				.getSelection()
				.map((e: SpriteElement) => e.sprite)
				.filter(Boolean);
		dragSelect.setSelection = (v: Sprite[]) => {
			const elements = v
				.map((v) => MeshBuilderComponentManager.get(v)?.entityElement)
				.filter(notEmpty);
			const selection = Object.freeze(
				elements.map((e) => e?.sprite).filter(notEmpty),
			);

			internalDragSelect.setSelection(elements);
			dragSelect.selection = selection;
			dragSelect.dispatchEvent("selection", selection);
		};

		dragSelect.addSelectables = (v: Sprite[]) =>
			internalDragSelect.addSelectables(
				v
					.map(
						(v) =>
							MeshBuilderComponentManager.get(v)?.entityElement,
					)
					.filter(defined),
			);
		dragSelect.removeSelectables = (v: Sprite[]) =>
			internalDragSelect.removeSelectables(
				v
					.map(
						(v) =>
							MeshBuilderComponentManager.get(v)?.entityElement,
					)
					.filter(defined),
			);
	})();
