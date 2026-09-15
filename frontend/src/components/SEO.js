import React, { useEffect } from 'react';

const DEFAULT_TITLE = 'Parth Kadiya | Web Developer | Portfolio';
const DEFAULT_DESCRIPTION = 'Official portfolio of Parth Kadiya (ParthKadiya) - Web Developer & Frontend Developer based in Ahmedabad. Explore web development projects, technical skills, and software applications by Parth Kadiya.';
const DEFAULT_KEYWORDS = 'Parth Kadiya, Parth Kadiya Portfolio, Parth Web Developer, Parth Kadiya Web Developer, Parth Portfolio, ParthKadiya, parth kadiya, parthkadiya, Frontend Developer Ahmedabad, Web Developer Ahmedabad, React Developer, Full Stack Developer, JavaScript Developer, Next.js, Portfolio';
const DEFAULT_CANONICAL = 'https://parthkadiya.vercel.app/';
const DEFAULT_IMAGE = 'https://parthkadiya.vercel.app/assets/parth.jpg';

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical = DEFAULT_CANONICAL,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  image = DEFAULT_IMAGE,
  type = 'website'
}) {
  useEffect(() => {
    // 1. Sync document.title
    document.title = title;

    // 2. Helper to set or update meta tag by name or property
    const setMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', robots);
    setMeta('property', 'og:site_name', 'Parth Kadiya');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 3. Sync canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, keywords, canonical, robots, image, type]);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="Parth Kadiya" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
