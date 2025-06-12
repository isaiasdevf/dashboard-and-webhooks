/* eslint-disable */
"use client";

import * as React from "react";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Esquema de datos que define la estructura de cada fila en la tabla
// Define los tipos de datos que se esperan de la base de datos
export const schema = z.object({
  payload: z.object({
    id: z.number(),
    cvu: z.object({
      id: z.number(),
      cvu: z.string(),
    }),
    type: z.string(),
    amount: z.number(),
    origin: z.object({
      name: z.string(),
      taxId: z.string(),
      account: z.string(),
    }),
    status: z.string(),
    coelsa_id: z.string(),
  }),
});

// Componente para manejar el arrastre de filas
// Se utiliza para permitir reordenar las filas de la tabla
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Definición de las columnas de la tabla
// Cada objeto define cómo se muestra y comporta cada columna
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  // Columna para el manejador de arrastre
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.payload.id} />,
  },
  // Columna para selección de filas con checkbox
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Columnas de datos en el orden del ejemplo
  {
    accessorKey: "payload.id",
    header: "ID",
    cell: ({ row }) => (
      <div className="w-32">
        <div className="text-muted-foreground">
          {row.original.payload.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.cvu.id",
    header: "ID CVU",
    cell: ({ row }) => (
      <div className="w-32">
        <div className="text-muted-foreground">
          {row.original.payload.cvu.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.cvu.cvu",
    header: "CVU",
    cell: ({ row }) => (
      <div className="w-48">
        <div className="text-muted-foreground">
          {row.original.payload.cvu.cvu}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.type",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="w-32">
        <span className="text-muted-foreground">
          {row.original.payload.type}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "payload.amount",
    header: () => <div className="w-full text-right">Monto</div>,
    cell: ({ row }) => (
      <div className="text-right">
        ${row.original.payload.amount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "payload.origin.name",
    header: "Nombre Origen",
    cell: ({ row }) => (
      <div className="w-48">
        <div className="text-muted-foreground">
          {row.original.payload.origin.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.origin.taxId",
    header: "Tax ID Origen",
    cell: ({ row }) => (
      <div className="w-48">
        <div className="text-muted-foreground">
          {row.original.payload.origin.taxId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.origin.account",
    header: "Cuenta Origen",
    cell: ({ row }) => (
      <div className="w-48">
        <div className="text-muted-foreground">
          {row.original.payload.origin.account}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "payload.status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.payload.status === "Pending" ? "secondary" : "default"}>
        {row.original.payload.status}
      </Badge>
    ),
  },
  {
    accessorKey: "payload.coelsa_id",
    header: "Coelsa ID",
    cell: ({ row }) => (
      <div className="w-48">
        <div className="text-muted-foreground">
          {row.original.payload.coelsa_id}
        </div>
      </div>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.payload.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

// Componente principal de la tabla
// Recibe los datos iniciales como prop y maneja toda la lógica de la tabla
export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
  // Estados para manejar la funcionalidad de la tabla
  const [data, setData] = React.useState(() => initialData); // Datos actuales de la tabla
  
  // Para debugging
  React.useEffect(() => {
    console.log("DataTable received data:", initialData);
    console.log("Current data state:", data);
  }, [initialData, data]);

  const [rowSelection, setRowSelection] = React.useState({}); // Filas seleccionadas
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({}); // Visibilidad de columnas
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]); // Filtros de columnas
  const [sorting, setSorting] = React.useState<SortingState>([]); // Estado de ordenamiento
  const [pagination, setPagination] = React.useState({ // Configuración de paginación
    pageIndex: 0,
    pageSize: 10,
  });

  // Configuración para el arrastre y reordenamiento de filas
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ payload }) => payload.id) || [],
    [data]
  );

  // Configuración de la tabla usando TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.payload.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Manejador para el evento de finalización de arrastre
  // Actualiza el orden de las filas cuando se arrastra una fila a una nueva posición
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  // Renderizado de la tabla con todas sus funcionalidades
  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      {/* Encabezado de la tabla con título y opciones de columnas */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div className="@4xl/main:flex text-2xl">
          <span>Lista de transacciones</span>
        </div>
        {/* Menú desplegable para mostrar/ocultar columnas */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenedor principal de la tabla con funcionalidad de arrastrar y soltar */}
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            {/* Encabezados de la tabla */}
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            {/* Cuerpo de la tabla con las filas de datos */}
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.original.payload.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Pie de la tabla con controles de paginación */}
      <div className="flex items-center justify-between px-4">
        {/* Información de filas seleccionadas */}
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        {/* Controles de paginación */}
        <div className="flex w-full items-center gap-8 lg:w-fit">
          {/* Selector de filas por página */}
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Navegación entre páginas */}
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </Tabs>
  );
}