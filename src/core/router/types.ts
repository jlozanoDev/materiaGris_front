declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    permissions?: string | string[];
    permissionsMode?: "any" | "all";
  }
}
