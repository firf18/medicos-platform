import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PreciosContent } from '@/components/precios/PreciosContent';

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <PreciosContent />
      <Footer />
    </div>
  );
}