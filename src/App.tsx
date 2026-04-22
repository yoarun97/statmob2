import { createBrowserRouter } from 'react-router-dom';
import { ScrollContainer } from '@/components/layout/ScrollContainer';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ScrollContainer />,
  },
]);

export default router;
