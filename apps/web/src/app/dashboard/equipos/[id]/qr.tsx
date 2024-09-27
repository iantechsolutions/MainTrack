'use client'
import Image from "next/image";
import QRCode from "qrcode";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function EquipoQr() {
    const [qrUrlData, setQrUrlData] = useState<null | string>(null);

    return <>
        <Button onClick={() => {
            QRCode.toDataURL(`https://example.com`, (err, url) => {
                if (err) {
                    console.error(err);
                } else {
                    setQrUrlData(url);
                }
            });
        }}>Generar QR</Button>
        {qrUrlData !== null ? <Image src={qrUrlData} alt="qr" width={400} height={400}/> : <></>}
    </>;
}
