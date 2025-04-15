-- CreateTable
CREATE TABLE "discount_relation" (
    "discount_id" TEXT NOT NULL,
    "relation_id" TEXT NOT NULL,

    CONSTRAINT "discount_relation_pkey" PRIMARY KEY ("discount_id","relation_id")
);

-- AddForeignKey
ALTER TABLE "discount_relation" ADD CONSTRAINT "discount_relation_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
