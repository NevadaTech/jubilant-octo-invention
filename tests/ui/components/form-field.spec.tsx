import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/ui/components/form-field";

describe("FormField", () => {
  it("Given: no error/success/warning When: rendering Then: should render children without a message", () => {
    // Arrange & Act
    render(
      <FormField>
        <input placeholder="name" />
      </FormField>,
    );

    // Assert
    expect(screen.getByPlaceholderText("name")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("Given: no error/success/warning When: rendering Then: should not set data-state attribute", () => {
    // Arrange & Act
    const { container } = render(
      <FormField>
        <input />
      </FormField>,
    );

    // Assert
    expect(container.firstChild).not.toHaveAttribute("data-state");
  });

  it("Given: an error message When: rendering Then: should display the error and set data-state to error", () => {
    // Arrange & Act
    const { container } = render(
      <FormField error="This field is required">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This field is required");
    expect(container.firstChild).toHaveAttribute("data-state", "error");
  });

  it("Given: an error message When: rendering Then: should apply error text color class", () => {
    // Arrange & Act
    render(
      <FormField error="Required">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-error-600");
  });

  it("Given: a success message When: rendering Then: should display the success message and set data-state", () => {
    // Arrange & Act
    const { container } = render(
      <FormField success="Looks good!">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Looks good!");
    expect(container.firstChild).toHaveAttribute("data-state", "success");
    expect(alert.className).toContain("text-success-600");
  });

  it("Given: a warning message When: rendering Then: should display the warning message and set data-state", () => {
    // Arrange & Act
    const { container } = render(
      <FormField warning="Be careful">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Be careful");
    expect(container.firstChild).toHaveAttribute("data-state", "warning");
    expect(alert.className).toContain("text-warning-600");
  });

  it("Given: error and success both provided When: rendering Then: error should take priority", () => {
    // Arrange & Act
    const { container } = render(
      <FormField error="Error message" success="Success message">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Error message");
    expect(container.firstChild).toHaveAttribute("data-state", "error");
  });

  it("Given: success and warning both provided When: rendering Then: success should take priority", () => {
    // Arrange & Act
    const { container } = render(
      <FormField success="Success" warning="Warning">
        <input />
      </FormField>,
    );

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Success");
    expect(container.firstChild).toHaveAttribute("data-state", "success");
  });

  it("Given: a custom className When: rendering Then: should merge with default classes", () => {
    // Arrange & Act
    const { container } = render(
      <FormField className="mt-4">
        <input />
      </FormField>,
    );

    // Assert
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("mt-4");
    expect(wrapper.className).toContain("space-y-2");
  });
});
