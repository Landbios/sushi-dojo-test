'use client';

import { useState } from 'react';
import Header from './Header';
import CartDrawer from './CartDrawer';
import { Product } from '@/types';

export default function CartWrapper({ products }: { products: Product[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} products={products} />
    </>
  );
}
