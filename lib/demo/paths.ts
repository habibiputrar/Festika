export const BASE_PATH=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
export function assetPath(value:string){return value.startsWith('/branding/')?BASE_PATH+value:value;}
