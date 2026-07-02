import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'AI API Testing',
    text: 'Generate intelligent test suites for every endpoint with semantic scenario coverage.',
    icon: Sparkles,
  },
  {
    title: 'Security Intelligence',
    text: 'Analyze API security posture and receive contextual hardening suggestions.',
    icon: ShieldCheck,
  },
  {
    title: 'Workflow Orchestration',
    text: 'Move from design to mocking, validation, and documentation in one workspace.',
    icon: Workflow,
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-foreground">
      <div className="absolute inset-0 mesh opacity-60" aria-hidden="true" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 inline-flex w-fit rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs tracking-[0.2em] text-muted uppercase backdrop-blur"
        >
          APIPilot AI Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-4xl text-balance text-4xl font-semibold leading-tight md:text-6xl"
        >
          AI Powered API Development & Testing Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
        >
          A premium developer cockpit for building APIs, generating AI test cases, explaining failures,
          and shipping resilient integrations faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="mt-8 flex gap-4"
        >
          <Link
            to="/register"
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-canvas font-semibold rounded-lg transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-white/20 hover:border-white/40 text-foreground font-semibold rounded-lg transition"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <Icon className="mb-5 h-5 w-5 text-accent" />
                <h2 className="text-lg font-medium">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{card.text}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
