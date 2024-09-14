"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import { DynamicTable } from "@/components/DynamicTable";
export default function TablePage() {
  const [data, setData] = useState<Record<string, string | number>[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("data");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  return (
    <Container sx={{ width: "full", height: "100%", m: 0 }}>
      {data.length > 0 ? (
        <DynamicTable data={data} />
      ) : (
        <Typography variant="body1" align="center">
          No data available. Please upload a CSV file.
        </Typography>
      )}
    </Container>
  );
}
