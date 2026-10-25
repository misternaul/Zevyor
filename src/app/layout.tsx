import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zevyor.com'),
  title: 'Zevyor | Modern Lifestyle, Luxury Watches & Artisanal Shawls',
  description:
    'Discover Zevyor: bold, modern, and masculine lifestyle essentials. Featuring precision chronographs and hand-crafted pashmina cashmere shawls. Cash on Delivery across Pakistan.',
  keywords: ['Zevyor', 'luxury watches Pakistan', 'cashmere shawls Pakistan', 'mens accessories', 'chronograph', 'pashmina', 'COD Pakistan'],
  openGraph: {
    title: 'Zevyor | Modern Lifestyle & Horology',
    description: 'Precision timepieces and artisanal cashmere shawls crafted for the modern gentleman.',
    url: 'https://zevyor.com',
    siteName: 'Zevyor',
    images: [
      {
        url: '/assets/zevyor-official-logo.png',
        width: 1200,
        height: 630,
        alt: 'Zevyor Lifestyle Brand',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let announcementText =
    'Complimentary Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available';
  let announcementVisible = true;
  let whatsappNumber = '923000000000';

  try {
    const settings = await db.storeSetting.findMany({
      where: {
        key: {
          in: ['announcementBar', 'announcementVisible', 'whatsappNumber'],
        },
      },
    });

    for (const s of settings) {
      if (s.key === 'announcementBar') announcementText = s.value;
      if (s.key === 'announcementVisible') announcementVisible = s.value === 'true';
      if (s.key === 'whatsappNumber') whatsappNumber = s.value;
    }
  } catch (err) {
    // Fallback gracefully during build or database initialization
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between">
        <CartProvider>
          <WishlistProvider>
            <Header
              announcementText={announcementText}
              announcementVisible={announcementVisible}
            />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer whatsappNumber={whatsappNumber} />
            <WhatsAppFloatingButton whatsappNumber={whatsappNumber} />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
