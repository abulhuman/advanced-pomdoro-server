function Tasks({ id }, _args, { prisma }) {
  return prisma.user.findUnique({ where: { id } }).Tasks();
}

module.exports = {
  Tasks
};
