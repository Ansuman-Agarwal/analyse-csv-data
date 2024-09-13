import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type React from "react";
import { useMemo } from "react";

type DataItem = Record<string, string | number>;

interface DynamicTableProps {
  data: DataItem[];
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ data }) => {
  const columns = useMemo<MRT_ColumnDef<DataItem>[]>(() => {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);

    return keys.map((key) => {
      return {
        field: key,
        header: key,
        accessorKey: key,
        type: typeof data[0][key] === "number" ? "number" : "string",
      };
    });
  }, [data]);

  return <MaterialReactTable columns={columns} data={data} />;
};
