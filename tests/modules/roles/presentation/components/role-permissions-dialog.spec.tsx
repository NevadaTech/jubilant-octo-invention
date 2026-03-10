import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RolePermissionsDialog } from "@/modules/roles/presentation/components/role-permissions-dialog";
import { Role } from "@/modules/roles/domain/entities/role.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = (key: string) => key !== "names.CUSTOM_ROLE";
    return t;
  },
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}));

const mockMutateAsync = vi.fn().mockResolvedValue({});
let mockAssignPending = false;

let mockAllPermissions: {
  data:
    | Array<{
        id: string;
        name: string;
        description: string | null;
        module: string;
        action: string;
      }>
    | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

let mockRolePermissions: {
  data:
    | Array<{
        id: string;
        name: string;
        description: string | null;
        module: string;
        action: string;
      }>
    | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

vi.mock("@/modules/roles/presentation/hooks/use-roles", () => ({
  usePermissions: () => mockAllPermissions,
  useRolePermissions: () => mockRolePermissions,
  useAssignPermissions: () => ({
    isPending: mockAssignPending,
    mutateAsync: mockMutateAsync,
  }),
}));

// --- Helpers ---

function makeRole(
  overrides: Partial<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    isSystem: boolean;
  }> = {},
): Role {
  return new Role({
    id: overrides.id ?? "role-1",
    name: overrides.name ?? "ADMIN",
    description: overrides.description ?? "Administrator role",
    isActive: overrides.isActive ?? true,
    isSystem: overrides.isSystem ?? false,
    permissions: [],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  });
}

function makePerm(
  module: string,
  action: string,
  id?: string,
): {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
} {
  return {
    id: id ?? `${module}:${action}`,
    name: `${module}:${action}`,
    description: null,
    module,
    action,
  };
}

// --- Tests ---

describe("RolePermissionsDialog", () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAllPermissions = { data: undefined, isLoading: false };
    mockRolePermissions = { data: undefined, isLoading: false };
    mockAssignPending = false;
  });

  // --- Dialog open/close ---

  it("Given: open is false When: rendering Then: should not render the dialog", () => {
    const role = makeRole();
    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it("Given: open is true with role When: rendering Then: should display dialog title with translated role name", () => {
    const role = makeRole({ name: "ADMIN" });
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toContain("permissions.title");
    // t.has("names.ADMIN") returns true, so t("names.ADMIN") = "names.ADMIN"
    expect(title.textContent).toContain("names.ADMIN");
  });

  it("Given: role with name that has no translation When: rendering Then: should use raw role name", () => {
    const role = makeRole({ name: "CUSTOM_ROLE" });
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const title = screen.getByTestId("dialog-title");
    // t.has("names.CUSTOM_ROLE") returns false, so fallback is role.name = "CUSTOM_ROLE"
    expect(title.textContent).toContain("CUSTOM_ROLE");
  });

  it("Given: role is null When: rendering Then: roleName should be empty", () => {
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={null}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const title = screen.getByTestId("dialog-title");
    expect(title.textContent).toContain("permissions.title");
    expect(title.textContent).toContain(" — ");
  });

  // --- Loading states ---

  it("Given: allPermissions is loading When: rendering Then: should display skeleton placeholders", () => {
    const role = makeRole();
    mockAllPermissions = { data: undefined, isLoading: true };
    mockRolePermissions = { data: undefined, isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(4);
  });

  it("Given: rolePermissions is loading When: rendering Then: should display skeleton placeholders", () => {
    const role = makeRole();
    mockAllPermissions = { data: undefined, isLoading: false };
    mockRolePermissions = { data: undefined, isLoading: true };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(4);
  });

  // --- Empty state ---

  it("Given: no permissions available When: rendering Then: should display empty state message", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText("permissions.noPermissions")).toBeInTheDocument();
  });

  // --- Permissions grouped by module ---

  it("Given: permissions from multiple modules When: rendering Then: should group by module and show module labels", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
      makePerm("SALES", "READ", "p3"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(
      screen.getByText("permissions.modules.inventory"),
    ).toBeInTheDocument();
    expect(screen.getByText("permissions.modules.sales")).toBeInTheDocument();
    const readElements = screen.getAllByText("permissions.actions.READ");
    expect(readElements.length).toBe(2);
    expect(screen.getByText("permissions.actions.CREATE")).toBeInTheDocument();
  });

  it("Given: permissions loaded When: rendering Then: should show count of selected per module", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    // p1 is pre-selected via rolePermissions
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Should show "1/2" for INVENTORY module
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it("Given: rolePermissions returned When: rendering Then: should initialize selection from role permissions", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Footer shows selected count
    expect(screen.getByText(/1 fields.permissions/i)).toBeInTheDocument();
  });

  // --- readOnly mode ---

  it("Given: readOnly is true When: rendering Then: should show close button instead of cancel and save", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={true}
      />,
    );

    expect(screen.getByText("close")).toBeInTheDocument();
    expect(screen.queryByText("save")).not.toBeInTheDocument();
    expect(screen.queryByText("cancel")).not.toBeInTheDocument();
  });

  it("Given: readOnly is false When: rendering Then: should show cancel and save buttons", () => {
    const role = makeRole();
    mockAllPermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={false}
      />,
    );

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("save")).toBeInTheDocument();
    expect(screen.queryByText("close")).not.toBeInTheDocument();
  });

  it("Given: readOnly is true When: clicking close Then: should call onOpenChange(false)", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={true}
      />,
    );

    fireEvent.click(screen.getByText("close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Given: readOnly is true When: clicking module toggle Then: should NOT change selection", () => {
    const role = makeRole();
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={true}
      />,
    );

    // Module toggle button is disabled in readOnly mode
    const moduleButton = screen
      .getByText("permissions.modules.inventory")
      .closest("button")!;
    expect(moduleButton).toBeDisabled();
  });

  it("Given: readOnly is true When: clicking permission checkbox Then: should NOT toggle", () => {
    const role = makeRole();
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={true}
      />,
    );

    // The checkbox div and span have onClick that checks readOnly
    // Count should remain 0
    const actionSpan = screen.getByText("permissions.actions.READ");
    fireEvent.click(actionSpan);
    expect(screen.getByText(/0 fields.permissions/i)).toBeInTheDocument();
  });

  // --- Toggle permission ---

  it("Given: permission not selected When: clicking permission checkbox Then: should add it to selection", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Initially 0 selected
    expect(screen.getByText(/0 fields.permissions/i)).toBeInTheDocument();

    // Click the READ action span to select it
    const actionSpan = screen.getAllByText("permissions.actions.READ")[0];
    fireEvent.click(actionSpan);

    expect(screen.getByText(/1 fields.permissions/i)).toBeInTheDocument();
  });

  it("Given: permission already selected When: clicking its checkbox div Then: should remove it from selection", () => {
    const role = makeRole();
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Initially 1 selected
    expect(screen.getByText(/1 fields.permissions/i)).toBeInTheDocument();

    // Click the checkbox div (onClick handler) to deselect
    const checkboxDivs = container.querySelectorAll(
      ".border-t label > div:first-child",
    );
    fireEvent.click(checkboxDivs[0]);

    expect(screen.getByText(/0 fields.permissions/i)).toBeInTheDocument();
  });

  // --- Toggle module ---

  it("Given: no permissions selected in module When: clicking module header Then: should select all in module", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Initially 0/2
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();

    const moduleButton = screen
      .getByText("permissions.modules.inventory")
      .closest("button")!;
    fireEvent.click(moduleButton);

    // Now 2/2
    expect(screen.getByText(/2\/2/)).toBeInTheDocument();
    expect(screen.getByText(/2 fields.permissions/i)).toBeInTheDocument();
  });

  it("Given: all permissions selected in module When: clicking module header Then: should deselect all in module", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [
        makePerm("INVENTORY", "READ", "p1"),
        makePerm("INVENTORY", "CREATE", "p2"),
      ],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Initially 2/2
    expect(screen.getByText(/2\/2/)).toBeInTheDocument();

    const moduleButton = screen
      .getByText("permissions.modules.inventory")
      .closest("button")!;
    fireEvent.click(moduleButton);

    // Now 0/2
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();
    expect(screen.getByText(/0 fields.permissions/i)).toBeInTheDocument();
  });

  it("Given: some (not all) permissions selected in module When: clicking module header Then: should select all in module", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
      makePerm("INVENTORY", "UPDATE", "p3"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Initially 1/3
    expect(screen.getByText(/1\/3/)).toBeInTheDocument();

    const moduleButton = screen
      .getByText("permissions.modules.inventory")
      .closest("button")!;
    fireEvent.click(moduleButton);

    // Now 3/3 (all selected since someSelected but not allSelected)
    expect(screen.getByText(/3\/3/)).toBeInTheDocument();
  });

  // --- Save / handleSave ---

  it("Given: no permissions selected When: rendering Then: save button should be disabled", () => {
    const role = makeRole();
    mockAllPermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
        readOnly={false}
      />,
    );

    const saveButton = screen.getByText("save").closest("button")!;
    expect(saveButton).toBeDisabled();
  });

  it("Given: permissions selected When: clicking save Then: should call assignPermissions and close dialog", async () => {
    const role = makeRole({ id: "role-123" });
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockMutateAsync.mockResolvedValue({});

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const saveButton = screen.getByText("save").closest("button")!;
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: "role-123",
        data: { permissionIds: ["p1"] },
      });
    });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("Given: save fails When: clicking save Then: should not close dialog", async () => {
    const role = makeRole({ id: "role-123" });
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockMutateAsync.mockRejectedValue(new Error("fail"));

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    // onOpenChange should NOT have been called because the catch block eats the error
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("Given: cancel button clicked When: not readOnly Then: should call onOpenChange(false)", () => {
    const role = makeRole();
    mockAllPermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByText("cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // --- assignPermissions.isPending ---

  it("Given: assignPermissions isPending When: rendering Then: should show loading text and disabled save button", () => {
    const role = makeRole();
    mockAssignPending = true;
    mockAllPermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.queryByText("save")).not.toBeInTheDocument();
    const loadingButton = screen.getByText("loading").closest("button")!;
    expect(loadingButton).toBeDisabled();
  });

  // --- allSelected / someSelected / none checkbox styles ---

  it("Given: all permissions selected in module When: rendering Then: module checkbox should have primary styling", () => {
    const role = makeRole();
    const perms = [makePerm("INVENTORY", "READ", "p1")];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = {
      data: [makePerm("INVENTORY", "READ", "p1")],
      isLoading: false,
    };

    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Module header checkbox div should have bg-primary class for allSelected
    const moduleCheckbox = container.querySelector(
      "button .bg-primary.border-primary",
    );
    expect(moduleCheckbox).not.toBeNull();
  });

  it("Given: no permissions selected in module When: rendering Then: module checkbox should have muted styling", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Module checkbox should have only border-muted-foreground class (none selected)
    const moduleCheckbox = container.querySelector(
      "button .border-muted-foreground\\/30",
    );
    expect(moduleCheckbox).not.toBeNull();
  });

  // --- Footer selected count ---

  it("Given: 3 permissions selected When: rendering Then: footer should show count", () => {
    const role = makeRole();
    const perms = [
      makePerm("INVENTORY", "READ", "p1"),
      makePerm("INVENTORY", "CREATE", "p2"),
      makePerm("SALES", "READ", "p3"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: perms, isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText(/3 fields.permissions/i)).toBeInTheDocument();
  });

  // --- Description ---

  it("Given: dialog open When: rendering Then: should show permissions description", () => {
    const role = makeRole();
    mockAllPermissions = { data: [], isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText("permissions.description")).toBeInTheDocument();
  });

  // --- Modules sorted alphabetically ---

  it("Given: permissions from modules Z and A When: rendering Then: should sort modules alphabetically", () => {
    const role = makeRole();
    const perms = [
      makePerm("ZETA", "READ", "p1"),
      makePerm("ALPHA", "READ", "p2"),
    ];
    mockAllPermissions = { data: perms, isLoading: false };
    mockRolePermissions = { data: [], isLoading: false };

    const { container } = render(
      <RolePermissionsDialog
        role={role}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const moduleLabels = container.querySelectorAll(
      "button .font-medium.text-sm",
    );
    const texts = Array.from(moduleLabels).map((el) => el.textContent);
    expect(texts[0]).toBe("permissions.modules.alpha");
    expect(texts[1]).toBe("permissions.modules.zeta");
  });
});
