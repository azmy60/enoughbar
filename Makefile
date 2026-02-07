dev:
	meson setup build --wipe --prefix $(shell pwd)/result
	meson install -C build
	./result/bin/simple-bar

gen-types:
	npx @ts-for-gir/cli generate --ignoreVersionConflicts
