import { query } from "./_generated/server";

export const loggedInUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Return Clerk user identity information
    return {
      _id: identity.subject,
      email: identity.email,
      name: identity.name,
      clerkId: identity.subject,
    };
  },
});