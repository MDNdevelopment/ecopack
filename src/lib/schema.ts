import empresa from '../data/empresa.json';

const SITE_URL = 'https://ecopackvenezuela.com';

export function organizationSchema() {
	return {
		'@type': 'Organization',
		'@id': `${SITE_URL}/#organization`,
		name: empresa.nombre,
		legalName: empresa.razonSocial,
		url: SITE_URL,
		logo: `${SITE_URL}/images/logo-ecopack.png`,
		description: empresa.descripcion,
		email: empresa.email,
		telephone: empresa.telefono,
		sameAs: Object.values(empresa.redes).filter((v): v is string => Boolean(v)),
	};
}

export function localBusinessSchema() {
	return {
		'@type': 'LocalBusiness',
		'@id': `${SITE_URL}/#localbusiness`,
		name: empresa.nombre,
		image: `${SITE_URL}/images/logo-ecopack.png`,
		address: {
			'@type': 'PostalAddress',
			addressLocality: empresa.ciudad,
			addressRegion: empresa.estado,
			addressCountry: 'VE',
		},
		telephone: empresa.telefono,
		email: empresa.email,
		areaServed: {
			'@type': 'Country',
			name: 'Venezuela',
		},
		priceRange: '$$',
	};
}

export function websiteSchema() {
	return {
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		url: SITE_URL,
		name: empresa.nombre,
		publisher: { '@id': `${SITE_URL}/#organization` },
		inLanguage: 'es-VE',
	};
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: `${SITE_URL}${item.path}`,
		})),
	};
}

export function faqSchema(items: { pregunta: string; respuesta: string }[]) {
	return {
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.pregunta,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.respuesta,
			},
		})),
	};
}

export { SITE_URL };
