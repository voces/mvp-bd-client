module.exports = {
	extends: ["verit"],
	parserOptions: { project: "tsconfig.json", tsconfigRootDir: __dirname },
	settings: { react: { pragma: "h", version: "16.2" } },
	rules: {
		"@typescript-eslint/no-this-alias": [
			"error",
			{ allowedNames: ["mutable"] },
		],
		"@typescript-eslint/prefer-nullish-coalescing": "error",
		"@typescript-eslint/consistent-type-imports": ["error", {prefer: 'type-imports'}],
		"no-duplicate-imports": "off",
  		"@typescript-eslint/no-duplicate-imports": ["error"],
		"react/react-in-jsx-scope": "off"
	},
	overrides: [
		{
			files: ["./src/core/**"],
			rules: {
				"no-restricted-imports": [
					"error",
					{ patterns: ["**/engine/*", "**/katma/*", "**/mazingcontest/*"] },
				],
			},
		},
		{
			files: ["./src/engine/**"],
			rules: {
				"no-restricted-imports": [
					"error",
					{ patterns: ["**/katma/*", "**/mazingcontest/*"] },
				],
			},
		},
		{
			files: ["./src/katma/**"],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							"**/engine/Game",
							"**/engine/Network",
							"**/engine/players/Player",
						],
					},
				],
			},
		},
		{
			files: ["./src/mazingcontest/**"],
			rules: {
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							"**/engine/Game",
							"**/engine/Network",
							"**/engine/players/Player",
						],
					},
				],
			},
		},
	],
};
