-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "personType" TEXT NOT NULL,
    "pfName" TEXT,
    "pfPhone" TEXT,
    "pfEmail" TEXT,
    "pjCompany" TEXT,
    "pjCui" TEXT,
    "pjRegCom" TEXT,
    "pjContact" TEXT,
    "pjPhone" TEXT,
    "pjEmail" TEXT,
    "county" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zip" TEXT,
    "notes" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "shipping" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "couponCode" TEXT,
    "couponAmount" INTEGER,
    "couponMinSubtotal" INTEGER,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "carrier" TEXT,
    "awb" TEXT,
    "trackingUrl" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "awb", "carrier", "city", "county", "couponAmount", "couponCode", "couponMinSubtotal", "createdAt", "currency", "discount", "id", "notes", "orderNo", "paymentMethod", "personType", "pfEmail", "pfName", "pfPhone", "pjCompany", "pjContact", "pjCui", "pjEmail", "pjPhone", "pjRegCom", "shipping", "status", "stripePaymentIntentId", "stripeSessionId", "subtotal", "total", "trackingUrl", "updatedAt", "userId", "zip") SELECT "address", "awb", "carrier", "city", "county", "couponAmount", "couponCode", "couponMinSubtotal", "createdAt", "currency", "discount", "id", "notes", "orderNo", "paymentMethod", "personType", "pfEmail", "pfName", "pfPhone", "pjCompany", "pjContact", "pjCui", "pjEmail", "pjPhone", "pjRegCom", "shipping", "status", "stripePaymentIntentId", "stripeSessionId", "subtotal", "total", "trackingUrl", "updatedAt", "userId", "zip" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
