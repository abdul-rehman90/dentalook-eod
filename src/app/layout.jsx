import './globals.css';
import { Toaster } from 'react-hot-toast';
import 'react-date-range/dist/styles.css';
import { Montserrat } from 'next/font/google';
import 'react-date-range/dist/theme/default.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppProvider } from '@/common/context/global-context';
import Providers from '@/common/components/progress-bar/progress-bar';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Dentalook Clinics Reporting',
  description: 'Dentalook Clinics Reporting application'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <AppProvider>
          <Providers>{children}</Providers>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
