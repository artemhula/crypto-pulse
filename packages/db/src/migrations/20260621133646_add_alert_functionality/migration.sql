-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('TELEGRAM', 'DISCORD', 'EMAIL');

-- CreateTable
CREATE TABLE "crypto_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "target_price" DECIMAL(18,8) NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "is_triggered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "crypto_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_channels" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crypto_alerts" ADD CONSTRAINT "crypto_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "crypto_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
