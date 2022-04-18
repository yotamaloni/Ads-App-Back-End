const express = require("express");

const { getDomain } = require("./domain.controller");
const router = express.Router();

router.get("/:name", getDomain);

module.exports = router;
