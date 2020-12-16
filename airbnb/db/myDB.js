const { SSL_OP_SINGLE_DH_USE } = require("constants");
const redis = require("redis");
const { promisify } = require("util");

function myDB() {
  const myDB = {};

  // We have only one connection per server
  const client = redis.createClient();

  client.on("error", function (error) {
    // TODO: HANDLE ERRORS
    console.error(error);
  });

  myDB.getHosts = async function (page) {
    const pzrange = promisify(client.zrange).bind(client);
    const phgetall = promisify(client.hgetall).bind(client);

    const ids = await pzrange("hosts", 0, -1);

    console.log("Got hosts ids", ids);

    // Iterate over the ids to get the details
    const promises = [];
    for (let id of ids) {
      promises.push(phgetall("host:" + id));
    }

    const hosts = await Promise.all(promises);
    console.log("Hosts details", hosts);

    return hosts;
  };

  myDB.createHost = async function (host) {
    // Convert the callback-based client.incr into a promise
    const pincr = promisify(client.incr).bind(client);
    const phmset = promisify(client.hmset).bind(client);
    const pzadd = promisify(client.zadd).bind(client);

    host.id = await pincr("countHostId");
    await phmset("host:" + host.id, host);
    return pzadd("hosts", +new Date(), host.id);
    // return phmset("host:" + host.id, host);



  };
  myDB.updateHost = async function (host) {
    const phmset = promisify(client.hmset).bind(client);

    return phmset("host:" + host.id, host);
  };

  myDB.deleteHost = async function (host) {
    const pdel = promisify(client.del).bind(client);
    const pzrem = promisify(client.zrem).bind(client);

    await pdel("host:" + host.id);
    return await pzrem("hosts", host.id);
  };

  return myDB;
}

module.exports = myDB();
