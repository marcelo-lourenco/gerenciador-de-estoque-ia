
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

const INITIAL_PRODUCTS: Product[] = [
    { id: 'a1', name: 'Notebook Gamer Pro', sku: 'NGP-001', quantity: 15, price: 7500.00, description: 'Notebook de alta performance para jogos e trabalho pesado.', imageUrl: 'https://picsum.photos/seed/Notebook/400/300' },
    { id: 'b2', name: 'Mouse Sem Fio Ergonômico', sku: 'MSFE-002', quantity: 120, price: 250.00, description: 'Mouse ergonômico com conexão sem fio de alta precisão.', imageUrl: 'https://picsum.photos/seed/Mouse/400/300' },
    { id: 'c3', name: 'Teclado Mecânico RGB', sku: 'TMR-003', quantity: 8, price: 450.00, description: 'Teclado mecânico com switches azuis e iluminação RGB customizável.', imageUrl: 'https://picsum.photos/seed/Teclado/400/300' },
    { id: 'd4', name: 'Monitor Ultrawide 34"', sku: 'MUW-004', quantity: 25, price: 3200.00, description: 'Monitor ultrawide com alta taxa de atualização para imersão total.', imageUrl: 'https://picsum.photos/seed/Monitor/400/300' },
];


export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = localStorage.getItem('inventory_products');
      return storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return INITIAL_PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('inventory_products', JSON.stringify(products));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [products]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: new Date().toISOString() + Math.random(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
};
