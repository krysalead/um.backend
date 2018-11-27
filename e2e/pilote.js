var net = require('net');

function getClient(resolve, reject, action) {
  var client = new net.Socket();
  client.connect(1337, '127.0.0.1', function () {

  });
  client.on('data', function (data) {
    var answer = JSON.parse(data.toString());
    if (answer.error) {
      console.log("Error detected", answer.error);
      reject(JSON.stringify(answer.error));
      client.end();
    }
    if (action == answer.success) {
      resolve(answer.data);
      client.end();
    }
  });
  return client;
}

function send(action) {
  args = Array.prototype.slice.call(arguments, 1);
  return new Promise(function (resolve, reject) {
    var message = JSON.stringify({
      "action": action,
      "parameters": args
    });
    getClient(resolve, reject, action).write(message);
  });
}



module.exports = {
  resetDatabase: function () {
    return send('dbreset');
  },
  injectData: function (jsonFile) {
    return send('dbinject', jsonFile);
  },
  log: function (message) {
    return send('log', message);
  }
};