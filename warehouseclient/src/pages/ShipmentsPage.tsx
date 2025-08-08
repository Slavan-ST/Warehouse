// src/pages/ShipmentPage.tsx
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";
import {
  getShipments,
  getResources,
  getUnits,
  getClients,
} from "../api/warehouseApi";
import type {
  ResourceDto,
  ShipmentItem,
  UnitOfMeasureDto,
} from "../api/warehouseApi";

const ShipmentsPage = () => {
  const [ setShipments] = useState<ShipmentItem[]>([]);
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState<string | null>(null);

  // Фильтры
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [clientFilter, setClientFilter] = useState<number | "">("");
  const [resourceFilter, setResourceFilter] = useState<number[]>([]);
  const [unitFilter, setUnitFilter] = useState<number[]>([]);

  // Загрузка справочников
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [res, unt, clt] = await Promise.all([
          getResources(),
          getUnits(),
          getClients(),
        ]);
        setResources(res);
        setUnits(unt);
        setClients(clt.map((c) => ({ id: c.id, name: c.name })));
      } catch (err) {
        setError("Не удалось загрузить справочники");
      }
    };

    loadReferences();
  }, []);

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    const loadShipments = async () => {
      if (loading && resources.length === 0) return; // Ждём справочники

      try {
        setLoading(true);
        const clientName = clientFilter
          ? clients.find((c) => c.id === clientFilter)?.name
          : undefined;

        const data = await getShipments(
          fromDate,
          toDate,
          shipmentNumber || undefined,
          clientName,
          resourceFilter.length > 0 ? resourceFilter : undefined,
          unitFilter.length > 0 ? unitFilter : undefined
        );
        setShipments(data);
      } catch (err) {
        setError("Не удалось загрузить отгрузки");
      } finally {
        setLoading(false);
      }
    };

    loadShipments();
  }, [
    fromDate,
    toDate,
    shipmentNumber,
    clientFilter,
    resourceFilter,
    unitFilter,
    resources,
    clients,
  ]);


  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
        "& > *": {
          flex: "1 1 calc(33.33% - 8px)",
          minWidth: {
            xs: "100%",
            sm: "calc(33.33% - 8px)",
            md: "calc(16.66% - 8px)",
          },
          maxWidth: {
            xs: "100%",
            sm: "calc(33.33% - 8px)",
            md: "calc(16.66% - 8px)",
          },
        },
      }}
    >
      {/* С */}
      <TextField
        label="С"
        type="date"
        value={fromDate ? fromDate.toISOString().split("T")[0] : ""}
        onChange={(e) =>
          setFromDate(e.target.value ? new Date(e.target.value) : null)
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
        disabled={loading}
      />

      {/* По */}
      <TextField
        label="По"
        type="date"
        value={toDate ? toDate.toISOString().split("T")[0] : ""}
        onChange={(e) =>
          setToDate(e.target.value ? new Date(e.target.value) : null)
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
        disabled={loading}
      />

      {/* Номер отгрузки */}
      <TextField
        label="Номер отгрузки"
        value={shipmentNumber}
        onChange={(e) => setShipmentNumber(e.target.value)}
        fullWidth
        disabled={loading}
      />

      {/* Клиент */}
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Клиент</InputLabel>
        <Select
          value={clientFilter}
          label="Клиент"
          onChange={(e) => setClientFilter(e.target.value as number)}
        >
          <MenuItem value="">Все</MenuItem>
          {clients.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Ресурс */}
      <TextField
        select
        label="Ресурс"
        value={resourceFilter}
        onChange={(e) =>
          setResourceFilter(
            typeof e.target.value === "string"
              ? [parseInt(e.target.value)]
              : e.target.value.map(Number)
          )
        }
        SelectProps={{ multiple: true }}
        fullWidth
        disabled={loading}
      >
        {resources.map((r) => (
          <MenuItem key={r.id} value={r.id}>
            {r.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Единица */}
      <TextField
        select
        label="Единица"
        value={unitFilter}
        onChange={(e) =>
          setUnitFilter(
            typeof e.target.value === "string"
              ? [parseInt(e.target.value)]
              : e.target.value.map(Number)
          )
        }
        SelectProps={{ multiple: true }}
        fullWidth
        disabled={loading}
      >
        {units.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default ShipmentsPage;
