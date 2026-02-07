dev:
	meson setup build -Ddev=true --wipe --prefix $(shell pwd)/result
	meson install -C build

	@trap 'kill 0' INT; \
	esbuild --bundle src/style.css --outfile=build/src/style.css --watch=forever & \
	./result/bin/simple-bar

gen-types:
	npx @ts-for-gir/cli generate --ignoreVersionConflicts
