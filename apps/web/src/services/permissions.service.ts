import type { PermissionCatalogItem } from "@/types/permission";

export const PERMISSION_CATALOG: PermissionCatalogItem[] = [
  {
    key: "restaurants.manage",
    name: "Manage restaurants",
    description: "Create, update and deactivate restaurants"
  },
  {
    key: "branches.manage",
    name: "Manage branches",
    description: "Create, update and deactivate branches"
  },
  {
    key: "roles.manage",
    name: "Manage roles",
    description: "Manage restaurant roles, permissions and assignments"
  },
  {
    key: "users.manage",
    name: "Manage users",
    description: "Manage users within a restaurant"
  },
  {
    key: "menu.view",
    name: "View menu",
    description: "View restaurant menu categories and products"
  },
  {
    key: "menu.create",
    name: "Create menu items",
    description: "Create restaurant menu categories and products"
  },
  {
    key: "menu.update",
    name: "Update menu items",
    description: "Update restaurant menu categories and products"
  },
  {
    key: "menu.delete",
    name: "Delete menu items",
    description: "Deactivate restaurant menu categories and products"
  }
];

export const permissionsService = {
  list() {
    return Promise.resolve(PERMISSION_CATALOG);
  }
};
