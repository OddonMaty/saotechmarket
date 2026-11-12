import React from 'react';
import type { Dictionary } from '../i18n';

interface HeroBannerProps {
  dict: Dictionary;
}

export function HeroBanner({ dict }: HeroBannerProps) {
  return (
    <section className="hero-slider relative h-[450px] bg-[#2a2a2e] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1440&h=600&fit=crop&auto=format')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container relative z-10 text-white">
        <div className="max-w-[550px]">
          <span className="hero-tag inline-block bg-primary text-white text-xs font-bold px-3 py-1 uppercase rounded-sm mb-3">
            Nouveautés 2026
          </span>
          <h1 className="font-condensed text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-tight mb-4 text-white drop-shadow">
            Smartphones & Gadgets Premium
          </h1>
          <p className="text-sm sm:text-base text-gray-200 mb-6 drop-shadow">
            {dict.common.freeDeliveryInfo} à Bukavu, Uvira, Goma et Baraka.
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn btn-primary">
              Découvrir le catalogue <i className="fas fa-arrow-right ml-1" />
            </button>
            <button type="button" className="btn btn-outline text-white border-white hover:bg-white hover:text-dark">
              {dict.nav.sellerSpace}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

