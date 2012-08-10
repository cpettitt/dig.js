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
	src/version.js \
	src/dig/util.js \
	src/dig/data.js \
	src/dig/data/priority-queue.js \
	src/dig/data/queue.js \
	src/dig/data/stack.js \
	src/dig/graph.js \
	src/dig/alg.js \
	src/dig/alg/components.js \
	src/dig/alg/tarjan.js \
	src/dig/alg/topsort.js \
	src/dig/alg/dijkstra.js \
	src/dig/alg/floyd-warshall.js \
	src/dig/dot.js \
	src/post.js

dig.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

dig.min.js: dig.js
	@rm -f $@
	$(JS_MIN) dig.js > dig.min.js
	@chmod a-w $@

package.json: dig.js package.js
	@rm -f $@
	$(NODE) package.js > $@
	@chmod a-w $@

.PHONY: test
test: dig.js
	$(MOCHA) $(MOCHA_OPTS) --recursive test

clean:
	rm -f dig.js dig.min.js package.json
