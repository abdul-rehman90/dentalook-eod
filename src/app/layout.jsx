import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from '@/common/context/global-context';
import Providers from '@/common/components/progress-bar/progress-bar';

export const metadata = {
  title: 'Dentalook Clinics Reporting',
  description: 'Dentalook Clinics Reporting application'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Providers>{children}</Providers>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
