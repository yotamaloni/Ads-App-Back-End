const domainService = require("./domain.service.js");

// GET LIST
async function getDomain(req, res) {
  try {
    const { name } = req.params;
    const { data } = req.query;
    const dataToObj = JSON.parse(data);
    const { filterBy, sortBy } = dataToObj;
    const domain = await domainService.query(name, filterBy, sortBy);
    // res.json(req.query.filterBy);
  } catch (err) {
    // logger.error("Failed to get domains", err);
    // res.status(500).send({ err: "Failed to get domains" });
  }
}

module.exports = {
  getDomain,
};
