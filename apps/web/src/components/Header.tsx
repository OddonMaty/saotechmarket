import React from 'react';
import Image from 'next/image';
import type { Dictionary } from '../i18n';
import { MegaMenu } from './MegaMenu';

interface HeaderProps {
  dict: Dictionary;
  activeNav?: string;
}

export function Header({ dict, activeNav = 'home' }: HeaderProps) {
  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left">
            <span>
              <i className="fas fa-phone" /> {dict.common.contactPhone}
            </span>
            <span className="hidden-mobile">
              <i className="fas fa-envelope" /> {dict.common.contactEmail}
            </span>
          </div>
          <div className="top-bar-right">
            <span className="hidden-mobile">{dict.common.freeDeliveryInfo}</span>
            <span>FR / CDF</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Image
              src="/images/brand/logo.png"
              alt={dict.common.brand}
              width={200}
              height={60}
              className="logo-img"
              priority
            />
          </div>

          <div className="search-bar">
            <input
              type="text"
              id="searchInput"
              placeholder={dict.common.searchPlaceholder}
            />
            <button type="button" aria-label={dict.common.searchPlaceholder}>
              <i className="fas fa-search" />
            </button>
          </div>

          <div className="header-actions">
            <button type="button" className="header-btn">
              <i className="fas fa-store" />
              <span className="hidden-mobile">{dict.nav.sellerSpace}</span>
            </button>
            <button type="button" className="header-btn">
              <i className="fas fa-user" />
              <span className="hidden-mobile">{dict.nav.account}</span>
            </button>
            <button type="button" className="header-btn">
              <i className="fas fa-heart" />
              <span className="hidden-mobile">Favoris</span>
            </button>
            <button type="button" className="header-btn">
              <i className="fas fa-shopping-cart" />
              <span className="hidden-mobile">{dict.nav.cart}</span>
              <span className="cart-badge">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <div className="container">
          <button
            type="button"
            className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
          >
            {dict.nav.home}
          </button>
          <div className="nav-dropdown mega-menu-wrapper">
            <button
              type="button"
              className={`nav-item ${activeNav === 'collection' ? 'active' : ''}`}
            >
              {dict.nav.products} <i className="fas fa-chevron-down text-xs ml-1" />
            </button>
            <MegaMenu dict={dict} />
          </div>
          <button
            type="button"
            className={`nav-item ${activeNav === 'about' ? 'active' : ''}`}
          >
            {dict.nav.about}
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === 'contact' ? 'active' : ''}`}
          >
            {dict.nav.contact}
          </button>
          <button
            type="button"
            className={`nav-item ${activeNav === 'faq' ? 'active' : ''}`}
          >
            {dict.nav.faq}
          </button>
        </div>
      </nav>
    </>
  );
}

