build-ExecuteFunction:
	pnpm install --prod --frozen-lockfile
	pnpm prune --prod
	cp -R . $(ARTIFACTS_DIR)
