NPM=npm
NODE_MODULES=./node_modules
JS_MIN=$(NODE_MODULES)/uglify-js/bin/uglifyjs
MOCHA=$(NODE_MODULES)/mocha/bin/mocha
BROWSERIFY=$(NODE_MODULES)/browserify/bin/browserify
MOCHA_OPTS?=-R spec

all: \
	dig.js \
	dig.min.js

.INTERMEDIATE dig.js: \
	lib/pre.js \
	lib/dig.js \
	lib/util.js \
	lib/graph.js \
	dig.alg.js \
	lib/post.js

dig.alg.js: \
	lib/alg.js \
	lib/alg/topsort.js

dig.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

dig.%.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

dig.min.js: dig.js
	@rm -f $@
	$(JS_MIN) dig.js > dig.min.js
	@chmod a-w $@

.PHONY: test
test: dig.js
	$(MOCHA) $(MOCHA_OPTS) --recursive test

clean:
	rm -f dig.js dig.min.js
