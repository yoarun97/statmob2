import { motion } from 'framer-motion';
import { EditorialSection } from '@/components/layout/EditorialSection';
import { FilmStrip } from '@/components/season/FilmStrip';
import { SeasonContent } from '@/components/season/SeasonContent';

export function SeasonExplorer() {
  return (
    <EditorialSection
      id="season"
      className="min-h-screen flex flex-col"
    >
      {/* Section label */}
      <div className="px-8 pt-16 pb-6">
        <p className="font-stats text-sm font-semibold tracking-[0.18em] uppercase opacity-70" style={{ color: 'inherit' }}>
          01 / Season Explorer
        </p>
      </div>

      {/* Two-panel layout. perspective enables rotateY on the film strip entry. */}
      <div
        className="flex gap-0"
        style={{ perspective: '1000px' }}
      >
        {/* Left panel: film strip — sticky so it stays in view as the right content scrolls */}
        <motion.div
          className="w-52 shrink-0 sticky top-0 h-screen overflow-hidden"
          initial={{ opacity: 0, x: -60, rotateY: -8 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <FilmStrip />
        </motion.div>

        {/* Right panel: flows naturally with the page */}
        <motion.div
          className="flex-1 px-8 py-4"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
        >
          <SeasonContent />
        </motion.div>
      </div>
    </EditorialSection>
  );
}
