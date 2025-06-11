import { Toaster } from 'react-hot-toast';
import { Montserrat } from 'next/font/google';
import { AppProvider } from '@/common/context/global-context';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Dentalook',
  description: 'Dentalook application'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
