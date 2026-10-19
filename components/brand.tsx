import Image from 'next/image';
import Link from './motion-link';
import {safeUrl} from '@/lib/content-model';
import {assetPath} from '@/lib/demo/paths';
export function Brand({href='/',large=false,logo}:{href?:string;large?:boolean;logo?:string}){
 const source=assetPath(safeUrl(logo)||'/branding/Logo_Festika-04.webp');
 return <Link href={href} className={'brand '+(large?'brand-large':'')} aria-label="FESTIKA beranda"><Image src={source} alt="" width={large?96:52} height={large?96:52} priority unoptimized={source.startsWith('/media/')}/><span><strong>FEST<span>IKA</span></strong><small>Festival <b>INFORMATIKA</b></small></span></Link>;
}
