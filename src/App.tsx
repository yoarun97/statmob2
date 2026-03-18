import { createBrowserRouter } from 'react-router-dom';

// Pages will be added here as they are built.
// Using lazy imports per route keeps the initial bundle small.
const router = createBrowserRouter([
  {
    path: '/',
    // Placeholder until the Home page is built
    element: (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-[#00ff87] font-bold text-2xl tracking-widest">TERRACE</p>
      </div>
    ),
  },
]);

export default router;
