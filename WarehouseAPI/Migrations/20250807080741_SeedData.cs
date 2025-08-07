using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace WarehouseAPI.Migrations
{
    public partial class SeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Clients — вставляем по уникальному Number (или Name)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [Clients] WHERE [Name] = 'ООО ТехноПроект')
                BEGIN
                    INSERT INTO [Clients] ([Name], [Address], [Status]) VALUES
                    ('ООО ТехноПроект', 'ул. Ленина, д. 10, Москва', 'Active')
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [Clients] WHERE [Name] = 'ИП Сидоров')
                BEGIN
                    INSERT INTO [Clients] ([Name], [Address], [Status]) VALUES
                    ('ИП Сидоров', 'пр. Мира, д. 5, Санкт-Петербург', 'Active')
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [Clients] WHERE [Name] = 'АО СтройМастер')
                BEGIN
                    INSERT INTO [Clients] ([Name], [Address], [Status]) VALUES
                    ('АО СтройМастер', 'ш. Энтузиастов, д. 15, Екатеринбург', 'Inactive')
                END
            ");

            // 2. UnitsOfMeasure
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [UnitsOfMeasure] WHERE [Name] = 'шт')
                BEGIN
                    INSERT INTO [UnitsOfMeasure] ([Name], [Status]) VALUES ('шт', 'Active')
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [UnitsOfMeasure] WHERE [Name] = 'кг')
                BEGIN
                    INSERT INTO [UnitsOfMeasure] ([Name], [Status]) VALUES ('кг', 'Active')
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [UnitsOfMeasure] WHERE [Name] = 'л')
                BEGIN
                    INSERT INTO [UnitsOfMeasure] ([Name], [Status]) VALUES ('л', 'Active')
                END
            ");

            // 3. Resources
            foreach (var (name, status) in new[] { ("Болт М8", "Active"), ("Цемент М500", "Active"), ("Масло моторное 10W-40", "Active"), ("Кирпич красный", "Active") })
            {
                migrationBuilder.Sql($@"
                    IF NOT EXISTS (SELECT * FROM [Resources] WHERE [Name] = '{name}')
                    BEGIN
                        INSERT INTO [Resources] ([Name], [Status]) VALUES ('{name}', '{status}')
                    END
                ");
            }

            // 4. ReceiptDocuments
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ReceiptDocuments] WHERE [Number] = 'PR-001')
                BEGIN
                    INSERT INTO [ReceiptDocuments] ([Number], [Date], [Status]) VALUES ('PR-001', '2024-01-10', 0)
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ReceiptDocuments] WHERE [Number] = 'PR-002')
                BEGIN
                    INSERT INTO [ReceiptDocuments] ([Number], [Date], [Status]) VALUES ('PR-002', '2024-01-15', 1)
                END
            ");

            // 5. ShipmentDocuments — зависит от Clients
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentDocuments] WHERE [Number] = 'SH-001')
                BEGIN
                    INSERT INTO [ShipmentDocuments] ([Number], [ClientId], [Date], [Status])
                    SELECT 'SH-001', Id, '2024-01-12', 'Shipped'
                    FROM [Clients] WHERE [Name] = 'ООО ТехноПроект'
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentDocuments] WHERE [Number] = 'SH-002')
                BEGIN
                    INSERT INTO [ShipmentDocuments] ([Number], [ClientId], [Date], [Status])
                    SELECT 'SH-002', Id, '2024-01-18', 'Pending'
                    FROM [Clients] WHERE [Name] = 'ИП Сидоров'
                END
            ");

            // 6. Balances — зависит от Resources и UnitsOfMeasure
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [Balances] b
                              JOIN [Resources] r ON b.ResourceId = r.Id
                              JOIN [UnitsOfMeasure] u ON b.UnitOfMeasureId = u.Id
                              WHERE r.Name = 'Болт М8' AND u.Name = 'шт')
                BEGIN
                    INSERT INTO [Balances] ([ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT r.Id, u.Id, 1000.00
                    FROM [Resources] r, [UnitsOfMeasure] u
                    WHERE r.Name = 'Болт М8' AND u.Name = 'шт'
                END
            ");

            // Аналогично для других балансов...
            // (Повтори для других пар Resource + Unit)

            // 7. ReceiptResources — зависит от ReceiptDocuments, Resources, UnitsOfMeasure
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ReceiptResources] rr
                              JOIN [ReceiptDocuments] rd ON rr.ReceiptDocumentId = rd.Id
                              JOIN [Resources] r ON rr.ResourceId = r.Id
                              WHERE rd.Number = 'PR-001' AND r.Name = 'Болт М8')
                BEGIN
                    INSERT INTO [ReceiptResources] ([ReceiptDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT rd.Id, r.Id, u.Id, 500.00
                    FROM [ReceiptDocuments] rd, [Resources] r, [UnitsOfMeasure] u
                    WHERE rd.Number = 'PR-001' AND r.Name = 'Болт М8' AND u.Name = 'шт'
                END
            ");

            // Продолжи аналогично для других записей...

            // 8. ShipmentResources
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentResources] sr
                              JOIN [ShipmentDocuments] sd ON sr.ShipmentDocumentId = sd.Id
                              JOIN [Resources] r ON sr.ResourceId = r.Id
                              WHERE sd.Number = 'SH-001' AND r.Name = 'Болт М8')
                BEGIN
                    INSERT INTO [ShipmentResources] ([ShipmentDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT sd.Id, r.Id, u.Id, 200.00
                    FROM [ShipmentDocuments] sd, [Resources] r, [UnitsOfMeasure] u
                    WHERE sd.Number = 'SH-001' AND r.Name = 'Болт М8' AND u.Name = 'шт'
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentResources] sr
                              JOIN [ShipmentDocuments] sd ON sr.ShipmentDocumentId = sd.Id
                              JOIN [Resources] r ON sr.ResourceId = r.Id
                              WHERE sd.Number = 'SH-001' AND r.Name = 'Масло моторное 10W-40')
                BEGIN
                    INSERT INTO [ShipmentResources] ([ShipmentDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT sd.Id, r.Id, u.Id, 50.00
                    FROM [ShipmentDocuments] sd, [Resources] r, [UnitsOfMeasure] u
                    WHERE sd.Number = 'SH-001' AND r.Name = 'Масло моторное 10W-40' AND u.Name = 'кг'
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentResources] sr
                              JOIN [ShipmentDocuments] sd ON sr.ShipmentDocumentId = sd.Id
                              JOIN [Resources] r ON sr.ResourceId = r.Id
                              WHERE sd.Number = 'SH-002' AND r.Name = 'Цемент М500')
                BEGIN
                    INSERT INTO [ShipmentResources] ([ShipmentDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT sd.Id, r.Id, u.Id, 100.00
                    FROM [ShipmentDocuments] sd, [Resources] r, [UnitsOfMeasure] u
                    WHERE sd.Number = 'SH-002' AND r.Name = 'Цемент М500' AND u.Name = 'кг'
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Удаляем в обратном порядке
            migrationBuilder.Sql("DELETE FROM [ShipmentResources]");
            migrationBuilder.Sql("DELETE FROM [ReceiptResources]");
            migrationBuilder.Sql("DELETE FROM [Balances]");
            migrationBuilder.Sql("DELETE FROM [ShipmentDocuments]");
            migrationBuilder.Sql("DELETE FROM [ReceiptDocuments]");
            migrationBuilder.Sql("DELETE FROM [Resources]");
            migrationBuilder.Sql("DELETE FROM [UnitsOfMeasure]");
            migrationBuilder.Sql("DELETE FROM [Clients]");
        }
    }
}