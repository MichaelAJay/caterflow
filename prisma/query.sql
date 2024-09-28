SELECT *
FROM "external_systems" as "es"
INNER JOIN "external_system_connection_requirements" as "escr" ON "escr"."external_system_id" = "es"."id"
INNER JOIN "external_system_connection_webhook_requirements" as "escwr" ON "escwr"."external_system_id" = "es"."id"
WHERE "es"."id" = '1';

INSERT INTO "integration_templates"("id", "uiName", "uiDescription", "event", "srcSystemName", "srcEntity", "targetSystemName", "targetEntity")
VALUES(3, "Default", "Default", "ezCaterOrderReceived", "EZ_CATER", "Order", "NUTSHELL", "Lead");