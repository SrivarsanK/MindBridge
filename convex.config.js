import { defineApp } from "convex/server";
import schema from "./schema";

const app = defineApp();
app.useSchema(schema);
export default app;