import { Montserrat } from 'next/font/google';
import Header from '@/common/components/header/header';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Dentalook',
  description: 'Dentalook application'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Header>{children}</Header>
      </body>
    </html>
  );
}
