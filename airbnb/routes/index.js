const express = require("express");
const router = express.Router();

const myDB = require("../db/myDB.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/hosts");
});

router.get("/hosts", async (req, res) => {
  const page = req.query.page || 1;
  // console.log("/hosts", page);

  try {
    const hosts = await myDB.getHosts(page);
    // console.log("got hosts", hosts);

    // Save the session messages for display, then delete them
    const err = req.session.err;
    const msg = req.session.msg;
    req.session.err = "";
    req.session.msg = "";

    res.render("hosts", {
      hosts: hosts,
      err: err,
      msg: msg,
    });
  } catch (err) {
    console.log("got error", err);
    res.render("hosts", { err: err.message, hosts: [] });
  }
});

router.post("/hosts/create", async (req, res) => {
  const host = req.body;

  try {
    console.log("Create host", host);
    const result = await myDB.createHost(host, res);

    if (result === 1) {
      req.session.msg = "Host created";
      res.redirect("/hosts");
    } else {
      req.session.err = "There was an error creating the host";
      res.redirect("/hosts");
    }
    return;
  } catch (err) {
    console.log("Got error create", err);
    req.session.err = err.message;
    res.redirect("/hosts");
  }
});

router.post("/hosts/delete", async (req, res) => {
  try {
    const host = req.body;
    //console.log(host);
    const result = await myDB.deleteHost(host);

    console.log(result);
    if (result !== 1) {
      req.session.err = `Couldn't delete the object ${host.Name}`;
      res.redirect("/hosts");
      return;
    }

    req.session.msg = "Host deleted";
    res.redirect("/hosts");
  } catch (err) {
    console.log("got error delete");
    req.session.err = err.message;
    res.redirect("/hosts");
    return;
  }
});

router.post("/hosts/update", async (req, res) => {
  try {
    const host = req.body;
    const result = await myDB.updateHost(host);
    console.log("update", result);

    if (result === "OK") {
      req.session.msg = "Host Updated";
      res.redirect("/hosts");
    } else {
      req.session.err = "Error updating";
      res.redirect("/hosts");
    }
    return;

  } catch (err) {
    console.log("got error update");
    req.session.err = err.message;
    res.redirect("/hosts");
  }
});

module.exports = router;
