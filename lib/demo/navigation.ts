'use client';
export function navigate(path:string){window.dispatchEvent(new CustomEvent('festika-demo:navigate',{detail:path}));}
