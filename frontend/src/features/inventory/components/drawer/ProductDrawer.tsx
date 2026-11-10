import React, { useState, useEffect } from 'react';
import { Package, QrCode, Store } from 'lucide-react';
import { ProductItem } from '@/services/productApi';
import { ProductDrawerHeader } from './ProductDrawerHeader';
import { ProductTabCommercial } from './tabs/ProductTabCommercial';
import { ProductTabLots } from './tabs/ProductTabLots';
import { ProductTabDistribution } from './tabs/ProductTabDistribution';

export type ProductDrawerTab = 'commercial' | 'lots' | 'distribution';

interface ProductDrawerProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAttachLot?: (productId: string) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onOpenAttachLot,
}) => {
  const [activeTab, setActiveTab] = useState<ProductDrawerTab>('commercial');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab when product changes
  useEffect(() => {
    if (product) {
      setActiveTab('commercial');
    }
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const tabs: { id: ProductDrawerTab; label: string; icon: any }[] = [
    { id: 'commercial', label: 'Thương mại & OCOP', icon: Package },
    {
      id: 'lots',
      label: `Lô GS1 (${product.lots_count ?? (product.lots ? product.lots.length : 0)})`,
      icon: QrCode,
    },
    { id: 'distribution', label: 'Kênh phân phối', icon: Store },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer slide-over */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
          {/* Header */}
          <ProductDrawerHeader
            product={product}
            onClose={onClose}
            onOpenAttachLot={onOpenAttachLot}
          />

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                    isActive
                      ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'commercial' && <ProductTabCommercial product={product} />}
            {activeTab === 'lots' && (
              <ProductTabLots product={product} onOpenAttachLot={onOpenAttachLot} />
            )}
            {activeTab === 'distribution' && <ProductTabDistribution product={product} />}
          </div>
        </div>
      </div>
    </div>
  );
};
