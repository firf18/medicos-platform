import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ServiciosContent } from '@/components/servicios/ServiciosContent';

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ServiciosContent />
      <Footer />
    </div>
  );
}