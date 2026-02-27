export const DEMO_ORG = "nevada-demo";

export const ADMIN_USER = {
  email: "admin@nevada-demo.com",
  password: "demo1234",
  name: "Admin",
};

export const VENDEDOR_USER = {
  email: "vendedor@nevada-demo.com",
  password: "demo1234",
  name: "Vendedor",
};

export const CONSULTOR_USER = {
  email: "consultor@nevada-demo.com",
  password: "demo1234",
  name: "Consultor",
};

export const SEEDED_COUNTS = {
  categories: 13,
  warehouses: 5,
  products: 52,
  movements: 40,
  transfers: 20,
  sales: 100,
  returns: 20,
  users: 7,
  roles: 7,
  auditLogs: 500,
};

export const AUTH_STORAGE = {
  admin: "tests/e2e/.auth/admin.json",
  vendedor: "tests/e2e/.auth/vendedor.json",
  consultor: "tests/e2e/.auth/consultor.json",
};
