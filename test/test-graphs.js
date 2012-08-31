require("./test-env");

var fs = require("fs");

function scan(dir, appendTo) {
  fs.readdirSync(dir).forEach(function(file) {
    var suffix = file.slice(-3);
    if (suffix === "dot") {
      var shortName = file.slice(0, file.length - 4);
      var fileContents = fs.readFileSync(dir + "/" + file, "utf-8");
      var g = dig.dot.read(fileContents);
      appendTo[shortName] = g.immutable();
    }
  });
}

exports.directed = {};
exports.undirected = {};

scan("test/graphs/directed", exports.directed);
scan("test/graphs/undirected", exports.undirected);
