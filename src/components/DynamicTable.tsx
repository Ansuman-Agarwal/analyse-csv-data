import { ChevronLeft, Menu as MenuIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import { useCallback, useMemo, useState } from "react";

type DataItem = Record<string, string | number>;

interface DynamicTableProps {
  data: DataItem[];
}

interface Filter {
  id: string;
  value: string | number | [number, number];
}

const drawerWidth = 300;

const GradientTypography = styled(Typography)({
  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(1);
};

export const DynamicTable: React.FC<DynamicTableProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [grouping, setGrouping] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<
    string | number | [number, number]
  >("");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [editingFilter, setEditingFilter] = useState<string | null>(null);

  const isColumnNumeric = useCallback(
    (columnId: string): boolean => {
      return data.length > 0 && typeof data[0][columnId] === "number";
    },
    [data]
  );

  const getColumnRange = useCallback(
    (columnId: string): [number, number] => {
      if (!isColumnNumeric(columnId)) return [0, 100];
      const values = data.map((item) => item[columnId] as number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      return [min - range * 0.1, max + range * 0.1];
    },
    [data, isColumnNumeric]
  );

  const columns = useMemo<MRT_ColumnDef<DataItem>[]>(() => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      filterFn: (row, id, filterValue) => {
        const cellValue = row.getValue(id);
        if (isColumnNumeric(id) && Array.isArray(filterValue)) {
          const numValue = Number.parseFloat(cellValue as string);
          return numValue >= filterValue[0] && numValue <= filterValue[1];
        }
        return (cellValue as string)
          .toLowerCase()
          .includes((filterValue as string).toLowerCase());
      },
    }));
  }, [data, isColumnNumeric]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === undefined ? false : !prev[columnId],
    }));
  };

  const handleGroupingChange = (columnId: string) => {
    setGrouping((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleFilterColumnChange = (event: SelectChangeEvent<string>) => {
    const columnId = event.target.value;
    setSelectedFilterColumn(columnId);
    if (isColumnNumeric(columnId)) {
      const [min, max] = getColumnRange(columnId);
      setFilterValue([min, max]);
    } else {
      setFilterValue("");
    }
  };

  const handleFilterValueChange = (
    event: React.ChangeEvent<HTMLInputElement> | Event,
    newValue: number | number[]
  ) => {
    if (Array.isArray(newValue)) {
      setFilterValue(newValue as [number, number]);
    } else if (typeof event === "object" && "target" in event) {
      setFilterValue(
        (event as React.ChangeEvent<HTMLInputElement>).target.value
      );
    }
  };

  const applyFilter = () => {
    if (selectedFilterColumn && filterValue !== "") {
      const newFilter = {
        id: selectedFilterColumn,
        value: filterValue,
      };
      setActiveFilters((prev) => [
        ...prev.filter((f) => f.id !== selectedFilterColumn),
        newFilter,
      ]);
      updateColumnFilters([
        ...activeFilters.filter((f) => f.id !== selectedFilterColumn),
        newFilter,
      ]);
      setSelectedFilterColumn("");
      setFilterValue("");
      setEditingFilter(null);
    }
  };

  const editFilter = (filterId: string) => {
    const filter = activeFilters.find((f) => f.id === filterId);
    if (filter) {
      setSelectedFilterColumn(filter.id);
      setFilterValue(filter.value);
      setEditingFilter(filterId);
    }
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
    updateColumnFilters(activeFilters.filter((f) => f.id !== filterId));
    if (editingFilter === filterId) {
      setEditingFilter(null);
      setSelectedFilterColumn("");
      setFilterValue("");
    }
  };

  const updateColumnFilters = (filters: Filter[]) => {
    const newColumnFilters = filters.map((filter) => ({
      id: filter.id,
      value: filter.value,
    }));
    setColumnFilters(newColumnFilters);
  };

  const sidebarContent = (
    <Box
      sx={{
        width: isSidebarOpen ? drawerWidth : 0,
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <GradientTypography variant="h5">Table Controls</GradientTypography>
        <IconButton onClick={toggleSidebar}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <TextField
          size="small"
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Filters
        </Typography>
        <Box sx={{ mb: 2, mx: 4 }}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.id}: ${
                Array.isArray(filter.value)
                  ? `${formatNumber(filter.value[0])} - ${formatNumber(
                      filter.value[1]
                    )}`
                  : filter.value
              }`}
              onDelete={() => removeFilter(filter.id)}
              onClick={() => editFilter(filter.id)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>Select Column</InputLabel>
          <Select
            value={selectedFilterColumn}
            label="Select Column"
            onChange={handleFilterColumnChange}
          >
            {columns.map((column) => (
              <MenuItem
                key={column.accessorKey as string}
                value={column.accessorKey as string}
              >
                {column.header as string}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedFilterColumn && (
          <Box sx={{ mb: 2 }}>
            {isColumnNumeric(selectedFilterColumn) ? (
              <Box>
                <Slider
                  value={filterValue as [number, number]}
                  onChange={handleFilterValueChange}
                  valueLabelDisplay="auto"
                  min={getColumnRange(selectedFilterColumn)[0]}
                  max={getColumnRange(selectedFilterColumn)[1]}
                  step={
                    (getColumnRange(selectedFilterColumn)[1] -
                      getColumnRange(selectedFilterColumn)[0]) /
                    100
                  }
                  valueLabelFormat={formatNumber}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="caption">
                    Min :{" "}
                    {formatNumber(getColumnRange(selectedFilterColumn)[0])}
                  </Typography>
                  <Typography variant="caption">
                    Max :{" "}
                    {formatNumber(getColumnRange(selectedFilterColumn)[1])}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <TextField
                size="small"
                fullWidth
                label="Filter Value"
                variant="outlined"
                value={filterValue as string}
                onChange={
                  handleFilterValueChange as (
                    event: React.ChangeEvent<HTMLInputElement>
                  ) => void
                }
              />
            )}
          </Box>
        )}
        <Button variant="contained" onClick={applyFilter} fullWidth>
          {editingFilter ? "Update Filter" : "Apply Filter"}
        </Button>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Visibility
        </Typography>
        <List disablePadding>
          {columns.map((column) => (
            <ListItem
              key={`visibility-${column.accessorKey as string}`}
              disablePadding
            >
              <ListItemText primary={column.header as string} />
              <Switch
                edge="end"
                onChange={() =>
                  handleColumnVisibilityChange(column.accessorKey as string)
                }
                checked={
                  columnVisibility[column.accessorKey as string] !== false
                }
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Grouping
        </Typography>
        <List disablePadding>
          {columns.map((column) => (
            <ListItem
              key={`grouping-${column.accessorKey as string}`}
              disablePadding
            >
              <ListItemText primary={column.header as string} />
              <Switch
                edge="end"
                onChange={() =>
                  handleGroupingChange(column.accessorKey as string)
                }
                checked={grouping.includes(column.accessorKey as string)}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={isSidebarOpen}
        onClose={isMobile ? toggleSidebar : undefined}
        sx={{
          width: isSidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? drawerWidth : 0,
            boxSizing: "border-box",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          width: isMobile ? "100%" : "100vw",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
          {!isSidebarOpen && (
            <IconButton onClick={toggleSidebar} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <GradientTypography variant="h5">CSV Data Table</GradientTypography>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <MaterialReactTable
            columns={columns}
            data={data}
            enableColumnFilters
            enableDensityToggle
            enableFullScreenToggle
            enableColumnActions
            enableHiding
            enableColumnResizing
            enableColumnOrdering
            enableRowSelection
            enableRowActions
            enableGrouping
            state={{
              columnVisibility,
              grouping,
              globalFilter: searchTerm,
              columnFilters,
            }}
            onColumnVisibilityChange={setColumnVisibility}
            onGroupingChange={setGrouping}
            onGlobalFilterChange={setSearchTerm}
            onColumnFiltersChange={setColumnFilters}
            positionToolbarAlertBanner="bottom"
            muiTableContainerProps={{
              sx: { maxHeight: "100%", width: "100%", m: 0, border: "black" },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
