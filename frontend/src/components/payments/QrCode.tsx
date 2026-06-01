"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrCodeProps = {
  value: string;
  size?: number;
};

/**
 * Renders `value` as a QR code entirely on the client (no third-party image
 * service), so the payment URL never leaves the browser.
 */
export default function QrCode({ value, size = 220 }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate QR code");
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-md bg-gray-200"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Payment QR code"
      width={size}
      height={size}
      className="rounded-md border border-gray-200"
    />
  );
}
