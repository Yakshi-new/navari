import { useEffect } from 'react';

const SEO = ({ title, description, keywords }) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title ? `${title} | Navari` : 'Navari - Premium Women\'s Fashion';
    document.title = formattedTitle;

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description || 'Discover the finest collection of premium handloom sarees, lehengas, kurtis, and designer suits at Navari. Celebrating Indian heritage with modern elegance.';

    // 3. Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords || 'handloom sarees, banarasi sarees, lehengas, kurtis, suits, traditional wear, women fashion, navari';

    // 4. Update OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = formattedTitle;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = description || 'Discover the finest collection of premium handloom sarees, lehengas, kurtis, and designer suits at Navari.';
  }, [title, description, keywords]);

  return null;
};

export default SEO;
