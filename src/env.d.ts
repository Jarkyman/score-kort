/// <reference types="@cloudflare/workers-types" />

declare module "*.svg" {
    const src: string;
    export default src;
}
