/**
 * Synonym Configuration
 * Maps search terms to their synonyms for better search results
 */
export const synonymMap = {
  // Food & Groceries
  'milk': ['dairy', 'milk product', 'lactose'],
  'bread': ['loaf', 'baked goods', 'bakery'],
  'vegetables': ['veggies', 'greens', 'produce'],
  'fruits': ['fresh fruit', 'produce'],
  'meat': ['protein', 'beef', 'pork', 'chicken', 'poultry'],
  'chicken': ['poultry', 'meat', 'protein'],
  'beef': ['meat', 'protein', 'steak'],
  'fish': ['seafood', 'protein'],
  'eggs': ['protein', 'breakfast'],
  'cheese': ['dairy', 'milk product'],
  'yogurt': ['dairy', 'yoghurt'],
  'rice': ['grain', 'staple'],
  'pasta': ['noodles', 'italian', 'grain'],
  'cereal': ['breakfast', 'grain'],
  
  // Beverages
  'water': ['beverage', 'drink', 'h2o'],
  'juice': ['beverage', 'drink', 'fruit drink'],
  'soda': ['soft drink', 'beverage', 'pop', 'fizzy drink'],
  'coffee': ['beverage', 'drink', 'caffeine'],
  'tea': ['beverage', 'drink', 'chai'],
  'beer': ['alcohol', 'beverage', 'drink'],
  'wine': ['alcohol', 'beverage', 'drink'],
  
  // Household & Cleaning
  'detergent': ['laundry', 'cleaning', 'soap', 'washing powder'],
  'soap': ['cleaning', 'hygiene', 'detergent'],
  'shampoo': ['hair care', 'hygiene', 'beauty'],
  'toothpaste': ['dental', 'hygiene', 'oral care'],
  'tissue': ['paper', 'hygiene', 'tissues'],
  'toilet paper': ['tissue', 'hygiene', 'bathroom'],
  'bleach': ['cleaning', 'disinfectant'],
  'disinfectant': ['cleaning', 'sanitizer', 'bleach'],
  
  // Personal Care & Beauty
  'makeup': ['cosmetics', 'beauty', 'cosmetic'],
  'perfume': ['fragrance', 'scent', 'cologne'],
  'deodorant': ['hygiene', 'personal care', 'antiperspirant'],
  'lotion': ['cream', 'moisturizer', 'skincare'],
  'sunscreen': ['sun protection', 'spf', 'sunblock'],
  
  // Electronics & Tech
  'phone': ['mobile', 'smartphone', 'cell phone', 'cellular'],
  'laptop': ['computer', 'notebook', 'pc'],
  'tablet': ['ipad', 'device'],
  'charger': ['cable', 'power adapter'],
  'headphones': ['earphones', 'earbuds', 'audio'],
  'speaker': ['audio', 'sound system'],
  'tv': ['television', 'screen', 'monitor'],
  'camera': ['photography', 'photo'],
  
  // Clothing & Fashion
  'shirt': ['top', 'blouse', 'tee', 't-shirt'],
  'pants': ['trousers', 'jeans', 'bottoms'],
  'dress': ['gown', 'frock', 'outfit'],
  'shoes': ['footwear', 'sneakers', 'boots'],
  'jacket': ['coat', 'outerwear'],
  'shorts': ['short pants', 'bottoms'],
  
  // Pet Supplies
  'dog food': ['pet food', 'canine food', 'puppy food'],
  'cat food': ['pet food', 'feline food', 'kitten food'],
  'pet': ['animal', 'dog', 'cat', 'puppy', 'kitten'],
  
  // Home & Garden
  'furniture': ['home decor', 'furnishings'],
  'plants': ['garden', 'greenery', 'flora'],
  'tools': ['hardware', 'equipment'],
  'paint': ['coating', 'color'],
  
  // Baby & Kids
  'diaper': ['nappy', 'baby care', 'nappies'],
  'baby food': ['infant food', 'baby nutrition'],
  'toy': ['plaything', 'game', 'kids toy'],
  
  // Sports & Fitness
  'gym': ['fitness', 'workout', 'exercise'],
  'weights': ['dumbbells', 'barbells', 'fitness equipment'],
  'yoga': ['fitness', 'exercise', 'wellness'],
  
  // Snacks & Sweets
  'chips': ['crisps', 'snack', 'snacks'],
  'chocolate': ['candy', 'sweet', 'confectionery'],
  'cookies': ['biscuits', 'snack', 'baked goods'],
  'candy': ['sweets', 'confectionery', 'lollies'],
  
  // Generic terms
  'cheap': ['affordable', 'budget', 'low cost', 'inexpensive'],
  'expensive': ['premium', 'luxury', 'high end'],
  'organic': ['natural', 'bio', 'eco'],
  'fresh': ['new', 'recently made', 'not frozen'],
  'frozen': ['iced', 'cold storage']
};

/**
 * Get synonyms for a search term
 * @param {string} term - Search term
 * @returns {Array<string>} Array of synonyms including the original term
 */
export const getSynonyms = (term) => {
  const normalized = term.toLowerCase().trim();
  const synonyms = [normalized];
  
  // Add direct synonyms
  if (synonymMap[normalized]) {
    synonyms.push(...synonymMap[normalized]);
  }
  
  // Check if term appears as a synonym of another term
  for (const [key, values] of Object.entries(synonymMap)) {
    if (values.includes(normalized)) {
      synonyms.push(key);
      synonyms.push(...values);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(synonyms)];
};

/**
 * Expand a search query with synonyms
 * @param {string} query - Original search query
 * @returns {Array<string>} Array of query variations with synonyms
 */
export const expandQueryWithSynonyms = (query) => {
  const words = query.toLowerCase().trim().split(/\s+/);
  const allVariations = new Set([query.toLowerCase()]);
  
  // Single word queries - add all synonyms
  if (words.length === 1) {
    const synonyms = getSynonyms(words[0]);
    synonyms.forEach(syn => allVariations.add(syn));
  } else {
    // Multi-word queries - expand each significant word
    words.forEach(word => {
      if (word.length > 3) { // Only expand meaningful words
        const synonyms = getSynonyms(word);
        synonyms.forEach(syn => {
          const expandedQuery = query.toLowerCase().replace(word, syn);
          allVariations.add(expandedQuery);
        });
      }
    });
  }
  
  return [...allVariations];
};
