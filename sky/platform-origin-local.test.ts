// @vitest-environment jsdom
// @vitest-environment-options {"url":"http://localhost:5301/"}
/** En local, una consola habla con el `wrangler pages dev` de onpilot (puerto 8800). */
import { describe, expect, it } from "vitest";
import { platformOrigin } from "../lib/platform-client";

describe("platformOrigin en local", () => {
	it("is the onpilot dev server on localhost", () => {
		expect(platformOrigin()).toBe("http://localhost:8800");
	});
});
