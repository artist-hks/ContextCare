import Link from "next/link";
import { Stethoscope } from "lucide-react";
import PatientUploadFlow from "@/components/PatientUploadFlow";

export default function Home() {
  return (
    <div className="relative">
      <Link
        href="/doctor/login"
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-slate/40 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur hover:border-teal"
      >
        <Stethoscope size={14} /> Doctor login
      </Link>
      <PatientUploadFlow />
    </div>
  );
}
