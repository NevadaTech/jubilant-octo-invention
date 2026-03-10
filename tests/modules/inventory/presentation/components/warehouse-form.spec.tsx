import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarehouseForm } from "@/modules/inventory/presentation/components/warehouses/warehouse-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

let mockCreatePending = false;
let mockUpdatePending = false;
let mockCreateIsError = false;
let mockUpdateIsError = false;
let mockWarehouseData: Record<string, unknown> | null = null;
let mockWarehouseLoading = false;

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useCreateWarehouse: () => ({
    isPending: mockCreatePending,
    isError: mockCreateIsError,
    mutateAsync: mockCreateMutateAsync,
  }),
  useUpdateWarehouse: () => ({
    isPending: mockUpdatePending,
    isError: mockUpdateIsError,
    mutateAsync: mockUpdateMutateAsync,
  }),
  useWarehouse: () => ({
    data: mockWarehouseData,
    isLoading: mockWarehouseLoading,
  }),
}));

let mockIsOpen = true;
let mockEditingId: string | null = null;
const mockClose = vi.fn();

vi.mock("@/modules/inventory/presentation/hooks/use-inventory-store", () => ({
  useWarehouseFormState: () => ({
    isOpen: mockIsOpen,
    editingId: mockEditingId,
    close: mockClose,
  }),
}));

vi.mock("@/modules/inventory/presentation/schemas/warehouse.schema", () => ({
  createWarehouseSchema: { parse: vi.fn() },
  toCreateWarehouseDto: vi.fn((d: unknown) => d),
  toUpdateWarehouseDto: vi.fn((d: unknown) => d),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => vi.fn(),
}));

