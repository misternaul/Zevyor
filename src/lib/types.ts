export interface CartItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantTitle?: string | null;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

export interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  province: string;
  city: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  couponCode?: string;
  idempotencyKey?: string;
}

export interface CalculatedOrder {
  items: {
    productId: string;
    variantId?: string | null;
    productName: string;
    variantTitle?: string | null;
    sku?: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discountTotal: number;
  discountBreakdown: {
    couponCode?: string;
    couponDiscount: number;
    bundleDiscount: number;
    bundleTitle?: string;
  };
  deliveryFee: number;
  appliedDeliveryRule?: string;
  finalTotal: number;
  estimatedDelivery?: string;
}
