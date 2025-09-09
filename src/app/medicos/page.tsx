import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MedicosContent } from "@/components/medicos/MedicosContent";

export default function MedicosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MedicosContent />
      <Footer />
    </div>
  );
}
