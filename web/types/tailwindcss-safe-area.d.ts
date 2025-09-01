import type { PluginCreator } from "tailwindcss";

declare module "tailwindcss-safe-area" {
  const safeArea: PluginCreator<unknown>;
  export default safeArea;
}
