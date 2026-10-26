import {
  Link,
} from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-sm font-medium">
          CAREEREVIDENCE
        </p>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mt-5 max-w-4xl">
          Build the evidence your
          target role actually requires.
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mt-6">
          CareerEvidence connects current
          entry-level market demand with
          your skills, project evidence,
          academic workload and next
          action.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            to="/register"
            className="rounded-lg bg-black text-white px-6 py-3"
          >
            Start your analysis
          </Link>

          <Link
            to="/login"
            className="rounded-lg border px-6 py-3"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            'Current market',
            'Your ability',
            'Your evidence',
            'Your next action',
          ].map((item) => (
            <div
              key={item}
              className="border rounded-2xl p-6"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}