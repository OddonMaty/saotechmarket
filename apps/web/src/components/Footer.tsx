import React from 'react';
import type { Dictionary } from '../i18n';

interface FooterProps {
  dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
  return (
    <footer className="footer mt-auto">
      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-footer">
            <div>
              <p>
                {dict.footer.newsletterTitle} —{' '}
                <span>{dict.footer.newsletterText}</span>
              </p>
            </div>
            <div className="newsletter-input">
              <input
                type="email"
                placeholder={dict.footer.newsletterPlaceholder}
              />
              <button type="button" className="btn btn-primary">
                {dict.footer.newsletterButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="footer-content">
        <div className="container">
          <div className="footer-columns">
            <div className="footer-column">
              <h4>{dict.footer.customerService}</h4>
              <ul>
                <li>
                  <button type="button">{dict.nav.contact}</button>
                </li>
                <li>
                  <button type="button">{dict.nav.faq}</button>
                </li>
                <li>
                  <button type="button">Livraison & Retours</button>
                </li>
                <li>
                  <button type="button">Conditions générales</button>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Informations</h4>
              <ul>
                <li>
                  <button type="button">{dict.nav.about}</button>
                </li>
                <li>
                  <button type="button">{dict.nav.account}</button>
                </li>
                <li>
                  <button type="button">Paiements & Retours</button>
                </li>
                <li>
                  <button type="button">{dict.nav.products}</button>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{dict.footer.aboutTitle}</h4>
              <ul>
                <li>
                  <button type="button">Qui sommes-nous</button>
                </li>
                <li>
                  <button type="button">Responsabilité sociale</button>
                </li>
                <li>
                  <button type="button">Carrières</button>
                </li>
                <li>
                  <button type="button">Politique de confidentialité</button>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contactez-nous</h4>
              <ul className="contact-list">
                <li>
                  <i className="fas fa-phone mr-2" /> {dict.common.contactPhone}
                </li>
                <li>
                  <i className="fas fa-envelope mr-2" /> {dict.common.contactEmail}
                </li>
                <li>
                  <i className="fas fa-clock mr-2" /> Lun–Sam : 8h – 19h
                </li>
              </ul>
              <div className="social-links mt-3 flex gap-2">
                <button type="button" aria-label="Facebook">
                  <i className="fab fa-facebook" />
                </button>
                <button type="button" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </button>
                <button type="button" aria-label="Twitter">
                  <i className="fab fa-twitter" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>{dict.footer.copyright}</p>
          <p>
            Plateforme créée par{' '}
            <a
              href="https://saotechagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              Sao Tech Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

