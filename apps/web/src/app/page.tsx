import { HealthResponseSchema, type HealthResponse } from '@saotech/shared';
import { getDictionary } from '../i18n';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { HealthStatus } from '../components/HealthStatus';
import { Footer } from '../components/Footer';

async function fetchApiHealth(): Promise<HealthResponse | null> {
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return null;
    }

    const json: unknown = await res.json();
    return HealthResponseSchema.parse(json);
  } catch {
    // Network error or parse failure — degrade gracefully
    return null;
  }
}

export default async function HomePage() {
  const dict = getDictionary('fr');
  const health = await fetchApiHealth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header dict={dict} activeNav="home" />
      <main className="flex-1">
        <HeroBanner dict={dict} />
        <HealthStatus health={health} dict={dict} />
      </main>
      <Footer dict={dict} />
    </div>
  );
}
