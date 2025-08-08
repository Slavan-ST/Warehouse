using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace WarehouseAPI.Migrations
{
    public partial class SeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Clients
            InsertIfNotExists(migrationBuilder,
                "Clients",
                new[] { "Name", "Address", "Status" },
                new object[] { "ООО ТехноПроект", "ул. Ленина, д. 10, Москва", "Active" });

            InsertIfNotExists(migrationBuilder,
                "Clients",
                new[] { "Name", "Address", "Status" },
                new object[] { "ИП Сидоров", "пр. Мира, д. 5, Санкт-Петербург", "Active" });

            InsertIfNotExists(migrationBuilder,
                "Clients",
                new[] { "Name", "Address", "Status" },
                new object[] { "АО СтройМастер", "ш. Энтузиастов, д. 15, Екатеринбург", "Inactive" });

            // 2. UnitsOfMeasure
            InsertIfNotExists(migrationBuilder,
                "UnitsOfMeasure",
                new[] { "Name", "Status" },
                new object[] { "шт", "Active" });

            InsertIfNotExists(migrationBuilder,
                "UnitsOfMeasure",
                new[] { "Name", "Status" },
                new object[] { "кг", "Active" });

            InsertIfNotExists(migrationBuilder,
                "UnitsOfMeasure",
                new[] { "Name", "Status" },
                new object[] { "л", "Active" });

            // 3. Resources
            InsertIfNotExists(migrationBuilder,
                "Resources",
                new[] { "Name", "Status" },
                new object[] { "Болт М8", "Active" });

            InsertIfNotExists(migrationBuilder,
                "Resources",
                new[] { "Name", "Status" },
                new object[] { "Цемент М500", "Active" });

            InsertIfNotExists(migrationBuilder,
                "Resources",
                new[] { "Name", "Status" },
                new object[] { "Масло моторное 10W-40", "Active" });

            InsertIfNotExists(migrationBuilder,
                "Resources",
                new[] { "Name", "Status" },
                new object[] { "Кирпич красный", "Active" });

            // 4. ReceiptDocuments
            InsertIfNotExists(migrationBuilder,
                "ReceiptDocuments",
                new[] { "Number", "Date", "Status" },
                new object[] { "PR-001", new DateTime(2024, 1, 10), 0 });

            InsertIfNotExists(migrationBuilder,
                "ReceiptDocuments",
                new[] { "Number", "Date", "Status" },
                new object[] { "PR-002", new DateTime(2024, 1, 15), 1 });

            // 5. ShipmentDocuments (зависит от Clients)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentDocuments] WHERE [Number] = N'SH-001')
                BEGIN
                    INSERT INTO [ShipmentDocuments] ([Number], [ClientId], [Date], [Status])
                    SELECT N'SH-001', Id, '2024-01-12', N'Shipped'
                    FROM [Clients] WHERE [Name] = N'ООО ТехноПроект'
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentDocuments] WHERE [Number] = N'SH-002')
                BEGIN
                    INSERT INTO [ShipmentDocuments] ([Number], [ClientId], [Date], [Status])
                    SELECT N'SH-002', Id, '2024-01-18', N'Pending'
                    FROM [Clients] WHERE [Name] = N'ИП Сидоров'
                END
            ");

            // 6. Balances
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [Balances] b
                              JOIN [Resources] r ON b.ResourceId = r.Id
                              JOIN [UnitsOfMeasure] u ON b.UnitOfMeasureId = u.Id
                              WHERE r.Name = N'Болт М8' AND u.Name = N'шт')
                BEGIN
                    INSERT INTO [Balances] ([ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT r.Id, u.Id, 1000.00
                    FROM [Resources] r, [UnitsOfMeasure] u
                    WHERE r.Name = N'Болт М8' AND u.Name = N'шт'
                END
            ");

            // 7. ReceiptResources
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ReceiptResources] rr
                              JOIN [ReceiptDocuments] rd ON rr.ReceiptDocumentId = rd.Id
                              JOIN [Resources] r ON rr.ResourceId = r.Id
                              WHERE rd.Number = N'PR-001' AND r.Name = N'Болт М8')
                BEGIN
                    INSERT INTO [ReceiptResources] ([ReceiptDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT rd.Id, r.Id, u.Id, 500.00
                    FROM [ReceiptDocuments] rd, [Resources] r, [UnitsOfMeasure] u
                    WHERE rd.Number = N'PR-001' AND r.Name = N'Болт М8' AND u.Name = N'шт'
                END
            ");

            // 8. ShipmentResources
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM [ShipmentResources] sr
                              JOIN [ShipmentDocuments] sd ON sr.ShipmentDocumentId = sd.Id
                              JOIN [Resources] r ON sr.ResourceId = r.Id
                              WHERE sd.Number = N'SH-001' AND r.Name = N'Болт М8')
                BEGIN
                    INSERT INTO [ShipmentResources] ([ShipmentDocumentId], [ResourceId], [UnitOfMeasureId], [Quantity])
                    SELECT sd.Id, r.Id, u.Id, 200.00
                    FROM [ShipmentDocuments] sd, [Resources] r, [UnitsOfMeasure] u
                    WHERE sd.Number = N'SH-001' AND r.Name = N'Болт М8' AND u.Name = N'шт'
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [ShipmentResources]");
            migrationBuilder.Sql("DELETE FROM [ReceiptResources]");
            migrationBuilder.Sql("DELETE FROM [Balances]");
            migrationBuilder.Sql("DELETE FROM [ShipmentDocuments]");
            migrationBuilder.Sql("DELETE FROM [ReceiptDocuments]");
            migrationBuilder.Sql("DELETE FROM [Resources]");
            migrationBuilder.Sql("DELETE FROM [UnitsOfMeasure]");
            migrationBuilder.Sql("DELETE FROM [Clients]");
        }

        /// <summary>
        /// Вспомогательный метод для вставки, если запись с таким ключом отсутствует.
        /// </summary>
        private void InsertIfNotExists(MigrationBuilder builder, string tableName, string[] columns, object[] values)
        {
            if (columns.Length != values.Length)
                throw new ArgumentException("Columns count must be equal to values count.");

            string whereColumn = columns[0];
            object whereValue = values[0];

            // Преобразуем значения в строку для SQL
            string ValuesToSql()
            {
                string result = "";
                for (int i = 0; i < columns.Length; i++)
                {
                    object val = values[i];
                    if (val is string)
                        result += $"N'{val}'";
                    else if (val is DateTime dt)
                        result += $"'{dt:yyyy-MM-dd}'";
                    else
                        result += val.ToString();

                    if (i < columns.Length - 1)
                        result += ", ";
                }
                return result;
            }

            string sql = $@"
                IF NOT EXISTS (SELECT 1 FROM [{tableName}] WHERE [{whereColumn}] = N'{whereValue}')
                BEGIN
                    INSERT INTO [{tableName}] ([{string.Join("],[", columns)}]) VALUES ({ValuesToSql()})
                END
            ";

            builder.Sql(sql);
        }
    }
}
