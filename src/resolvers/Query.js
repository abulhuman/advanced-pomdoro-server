const { getUserId } = require('../utils');
function getAllTasks(_parent, _args, { prisma, req }) {
  if (!getUserId(req)) return;
  return prisma.task.findMany();
}

function getTask(_parent, { id }, { prisma, req }) {
  if (!getUserId(req)) return;
  return prisma.task.findUnique({ where: { id: Number(id) } });
}

module.exports = {
  getAllTasks,
  getTask
};
