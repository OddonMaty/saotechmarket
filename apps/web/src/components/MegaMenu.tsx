import React from 'react';
import type { Dictionary } from '../i18n';

interface MegaMenuProps {
  dict: Dictionary;
}

export function MegaMenu({ dict }: MegaMenuProps) {
  return (
    <div className="mega-menu">
      <div className="mega-menu-column">
        <button type="button" className="mega-menu-heading">
          <i className="fas fa-mobile-alt" /> {dict.departments.electronique}
        </button>
        <button type="button">Smartphone</button>
        <button type="button">Tablette</button>
        <button type="button">Audio</button>
        <button type="button">Montre connectée</button>
        <button type="button">Ordinateur</button>
        <button type="button">Appareil photo</button>
        <button type="button">Télévision</button>
      </div>

      <div className="mega-menu-column">
        <button type="button" className="mega-menu-heading">
          <i className="fas fa-hard-hat" /> {dict.departments.construction}
        </button>
        <button type="button">Ciment</button>
        <button type="button">Fer à béton</button>
        <button type="button">Peinture</button>
        <button type="button">Carrelage</button>
      </div>

      <div className="mega-menu-column">
        <button type="button" className="mega-menu-heading">
          <i className="fas fa-tshirt" /> {dict.departments.vetements}
        </button>
        <button type="button">Chemises</button>
        <button type="button">Robes</button>
        <button type="button">Pantalons</button>
        <button type="button">Chaussures</button>
      </div>

      <div className="mega-menu-column">
        <button type="button" className="mega-menu-heading">
          <i className="fas fa-print" /> {dict.departments.imprimantes}
        </button>
        <button type="button">Imprimante Laser</button>
        <button type="button">Imprimante Jet d'encre</button>
        <button type="button">Multifonction</button>
      </div>
    </div>
  );
}

