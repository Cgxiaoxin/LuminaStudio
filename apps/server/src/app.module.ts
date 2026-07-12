import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./common/health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { RolesGuard } from "./modules/auth/roles.guard";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { StoresModule } from "./modules/stores/stores.module";
import { StaffModule } from "./modules/staff/staff.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { ServicesModule } from "./modules/services/services.module";
import { SchedulesModule } from "./modules/schedules/schedules.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { MembershipsModule } from "./modules/memberships/memberships.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { LedgerModule } from "./modules/ledger/ledger.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { UploadModule } from "./modules/upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    StoresModule,
    StaffModule,
    CustomersModule,
    ServicesModule,
    SchedulesModule,
    BookingsModule,
    MembershipsModule,
    OrdersModule,
    PaymentsModule,
    LedgerModule,
    ReportsModule,
    MarketingModule,
    UploadModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
