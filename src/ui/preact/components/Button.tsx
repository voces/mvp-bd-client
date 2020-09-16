import { h, JSX } from "preact";
import { classNames } from "../util";

export const Button = ({
	buttonRef,
	rank = "primary",
	type,
	className,
	children,
	...props
}: JSX.HTMLAttributes<HTMLButtonElement> & {
	error?: string;
	buttonRef?: { current: HTMLButtonElement };
	rank?: "primary" | "secondary";
}): JSX.Element => (
	<button
		{...props}
		className={classNames(
			className,
			"button",
			rank && `button--rank-${rank}`,
		)}
		ref={buttonRef}
		type={type ?? "button"}
	>
		{children}
	</button>
);
