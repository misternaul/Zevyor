import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Zevyor database...');

  // 1. Categories
  const watchesCat = await prisma.category.upsert({
    where: { slug: 'watches' },
    update: {},
    create: {
      name: 'Watches',
      slug: 'watches',
      description: 'Precision-engineered chronographs, minimalist dress watches, and robust automatic timepieces.',
      imageUrl: '/assets/categories/watches.jpg',
      displayOrder: 1,
      isPublished: true,
    },
  });

  const shawlsCat = await prisma.category.upsert({
    where: { slug: 'shawls' },
    update: {},
    create: {
      name: 'Shawls',
      slug: 'shawls',
      description: 'Artisanal cashmere, premium wool, and blended heritage wraps tailored for refined style.',
      imageUrl: '/assets/categories/shawls.jpg',
      displayOrder: 2,
      isPublished: true,
    },
  });

  console.log('✔ Categories seeded');

  // 2. Products - Watches
  const watch1 = await prisma.product.upsert({
    where: { slug: 'chronograph-royal-onyx' },
    update: {},
    create: {
      name: 'Chronograph Royal Onyx',
      slug: 'chronograph-royal-onyx',
      shortDescription: 'Bold 42mm sports chronograph with deep black dial and surgical-grade stainless steel bracelet.',
      fullDescription: 'Crafted for distinguished presence, the Chronograph Royal Onyx combines a scratch-resistant sapphire-coated crystal, Japanese quartz movement, and multi-function chronograph sub-dials. Water resistant to 50 meters, it transitions effortlessly from boardrooms to evening engagements.',
      categoryId: watchesCat.id,
      sku: 'ZVR-W-001',
      tags: 'watches, chronograph, black, steel, luxury',
      originalPrice: 14999,
      sellingPrice: 11999,
      costPrice: 6500,
      trackInventory: true,
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      seoTitle: 'Chronograph Royal Onyx Watch | Zevyor Luxury Timepieces',
      seoDescription: 'Shop the Chronograph Royal Onyx by Zevyor. Featuring surgical-grade stainless steel, sapphire-coated crystal, and precision movement. Cash on Delivery across Pakistan.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
            altText: 'Chronograph Royal Onyx Watch front view',
            displayOrder: 0,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
            altText: 'Chronograph Royal Onyx Watch on wrist',
            displayOrder: 1,
            isPrimary: false,
          },
        ],
      },
      variants: {
        create: [
          {
            title: 'Midnight Black / Steel Bracelet',
            sku: 'ZVR-W-001-STL',
            price: 11999,
            stockQuantity: 18,
            color: 'Silver Steel',
            material: '316L Stainless Steel',
          },
          {
            title: 'Midnight Black / Leather Strap',
            sku: 'ZVR-W-001-LTH',
            price: 10999,
            stockQuantity: 12,
            color: 'Matte Black',
            material: 'Genuine Italian Leather',
          },
        ],
      },
    },
  });

  const watch2 = await prisma.product.upsert({
    where: { slug: 'sovereign-obsidian-automatic' },
    update: {},
    create: {
      name: 'Sovereign Obsidian Automatic',
      slug: 'sovereign-obsidian-automatic',
      shortDescription: 'Architectural exhibition caseback with 24-jewel automatic mechanical movement.',
      fullDescription: 'The Sovereign Obsidian Automatic represents the pinnacle of understated horology. Powered purely by your natural wrist motion with a 42-hour power reserve, this timepiece features anti-reflective sapphire glass, Roman numeral indices, and a genuine calfskin strap.',
      categoryId: watchesCat.id,
      sku: 'ZVR-W-002',
      tags: 'watches, automatic, leather, executive, luxury',
      originalPrice: 21999,
      sellingPrice: 17499,
      costPrice: 9500,
      trackInventory: true,
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      seoTitle: 'Sovereign Obsidian Automatic Watch | Zevyor',
      seoDescription: 'The Sovereign Obsidian Automatic watch features 24-jewel self-winding mechanical movement and exhibition glass. Order with COD in Pakistan.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=1000&q=80',
            altText: 'Sovereign Obsidian Automatic Watch front angle',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            title: 'Rose Gold Bezel / Dark Espresso Strap',
            sku: 'ZVR-W-002-RG',
            price: 17499,
            stockQuantity: 9,
            color: 'Rose Gold & Espresso',
            material: 'Genuine Calfskin Leather',
          },
          {
            title: 'Silver Bezel / Onyx Black Strap',
            sku: 'ZVR-W-002-SV',
            price: 17499,
            stockQuantity: 15,
            color: 'Silver & Black',
            material: 'Genuine Calfskin Leather',
          },
        ],
      },
    },
  });

  // 3. Products - Shawls
  const shawl1 = await prisma.product.upsert({
    where: { slug: 'imperial-pashmina-cashmere-shawl' },
    update: {},
    create: {
      name: 'Imperial Pashmina Cashmere Shawl',
      slug: 'imperial-pashmina-cashmere-shawl',
      shortDescription: 'Ultra-soft hand-woven cashmere pashmina shawl in deep regal burgundy and charcoal undertones.',
      fullDescription: 'Woven from ethically harvested Himalayan mountain cashmere fibers, the Imperial Pashmina delivers extraordinary warmth without weight. Featuring a discreet hand-finished border, this statement piece embodies timeless heritage and masculine confidence.',
      categoryId: shawlsCat.id,
      sku: 'ZVR-S-001',
      tags: 'shawls, pashmina, cashmere, burgundy, winter, luxury',
      originalPrice: 18500,
      sellingPrice: 14500,
      costPrice: 7800,
      trackInventory: true,
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      seoTitle: 'Imperial Pashmina Cashmere Shawl | Zevyor',
      seoDescription: 'Handcrafted luxury Pashmina cashmere shawl for men by Zevyor. Pure warmth, regal drape, and supreme softness.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80',
            altText: 'Imperial Pashmina Cashmere Shawl draped detail',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            title: 'Regal Burgundy / Standard 2.5m x 1.25m',
            sku: 'ZVR-S-001-BUR',
            price: 14500,
            stockQuantity: 14,
            color: 'Burgundy',
            size: '2.5m x 1.25m',
            material: '100% Pure Himalayan Cashmere',
          },
          {
            title: 'Charcoal Noir / Standard 2.5m x 1.25m',
            sku: 'ZVR-S-001-BLK',
            price: 14500,
            stockQuantity: 10,
            color: 'Charcoal Noir',
            size: '2.5m x 1.25m',
            material: '100% Pure Himalayan Cashmere',
          },
        ],
      },
    },
  });

  const shawl2 = await prisma.product.upsert({
    where: { slug: 'aristocrat-heritage-wool-shawl' },
    update: {},
    create: {
      name: 'Aristocrat Heritage Wool Shawl',
      slug: 'aristocrat-heritage-wool-shawl',
      shortDescription: 'Heavyweight pure merino wool shawl with subtle self-textured micro-weave.',
      fullDescription: 'Designed for colder climates and formal occasions, the Aristocrat Heritage Shawl is woven from pure 100% Australian Merino Wool. With substantial drape and a crisp matte finish, it delivers an authoritative and dignified silhouette.',
      categoryId: shawlsCat.id,
      sku: 'ZVR-S-002',
      tags: 'shawls, wool, cream, formal, winter',
      originalPrice: 12000,
      sellingPrice: 9499,
      costPrice: 4800,
      trackInventory: true,
      status: 'PUBLISHED',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      seoTitle: 'Aristocrat Heritage Merino Wool Shawl | Zevyor',
      seoDescription: 'Premium Merino wool shawl designed for men by Zevyor. High density weave and superior drape. Order with Cash on Delivery.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
            altText: 'Aristocrat Heritage Wool Shawl texture',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            title: 'Vintage Cream / Standard 2.5m x 1.25m',
            sku: 'ZVR-S-002-CRM',
            price: 9499,
            stockQuantity: 20,
            color: 'Vintage Cream',
            size: '2.5m x 1.25m',
            material: '100% Merino Wool',
          },
        ],
      },
    },
  });

  console.log('✔ Products and variants seeded');

  // 4. Delivery Rules
  const deliveryRules = [
    {
      name: 'Karachi Metro Priority',
      city: 'Karachi',
      province: 'Sindh',
      fee: 199,
      minOrderForFreeDelivery: 5000,
      priority: 10,
      estimatedDays: '1 - 2 business days',
    },
    {
      name: 'Lahore Metro Priority',
      city: 'Lahore',
      province: 'Punjab',
      fee: 199,
      minOrderForFreeDelivery: 5000,
      priority: 10,
      estimatedDays: '1 - 2 business days',
    },
    {
      name: 'Islamabad / Rawalpindi Priority',
      city: 'Islamabad',
      province: 'Federal',
      fee: 199,
      minOrderForFreeDelivery: 5000,
      priority: 10,
      estimatedDays: '1 - 2 business days',
    },
    {
      name: 'Standard Nationwide Delivery',
      city: null,
      province: null,
      fee: 299,
      minOrderForFreeDelivery: 6000,
      priority: 1,
      estimatedDays: '3 - 5 business days',
    },
  ];

  for (const rule of deliveryRules) {
    const existing = await prisma.deliveryRule.findFirst({
      where: { name: rule.name },
    });
    if (!existing) {
      await prisma.deliveryRule.create({ data: rule });
    }
  }

  console.log('✔ Delivery rules seeded');

  // 5. Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountAmount: 10,
      minOrderValue: 3000,
      maxDiscount: 2000,
      isActive: true,
      perCustomerLimit: 1,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'ZEVYOR500' },
    update: {},
    create: {
      code: 'ZEVYOR500',
      discountType: 'FIXED',
      discountAmount: 500,
      minOrderValue: 5000,
      isActive: true,
      perCustomerLimit: 1,
    },
  });

  console.log('✔ Coupons seeded');

  // 6. Bundles
  const existingBundle = await prisma.bundle.findFirst({
    where: { title: "Collector's Dual Watch Pairing" },
  });

  if (!existingBundle) {
    await prisma.bundle.create({
      data: {
        title: "Collector's Dual Watch Pairing",
        description: 'Purchase any two watches and receive 15% discount on the entire watch order.',
        bundleType: 'QUANTITY_DISCOUNT',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minQuantity: 2,
        isActive: true,
      },
    });
  }

  console.log('✔ Bundles seeded');

  // 7. Store Settings
  const defaultSettings = [
    { key: 'brandName', value: 'Zevyor' },
    { key: 'currency', value: 'PKR' },
    { key: 'whatsappNumber', value: '923000000000' },
    { key: 'contactEmail', value: 'support@zevyor.com' },
    {
      key: 'announcementBar',
      value: 'Complimentary Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available',
    },
    { key: 'announcementVisible', value: 'true' },
    { key: 'heroHeading', value: 'Commanding Elegance. Authentic Craft.' },
    {
      key: 'heroSubheading',
      value: 'Precision chronographs and artisanal cashmere shawls crafted for the modern gentleman.',
    },
    { key: 'heroButtonText', value: 'Shop Collection' },
    { key: 'heroButtonLink', value: '/shop' },
    { key: 'heroImageDesktop', value: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2000&q=85' },
    {
      key: 'brandIntroduction',
      value: 'Zevyor embodies masculine refinement and architectural precision. Each piece is designed for discerning individuals who appreciate quiet luxury, enduring quality, and confident individuality.',
    },
    {
      key: 'policyShipping',
      value: 'All orders are processed and shipped within 24 to 48 hours. We offer reliable Cash on Delivery across Pakistan via top-tier couriers. Tracking references are provided upon dispatch.',
    },
    {
      key: 'policyReturns',
      value: 'We offer a 7-day hassle-free exchange policy on unworn items in pristine original condition with packaging intact. Please contact our support team on WhatsApp to initiate an exchange.',
    },
    {
      key: 'policyPrivacy',
      value: 'Your privacy is paramount. Personal details collected at checkout (name, delivery address, phone number) are strictly used for order verification, delivery logistics, and essential status notifications.',
    },
    {
      key: 'policyTerms',
      value: 'All products listed are guaranteed authentic. Prices are stated in Pakistani Rupees (PKR) and include applicable taxes. We reserve the right to verify orders by phone prior to dispatch.',
    },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('✔ Store settings seeded');

  // 8. Lookbook Entries
  const lookbookItems = [
    {
      title: 'The Sovereign Chrono & Evening Cashmere',
      caption: 'A study in quiet authority. Pairing the Sovereign Obsidian with our hand-loomed burgundy pashmina wrap.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 1,
      isPublished: true,
    },
    {
      title: 'Metropolitan Architectural Heritage',
      caption: 'Sharp tailoring accentuated by minimalist horology and pure merino texture.',
      imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 2,
      isPublished: true,
    },
  ];

  for (const item of lookbookItems) {
    const existing = await prisma.lookbookEntry.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      await prisma.lookbookEntry.create({ data: item });
    }
  }

  console.log('✔ Lookbook seeded');
  console.log('🎉 Seeding successfully completed!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