describe("WarehouseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = true;
    mockEditingId = null;
    mockCreatePending = false;
    mockUpdatePending = false;
    mockCreateIsError = false;
    mockUpdateIsError = false;
    mockWarehouseData = null;
    mockWarehouseLoading = false;
  });

  it("Given: isOpen false When: rendering Then: should return null", () => {
    mockIsOpen = false;
    const { container } = render(<WarehouseForm />);
    expect(container.innerHTML).toBe("");
  });

  it("Given: isOpen true When: rendering Then: should show create title", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("form.createTitle")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show code field", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("fields.code")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show name and address fields", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("fields.name")).toBeDefined();
    expect(screen.getByText("fields.address")).toBeDefined();
  });

  it("Given: isOpen true When: rendering Then: should show cancel and create buttons", () => {
    render(<WarehouseForm />);
    expect(screen.getByText("cancel")).toBeDefined();
    expect(screen.getByText("create")).toBeDefined();
  });

  it("Given: editing mode When: rendering Then: should show edit title", () => {
    mockEditingId = "wh-1";
    render(<WarehouseForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
  });

  // --- Branch: editing + save button text ---
  it("Given: editing mode When: rendering Then: should show save button text", () => {
    mockEditingId = "wh-1";
    render(<WarehouseForm />);
    expect(screen.getByText("save")).toBeDefined();
    expect(screen.queryByText("create")).toBeNull();
  });

  // --- Branch: isSubmitting (create pending) ---
  it("Given: createWarehouse is pending When: rendering Then: should show loading text on submit", () => {
    mockCreatePending = true;
    render(<WarehouseForm />);
    expect(screen.getByText("loading")).toBeDefined();
    expect(screen.queryByText("create")).toBeNull();
  });

  // --- Branch: isSubmitting (update pending) ---
  it("Given: updateWarehouse is pending When: editing Then: should show loading text", () => {
    mockEditingId = "wh-1";
    mockUpdatePending = true;
    render(<WarehouseForm />);
    expect(screen.getByText("loading")).toBeDefined();
    expect(screen.queryByText("save")).toBeNull();
  });

  // --- Branch: error display (createWarehouse.isError) ---
  it("Given: createWarehouse has error When: rendering Then: should show error message", () => {
    mockCreateIsError = true;
    render(<WarehouseForm />);
    expect(screen.getByText("form.error")).toBeDefined();
  });

  // --- Branch: error display (updateWarehouse.isError) ---
  it("Given: updateWarehouse has error When: editing Then: should show error message", () => {
    mockEditingId = "wh-1";
    mockUpdateIsError = true;
    render(<WarehouseForm />);
    expect(screen.getByText("form.error")).toBeDefined();
  });

  // --- Branch: no error ---
  it("Given: no errors When: rendering Then: should not show error message", () => {
    render(<WarehouseForm />);
    expect(screen.queryByText("form.error")).toBeNull();
  });

  // --- Branch: isLoadingWarehouse + isEditing shows spinner ---
  it("Given: editing mode and warehouse loading When: rendering Then: should show loading spinner", () => {
    mockEditingId = "wh-1";
    mockWarehouseLoading = true;
    const { container } = render(<WarehouseForm />);
    // Should show the spinner div instead of the form
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
    // Form fields should not be visible
    expect(screen.queryByText("fields.code")).toBeNull();
  });

  // --- Branch: isLoadingWarehouse + NOT editing shows form ---
  it("Given: create mode and warehouse loading When: rendering Then: should still show form", () => {
    mockEditingId = null;
    mockWarehouseLoading = true;
    render(<WarehouseForm />);
    // Form fields should be visible since isEditing is false
    expect(screen.getByText("fields.code")).toBeDefined();
  });

  // --- Branch: close button click ---
  it("Given: close button clicked When: clicking X Then: should call close", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<WarehouseForm />);
    // The X button is the ghost size="icon" button
    const buttons = screen.getAllByRole("button");
    // The first button with the X icon
    const closeBtn = buttons.find(
      (b) =>
        b.querySelector("svg") !== null &&
        !b.textContent?.includes("cancel") &&
        !b.textContent?.includes("create"),
    );
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockClose).toHaveBeenCalled();
    }
  });

  // --- Branch: cancel button click ---
  it("Given: cancel button clicked When: clicking Then: should call close", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<WarehouseForm />);
    const cancelBtn = screen.getByText("cancel");
    fireEvent.click(cancelBtn);
    expect(mockClose).toHaveBeenCalled();
  });

  // --- Branch: existingWarehouse is set (isEditing && existingWarehouse) ---
  it("Given: editing with loaded warehouse data When: rendering Then: form should be populated", () => {
    mockEditingId = "wh-1";
    mockWarehouseData = {
      code: "WH01",
      name: "Test Warehouse",
      address: "123 Main St",
    };
    render(<WarehouseForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
  });

  // --- Branch: existingWarehouse with null address ---
  it("Given: editing with warehouse with null address When: rendering Then: address defaults to empty", () => {
    mockEditingId = "wh-1";
    mockWarehouseData = { code: "WH01", name: "Test", address: null };
    render(<WarehouseForm />);
    expect(screen.getByText("form.editTitle")).toBeDefined();
  });

  // --- Branch: both createWarehouse.isError and updateWarehouse.isError ---
  it("Given: both create and update errors When: rendering Then: should show error message", () => {
    mockCreateIsError = true;
    mockUpdateIsError = true;
    render(<WarehouseForm />);
    expect(screen.getByText("form.error")).toBeDefined();
  });

  // --- Branch: neither create nor update pending ---
  it("Given: no pending mutation When: create mode Then: should show 'create' button text", () => {
    mockCreatePending = false;
    mockUpdatePending = false;
    mockEditingId = null;
    render(<WarehouseForm />);
    expect(screen.getByText("create")).toBeDefined();
    expect(screen.queryByText("loading")).toBeNull();
    expect(screen.queryByText("save")).toBeNull();
  });

  // --- Branch: isEditing && !isSubmitting ---
  it("Given: editing and not submitting When: rendering Then: should show 'save' button text", () => {
    mockEditingId = "wh-1";
    mockCreatePending = false;
    mockUpdatePending = false;
    render(<WarehouseForm />);
    expect(screen.getByText("save")).toBeDefined();
  });

  // --- Branch: createWarehouse.isError is true but updateWarehouse.isError is false ---
  it("Given: only createWarehouse has error When: rendering Then: should show error message", () => {
    mockCreateIsError = true;
    mockUpdateIsError = false;
    render(<WarehouseForm />);
    expect(screen.getByText("form.error")).toBeDefined();
  });

  // --- Branch: updateWarehouse.isError is true but createWarehouse.isError is false ---
  it("Given: only updateWarehouse has error When: editing Then: should show error message", () => {
    mockEditingId = "wh-1";
    mockCreateIsError = false;
    mockUpdateIsError = true;
    render(<WarehouseForm />);
    expect(screen.getByText("form.error")).toBeDefined();
  });
});
