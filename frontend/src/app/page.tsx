import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Dashboard } from '@/components/vault/Dashboard';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background radial */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  );
}
