require("./test-env");

var fs = require("fs");

var e = exports;

fs.readdirSync("test/graphs/directed").forEach(function(file) {
  var suffix = file.slice(-3);
  if (suffix === "dot") {
    var shortName = file.slice(0, file.length - 4);
    var fileContents = fs.readFileSync("test/graphs/directed/" + file, "utf-8");
    var g = dig.dot.read(fileContents);
    e[shortName] = g;
  }
});
