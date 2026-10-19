export function LocationMap({address,compact=false}:{address:string;compact?:boolean}){
 if(!address.trim())return null;
 return <div className={'location-map'+(compact?' compact':'')}><iframe title="Lokasi Fakultas Teknologi Informasi Universitas Andalas" src={'https://maps.google.com/maps?q='+encodeURIComponent(address)+'&output=embed'} width="600" height={compact?190:300} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address)} target="_blank" rel="noopener noreferrer">Lihat rute ke lokasi</a></div>;
}
