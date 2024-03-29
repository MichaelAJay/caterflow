SELECT *
FROM "roles" as "r"
    JOIN "_role_permissions" as "rp" ON "r"."id" = "rp"."B"
        JOIN "permissions" as "p" ON "rp"."A" = "p"."id"
WHERE "r"."company_id" IS NULL;