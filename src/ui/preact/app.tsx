import { h, render } from "preact";
import { Login } from "./login";

const App = () => (
	<div className="App">
		<Login />
	</div>
);

render(<App />, document.getElementById("preact")!);
