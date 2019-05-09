import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default {
  Query: {
    me(parent, args, ctx, info) {
      // check if there is a current user ID
      if (!ctx.req.userId) {
        return null;
      }
      return ctx.prisma.user(
        { id: ctx.req.userId },
        info
      );
    },
    async users(parent, args, ctx, info) {
      // 1. Check if they are logged in
      if (!ctx.req.userId) {
        throw new Error('You must be logged in!');
      }
      // 2. Check if the user has the permissions to query all the users
      // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

      // 2. if they do, query all the users!
      return ctx.prisma.users({}, info);
    },
  },
  Mutation: {
    async signup(parent, args, ctx, info) {
      // lowercase their email
      args.email = args.email.toLowerCase();
      // hash their password
      const password = await bcrypt.hash(args.password, 10);
      // create the user in the database
      const user = await ctx.prisma.createUser(
          {
            ...args,
            password,
            permissions: { set: ['USER'] },
          },
        info
      );
      // create the JWT token for them
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      // We set the jwt as a cookie on the response
      ctx.res.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
      });
      // Finalllllly we return the user to the browser
      return user;
    },
    async login(parent, { email, password }, ctx, info) {
      // 1. check if there is a user with that email
      const user = await ctx.prisma.user({ email: email });
      if (!user) {
        throw new Error(`No such user found for email ${email}`);
      }
      // 2. Check if their password is correct
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid Password!');
      }
      // 3. generate the JWT Token
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      // 4. Set the cookie with the token
      ctx.res.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      // 5. Return the user
      return user;
    },
    logout(parent, args, ctx, info) {
      ctx.res.clearCookie('token');
      return { message: 'Goodbye!' };
    },
    async resetPassword(parent, args, ctx, info) {
      // 1. check if the passwords match
      if (args.password !== args.confirmPassword) {
        throw new Error("Yo Passwords don't match!");
      }
      // 2. check if its a legit reset token
      // 3. Check if its expired
      const [user] = await ctx.db.query.users({
        where: {
          resetToken: args.resetToken,
          resetTokenExpiry_gte: Date.now() - 3600000,
        },
      });
      if (!user) {
        throw new Error('This token is either invalid or expired!');
      }
      // 4. Hash their new password
      const password = await bcrypt.hash(args.password, 10);
      // 5. Save the new password to the user and remove old resetToken fields
      const updatedUser = await ctx.prisma.updateUser({
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      // 6. Generate JWT
      const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
      // 7. Set the JWT cookie
      ctx.res.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      // 8. return the new user
      return updatedUser;
    },
  }
}