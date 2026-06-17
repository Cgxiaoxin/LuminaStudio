import { Controller, Get } from "@nestjs/common";
import { Public } from "../modules/auth/auth.decorator";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: "ok", service: "luminastudio-api" };
  }
}
