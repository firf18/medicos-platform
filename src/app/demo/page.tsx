import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { DemoContent } from '@/components/demo/DemoContent';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <DemoContent />
      <Footer />
    </div>
  );
}