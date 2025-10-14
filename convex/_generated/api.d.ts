/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as chatbot from "../chatbot.js";
import type * as crisis from "../crisis.js";
import type * as dreamAnalysis from "../dreamAnalysis.js";
import type * as http from "../http.js";
import type * as metrics from "../metrics.js";
import type * as moderation from "../moderation.js";
import type * as peerMatching from "../peerMatching.js";
import type * as privacy from "../privacy.js";
import type * as router from "../router.js";
import type * as userPatterns from "../userPatterns.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  chatbot: typeof chatbot;
  crisis: typeof crisis;
  dreamAnalysis: typeof dreamAnalysis;
  http: typeof http;
  metrics: typeof metrics;
  moderation: typeof moderation;
  peerMatching: typeof peerMatching;
  privacy: typeof privacy;
  router: typeof router;
  userPatterns: typeof userPatterns;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
