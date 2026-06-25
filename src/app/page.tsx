"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, FormEvent, useCallback } from "react";
import { VelvetIsoLogo } from "@/components/velvet-logo";
import { VelvetHeader } from "@/components/velvet-header";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [valid, setValid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const validate = useCallback(() => {
    const name = nameRef.current?.value.trim() ?? "";
    const digits = (phoneRef.current?.value ?? "").replace(/\D/g, "");
    const consent = consentRef.current?.checked ?? false;
    const hasPhoto = !!photoFile && !!preview;
    const ok = name.length >= 2 && digits.length === 9 && consent && hasPhoto;
    setValid(ok);
    return ok;
  }, [photoFile, preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La foto debe pesar menos de 5 MB");
      return;
    }
    setError("");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const digits = input.value.replace(/\D/g, "").slice(0, 9);
    input.value = digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
    validate();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const phone = (phoneRef.current?.value ?? "").replace(/\D/g, "");
    formData.set("phone", phone);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el registro");
      router.push("/discover");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <VelvetHeader />
      <main className="relative z-10 pt-20 pb-24 min-h-screen">
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-28 h-28 mb-6 animate-float">
            <div className="absolute inset-0 rounded-full bg-[#B76E79]/20 blur-2xl" />
            <VelvetIsoLogo className="w-full h-full" />
          </div>

          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold tracking-wide text-[#F4EADE] mb-2">
            VELVET
          </h1>
          <p className="text-[#B76E79] text-sm tracking-[0.3em] uppercase mb-6">contactos</p>
          <p className="text-[#F2D7D3]/80 text-sm italic mb-8">Donde la elegancia se encuentra con la conexión</p>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xs velvet-glass rounded-3xl p-6 border border-[#B76E79]/15 shadow-2xl text-left"
          >
            <div className="flex flex-col items-center mb-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[#B76E79]/40 flex items-center justify-center mb-2 overflow-hidden bg-white/5 hover:border-[#B76E79]/70 transition"
                aria-label="Subir foto"
              >
                <span
                  id="photo-preview"
                  className={`w-full h-full flex items-center justify-center text-2xl ${
                    preview ? "has-image" : ""
                  }`}
                  style={preview ? { backgroundImage: `url(${preview})` } : undefined}
                >
                  {preview ? "" : "📷"}
                </span>
              </button>
              <span className="text-xs text-[#F2D7D3]/70">Toca para agregar tu foto</span>
              <input
                ref={fileInputRef}
                type="file"
                name="photo"
                id="reg-photo"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="mb-4">
              <input
                ref={nameRef}
                type="text"
                name="name"
                id="reg-name"
                placeholder="Tu nombre"
                required
                onInput={validate}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F4EADE] placeholder:text-[#F2D7D3]/40 focus:outline-none focus:border-[#B76E79]/50"
              />
            </div>

            <div className="mb-2">
              <div className="flex items-center w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#B76E79]/50">
                <span className="text-[#F2D7D3]/50 text-sm mr-3">ES</span>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phone"
                  id="reg-phone"
                  placeholder="612 345 678"
                  required
                  onInput={handlePhoneInput}
                  className="flex-1 bg-transparent text-sm text-[#F4EADE] placeholder:text-[#F2D7D3]/40 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#F2D7D3]/50 mb-4">Solo 9 dígitos · Se comparte solo si hay match</p>

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                ref={consentRef}
                type="checkbox"
                name="accepted"
                id="reg-consent"
                value="true"
                className="mt-1 w-4 h-4 accent-velvet-rose rounded"
                onChange={validate}
              />
              <span className="text-[11px] text-[#F2D7D3]/80 leading-tight">
                Entiendo que mis datos se usan solo durante el evento y se eliminan después.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !valid}
              className={`w-full py-4 rounded-2xl metallic-rose-gold font-semibold tracking-widest uppercase text-sm shadow-lg transition-all duration-300 ${
                valid ? "opacity-100" : "opacity-50"
              }`}
            >
              {loading ? "Entrando..." : "ENTRAR"}
            </button>

            {error && (
              <p className="mt-4 text-xs text-center min-h-[1rem] text-red-400">{error}</p>
            )}
            {!error && <p className="mt-4 text-xs text-center min-h-[1rem]" />}
          </form>

          <p className="mt-6 text-[11px] text-[#F2D7D3]/50 tracking-wide max-w-xs">
            Tus datos solo se usan hoy y se eliminan al terminar
          </p>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[#B76E79] text-sm tracking-[0.25em] uppercase mb-2">VELVET contactos</p>
        <p className="text-[#F2D7D3]/50 text-xs tracking-widest">EN LA VIDA TODO SON CONTACTOS · VIP</p>
      </footer>
    </>
  );
}
