import { ReactWrapper } from "enzyme";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const findInput = (
	wrapper: ReactWrapper,
	dataTest: string,
): ReactWrapper<Parameters<typeof Input>[0]> =>
	wrapper.find(Input).filter({ "data-test": dataTest });

export const findButton = (
	wrapper: ReactWrapper,
	dataTest: string,
): ReactWrapper<Parameters<typeof Button>[0]> =>
	wrapper.find(Button).filter({ "data-test": dataTest });
