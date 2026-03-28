import { httpRouter } from "convex/server";
import { registerAllHttpRoutes } from "./http/registerAll";

const http = httpRouter();
registerAllHttpRoutes(http);

export default http;
