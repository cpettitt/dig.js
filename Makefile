NODE?=node
NPM?=npm
NODE_MODULES?=./node_modules
JS_MIN?=$(NODE_MODULES)/uglify-js/bin/uglifyjs
MOCHA?=$(NODE_MODULES)/mocha/bin/mocha
MOCHA_OPTS?=-R spec
PEGJS?=$(NODE_MODULES)/pegjs/bin/pegjs

all: \
	package.json \
	dig.js \
	dig.min.js

src/dig/dot/grammar.js:
	$(PEGJS) -e dig_dot_parser src/dig/dot/grammar.pegjs $@

.INTERMEDIATE dig.js: \
	src/pre.js \
	src/version.js \
	src/dig/util.js \
	src/dig/data.js \
	src/dig/data/priority-queue.js \
	src/dig/data/queue.js \
	src/dig/data/stack.js \
	src/dig/digraph.js \
	src/dig/ugraph.js \
	src/dig/alg.js \
	src/dig/alg/components.js \
	src/dig/alg/dijkstra.js \
	src/dig/alg/floyd-warshall.js \
	src/dig/alg/levels.js \
	src/dig/alg/prim.js \
	src/dig/alg/tarjan.js \
	src/dig/alg/topsort.js \
	src/dig/dot.js \
	src/dig/dot/layout.js \
	src/dig/dot/layout/cross-count.js \
	src/dig/dot/layout/order.js \
	src/dig/dot/layout/position.js \
	src/dig/dot/layout/rank.js \
	src/dig/dot/read.js \
	src/dig/dot/write.js \
	src/dig/dot/grammar.js \
	src/post.js

dig.js: Makefile $(NODE_MODULES)
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

dig.min.js: dig.js
	@rm -f $@
	$(JS_MIN) dig.js > dig.min.js
	@chmod a-w $@

$(NODE_MODULES): package.json
	$(NPM) install

package.json: src/version.js package.js
	@rm -f $@
	$(NODE) package.js > $@
	@chmod a-w $@

.PHONY: test
test: dig.js
	$(MOCHA) $(MOCHA_OPTS) --recursive test

clean:
	rm -f dig.js dig.min.js package.json
