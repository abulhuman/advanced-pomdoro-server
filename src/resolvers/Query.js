const { getUserId } = require('../utils');
function getAllTasks(_parent, _args, { prisma, req }) {
  if (!getUserId(req)) return;
  return prisma.task.findMany();
}

module.exports = {
  getAllTasks
};
