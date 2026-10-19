export function PaymentFormLink({url}:{url?:string}){
 if(!url)return null;
 try{const target=new URL(url);if(target.protocol!=='https:'||target.username||target.password||!(target.hostname==='forms.gle'||target.hostname==='docs.google.com'&&target.pathname.startsWith('/forms/')))return null;}
 catch{return null;}
 return <p className="field-hint"><a className="text-link" href={url} target="_blank" rel="noopener noreferrer">Google Form pembayaran (opsional)</a><br/>Bukti pembayaran tetap dapat diunggah melalui website.</p>;
}
