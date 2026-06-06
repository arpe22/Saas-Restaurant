const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Home() {
  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Restaurant SaaS</p>
        <h1>Base multi-restaurante lista para crecer</h1>
        <p>
          Monorepo con Next.js, NestJS, PostgreSQL y Prisma preparado para
          agregar los modulos de negocio cuando toque.
        </p>
        <a href={`${apiUrl}/health`}>Ver health check de la API</a>
      </section>
    </main>
  );
}
