const domainService = require("./domain.service.js");

async function getDomain(req, res) {
  try {
    const startParse = Date.now();
    const { name } = req.params;
    if (!name) {
      return;
    }
    const { data } = req.query;
    const dataToObj = JSON.parse(data);
    const { filterBy, sortBy } = dataToObj;
    const domain = await domainService.query(name, filterBy, sortBy);
    const finishParse = Date.now();
    domain.parseTime = finishParse - startParse;
    res.json(domain);
  } catch (err) {
    console.log("Failed to get domains", err);
    res.status(500).send({ err: "Failed to get domains" });
  }
}

module.exports = {
  getDomain,
};
