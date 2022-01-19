const bcrypt = require('bcryptjs');
const moment = require('moment');
const { getUserId } = require('../utils');
function createNewTask(_parent, args, { prisma, req }) {
  if (!getUserId(req)) return;
  const TaskCreateInput = {
    ...args.newTaskParams,
    done: false,
    User: {
      connect: {
        id: parseInt(args.newTaskParams.userId)
      }
    }
  };
  delete TaskCreateInput.userId;
  return prisma.task.create({ data: TaskCreateInput });
}
function finalizeTask(_parent, args, { prisma, req }) {
  if (!getUserId(req)) return;
  const TaskFinalizeInput = {
    ...args.finalizeTaskParams,
    updated_at: new Date()
  };
  delete TaskFinalizeInput.id;
  return prisma.task.update({
    where: { id: parseInt(args.finalizeTaskParams.id) },
    data: TaskFinalizeInput
  });
}
async function signup(_parent, { signupParams }, { prisma }) {
  const user = prisma.user.create({
    data: {
      email: String(signupParams.email).toLowerCase(),
      password: await bcrypt.hash(signupParams.password, 10)
    }
  });
  const { created_at, updated_at, password, ...AuthPayload } = user;
  return AuthPayload;
}
async function signin(_parent, args, { prisma, req }) {
  const user = await prisma.user.findUnique({
    where: { email: args.signInParams.email }
  });
  if (!user) return new AuthenticationError('User not found');

  const validUser = await bcrypt.compare(
    args.signInParams.password,
    user.password
  );
  if (!validUser) throw new UserInputError('Wrong password');
  req.session.userId = user.id;
  const { created_at, updated_at, password, ...AuthPayload } = user;
  return AuthPayload;
}
async function resetPassword(
  _parent,
  { resetPasswordParams },
  { req, prisma }
) {
  if (!getUserId(req)) throw new ForbiddenError();
  const hashedPassword = await bcrypt.hash(resetPasswordParams.password, 10);
  const user = await prisma.user.update({
    where: { email: String(resetPasswordParams.email).toLowerCase() },
    data: { password: hashedPassword, updated_at: new Date() }
  });
  const { created_at, updated_at, password, ...AuthPayload } = user;
  return AuthPayload;
}
function signout(_parent, args, { req }) {
  if (!getUserId(req)) return;
  return new Promise((resolve) => {
    req.session.destroy((error) =>
      error ? console.error('Logout error ' + error) : resolve(true)
    );
  });
}
module.exports = {
  createNewTask,
  finalizeTask,
  signup,
  signin,
  resetPassword,
  signout
};
