var api = require('./api')
  , rpc = require('./lib/msgpack-rpc')

var debug;
if (process.env.NODE_DEBUG && /jubatus/.test(process.env.NODE_DEBUG)) {
  debug = function(x) { console.error('JUBATUS:', x); };
} else {
  debug = function() { };
}

for (var className in api) {
    var package = {}
    package[className] = createConstructor(className)
    module.exports[className.toLowerCase()] = { client: package }
}

function createConstructor(className) {
    var constructor = function() {
        if(!(this instanceof arguments.callee)) {
            throw new Error(className + ' is constructor.');
        }

        var port = arguments[0] || 9199
          , host = arguments[1] || 'localhost'
          , client = rpc.createClient(port, host)
        for(var propertyName in this) {
            client[propertyName] = this[propertyName]
        }
        return client;
    }
    api[className].methods.forEach(function(method) {
        var methodName = method.name || method
        constructor.prototype[methodName] = function() {
            var params = toArray(arguments)
              , hasCallback = (typeof params[params.length -1] === 'function')
              , callback = hasCallback ? params.pop() : undefined
            this.call(methodName, params, callback)
        }
    })
    return constructor
}

function toArray(args) {
    var a = []
    for(var i = 0; i < args.length; i++) {
        a.push(args[i])
    }
    return a;
}
