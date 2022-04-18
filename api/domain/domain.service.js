

async function query(name, filterBy, sortBy) {
  try {
  } catch (err) {
    logger.error("cannot find boards", err);
    throw err;
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection("board");
    let board = await collection.findOne({ _id: ObjectId(boardId) });
    return board;
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err);
    throw err;
  }
}

module.exports = {
  query,
  getById,
};
