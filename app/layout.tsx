import type {Metadata} from 'next';
import {ThemeProvider,themeScript} from '@/components/theme';
import {NavigationMotion} from '@/components/navigation-motion';
import {assetPath} from '@/lib/demo/paths';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import './festival.css';
import './motion.css';
import './schedule.css';
import './demo.css';
export const metadata:Metadata={title:{default:'FESTIKA UNAND — Demo',template:'%s | FESTIKA Demo'},description:'Demo interaktif website FESTIKA UNAND dengan akun peserta, panitia, dan admin. Data tersimpan di browser.',robots:{index:false,follow:false},icons:{icon:assetPath('/branding/Logo_Festika-04.webp')}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body><ThemeProvider initial="system"><NavigationMotion><a className="skip-link" href="#main-content">Lewati ke konten</a>{children}</NavigationMotion></ThemeProvider></body></html>;}
