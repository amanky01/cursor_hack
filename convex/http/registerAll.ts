import type { HttpRouter } from "convex/server";
import { registerAdminCounsellorHttpRoutes } from "./routes/adminCounsellorHttpRoutes";
import { registerAdminUserRoutes } from "./routes/adminUserRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { registerChatbotRoutes } from "./routes/chatbotRoutes";
import { registerCounsellorHttpRoutes } from "./routes/counsellorHttpRoutes";
import { registerHealthRoutes } from "./routes/health";
import { registerStickyNotesRoutes } from "./routes/stickyNotesRoutes";
import { registerUserChatRoutes } from "./routes/userChatRoutes";

export function registerAllHttpRoutes(http: HttpRouter): void {
  registerHealthRoutes(http);
  registerAuthRoutes(http);
  registerStickyNotesRoutes(http);
  registerUserChatRoutes(http);
  registerChatbotRoutes(http);
  registerCounsellorHttpRoutes(http);
  registerAdminUserRoutes(http);
  registerAdminCounsellorHttpRoutes(http);
}
