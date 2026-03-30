-- Create App Settings table
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL UNIQUE,
    "showVoucherSection" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create index for faster lookups
CREATE INDEX "AppSettings_shop_idx" ON "AppSettings"("shop");