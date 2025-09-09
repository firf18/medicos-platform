import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FAQContent } from '@/components/faq/FAQContent';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <FAQContent />
      <Footer />
    </div>
  );
}