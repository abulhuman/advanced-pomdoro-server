function User({ id }, _args, { prisma }) {
  return prisma.task.findUnique({ where: { id } }).User();
}
module.exports = {
  User
};
