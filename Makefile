NPM=npm
NODE_MODULES=./node_modules
JS_MIN=$(NODE_MODULES)/uglify-js/bin/uglifyjs
MOCHA=$(NODE_MODULES)/mocha/bin/mocha
BROWSERIFY=$(NODE_MODULES)/browserify/bin/browserify
MOCHA_OPTS?=-R spec
TESTS=$(shell find test -name "*-test.js")

all: \
	dig.js \
	dig.min.js

.INTERMEDIATE dig.js: \
	lib/dig.js \
	lib/graph.js \
	lib/util.js

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

test: dig.js
	$(MOCHA) $(MOCHA_OPTS) $(TESTS)

clean:
	rm -f dig.js dig.min.js
