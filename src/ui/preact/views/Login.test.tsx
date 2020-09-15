import { h } from "preact";
import { act } from "preact/test-utils";
import { mount, ReactWrapper } from "enzyme";

import { fakeGame } from "../tests/fake/FakeGame";
import { Game as GameC } from "../contexts/Game";
import { findButton, findInput } from "../tests/forms";
import * as network from "../../../network";

import { Login } from "./Login";

jest.mock("../../../network");

const mockedFetch = (network as any).fetch as jest.Mock<
	typeof network["fetch"]
>;

const passwordTest = (wrapper: ReactWrapper, visible: boolean) => {
	const password = findInput(wrapper, "password");
	expect(password.exists()).toBeTruthy();
	expect(password.props().hidden).toEqual(visible);
};

beforeEach(() => {
	mockedFetch.mockClear();
});

it("starts in an initialized state", () => {
	const wrapper = mount(
		<GameC.Provider value={fakeGame()}>
			<Login />
		</GameC.Provider>,
	);

	expect(findInput(wrapper, "username").exists()).toBeTruthy();
	passwordTest(wrapper, true);
	expect(findButton(wrapper, "login").exists()).toBeTruthy();
	expect(findButton(wrapper, "register-1").exists()).toBeTruthy();
	expect(findInput(wrapper, "verify-password").exists()).toBeFalsy();
	expect(findButton(wrapper, "register-2").exists()).toBeFalsy();
	expect(findButton(wrapper, "cancel").exists()).toBeFalsy();
});

it("empty login works", () => {
	const fetch = jest.fn().mockImplementation(() => {
		debugger;
		return { ok: true, body: "Hello, World!" };
	});
	const original = jest.requireActual("../../../network");
	mockedFetch.mockImplementation(() => ({ ...original, fetch }));

	const wrapper = mount(
		<GameC.Provider value={fakeGame()}>
			<Login />
		</GameC.Provider>,
	);

	const loginButton = findButton(wrapper, "login");
	expect(loginButton.exists()).toBeTruthy();

	act(() => {
		wrapper.find("form").simulate("submit");
	});
	wrapper.update();

	expect(fetch).toHaveBeenCalledWith("a");
});
