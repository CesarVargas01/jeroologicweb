/**
 * Utilidades para SEO y metadatos
 */

export interface StructuredDataConfig {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  telephone?: string;
  addressCountry?: string;
  sameAs?: string[];
  serviceType?: string;
  serviceDescription?: string;
}

/**
 * Genera datos estructurados (JSON-LD) para SEO
 */
export function generateStructuredData(config: StructuredDataConfig = {}) {
  const defaultConfig = {
    name: 'Jeroo Logic',
    description: 'Soluciones de software y automatización empresarial con tecnologías modernas',
    url: 'https://www.jerroologic.com',
    logo: 'https://www.jerroologic.com/logo.svg',
    telephone: '+57-320-871-8037',
    addressCountry: 'CO',
    sameAs: ['https://wa.me/573208718037', 'https://t.me/573208718037'],
    serviceType: 'Software Development',
    serviceDescription: 'Automatización de procesos, desarrollo web, bases de datos y soluciones cloud'
  };

  const finalConfig = { ...defaultConfig, ...config };

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: finalConfig.name,
    description: finalConfig.description,
    url: finalConfig.url,
    logo: finalConfig.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: finalConfig.telephone,
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: finalConfig.addressCountry,
    },
    sameAs: finalConfig.sameAs,
    offers: {
      '@type': 'Service',
      serviceType: finalConfig.serviceType,
      description: finalConfig.serviceDescription,
    },
  };
}

/**
 * Genera metadatos básicos para páginas
 */
export function generatePageMetadata(
  title: string,
  description?: string,
  image?: string,
  url?: string
) {
  const defaultDescription = 'Jeroo Logic: Soluciones de software y tecnología para optimizar tus procesos empresariales con automatización, bases de datos y desarrollo web a medida.';
  
  return {
    title,
    description: description || defaultDescription,
    image: image || '/images/default-social.webp',
    url: url || 'https://www.jerroologic.com'
  };
}