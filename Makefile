NODE?=node
NPM?=npm
NODE_MODULES?=./node_modules
JS_MIN?=$(NODE_MODULES)/uglify-js/bin/uglifyjs
MOCHA?=$(NODE_MODULES)/mocha/bin/mocha
MOCHA_OPTS?=-R spec

all: \
	dig.js \
	dig.min.js \
	package.json

.INTERMEDIATE dig.js: \
	src/pre.js \
	lib/dig.js \
	lib/util.js \
	lib/data.js \
	lib/graph.js \
	lib/alg.js \
	src/post.js

dig.alg.js: \
	lib/alg.js \
	lib/alg/topsort.js

dig.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

dig.min.js: dig.js
	@rm -f $@
	$(JS_MIN) dig.js > dig.min.js
	@chmod a-w $@

package.json: lib/dig.js src/package.js
	@rm -f $@
	$(NODE) src/package.js > $@
	@chmod a-w $@

.PHONY: test
test: dig.min.js
	$(MOCHA) $(MOCHA_OPTS) --recursive test

clean:
	rm -f dig.js dig.min.js package.json
