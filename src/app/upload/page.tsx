"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  useTheme,
  styled,
} from "@mui/material";
import { Upload as UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const UploadPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(8),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.background.default,
  },
}));

const GradientTypography = styled(Typography)({
  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

export default function FileUpload() {
  const router = useRouter();
  const theme = useTheme();

  const GetFileData = (file: File) => {
    Papa.parse<Record<string, string | number>>(file, {
      header: true,
      dynamicTyping: true, // This enables automatic type conversion
      complete: (results) => {
        // Additional step to ensure numeric values are properly parsed
        const parsedData = results.data.map((row) => {
          const newRow: Record<string, string | number> = {};
          for (const [key, value] of Object.entries(row)) {
            if (typeof value === "string") {
              const num = Number(value);
              if (!Number.isNaN(num)) {
                newRow[key] = num;
              } else {
                newRow[key] = value;
              }
            } else {
              newRow[key] = value;
            }
          }
          return newRow;
        });

        console.log(parsedData);
        localStorage.setItem("data", JSON.stringify(parsedData));
        router.push("/dataTable");
      },
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      GetFileData(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  });

  return (
    <Container
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GradientTypography variant="h4" gutterBottom align="center">
        Upload Your CSV File
      </GradientTypography>
      <Typography
        variant="subtitle1"
        gutterBottom
        align="center"
        color="text.secondary"
      >
        Drag & drop your file or click to browse
      </Typography>
      <UploadPaper
        elevation={3}
        {...getRootProps()}
        sx={{
          backgroundColor: isDragActive
            ? theme.palette.primary.light
            : "transparent",
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon size={48} color={theme.palette.primary.main} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isDragActive
            ? "Drop the file here..."
            : "Drag & drop a CSV file here, or click to select"}
        </Typography>
      </UploadPaper>
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          {...getRootProps()}
          sx={{
            background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
            color: "white",
            px: 4,
            py: 1,
          }}
        >
          Select File
        </Button>
      </Box>
    </Container>
  );
}
