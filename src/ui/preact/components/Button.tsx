import { h, JSX } from "preact";
import { classNames } from "../util";

export const Button = ({
	buttonRef,
	color,
	type,
	className,
	children,
	...props
}: JSX.HTMLAttributes<HTMLButtonElement> & {
	error?: string;
	buttonRef?: { current: HTMLButtonElement };
	color?: "primary" | "secondary";
}): JSX.Element => (
	<button
		{...props}
		className={classNames(className, color && `color--${color}`)}
		ref={buttonRef}
		type={type ?? "button"}
	>
		{children}
	</button>
);
