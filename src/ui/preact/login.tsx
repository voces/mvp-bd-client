import { h, JSX } from "preact";
import { useRef, useState } from "preact/hooks";

export const Login = (): JSX.Element => {
	const [mode, setMode] = useState<"init" | "login" | "register">("init");
	const passwordInput = useRef<HTMLInputElement>();
	const [login];

	const showPassword = () => {
		setMode("login");
		passwordInput.current.focus();
	};

	return (
		<form>
			<h2>katma</h2>
			<input
				id="login-name"
				maxLength={16}
				placeholder="username"
				onKeyDown={(e) => {
					if (e.key !== "Enter") return;

					if (mode !== "init") {
						passwordInput.current.focus();
						return;
					}

					if (fetching) return;
				}}
			/>
			{mode !== "register" && (
				<button
					id="login-register"
					onClick={(e) => (e.stopPropagation(), showPassword())}
				>
					Register
				</button>
			)}
			<input
				ref={passwordInput}
				id="login-password"
				placeholder="password"
				type="password"
				autoComplete="password"
				style={
					mode === "init"
						? { padding: 0, height: 0, overflow: "hidden" }
						: undefined
				}
			/>
			<input
				id="login-verify-password"
				placeholder="verify password"
				type="password"
				autoComplete="password"
				style={{ display: mode === "register" ? "block" : "none" }}
			/>
		</form>
	);
};
