const patternData = {
      patterns: JSON.stringify(args.conversationPatterns),
      userId: args.userId,
      emotionalProfile: args.emotionalProfile,
      topicPreferences: args.topicPreferences,
      communicationStyle: args.communicationStyle,
      conversationPatterns: args.conversationPatterns,
      personalizedContext: args.personalizedContext,
      conversationCount: args.conversationCount,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      version: existing ? existing.version + 1 : 1,
      personalizationEnabled: true,
    };
    
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversationEmbeddings", args);
      },