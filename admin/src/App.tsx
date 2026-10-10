import {lazy,Suspense} from "react";
const AdminApp=lazy(()=>import("@/features/admin/AdminApp"));
export default function App(){return <Suspense fallback={<p>Loading administration…</p>}><AdminApp/></Suspense>;}
