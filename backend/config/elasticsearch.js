import { Client } from '@elastic/elasticsearch';

// Initialize Elasticsearch client
const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_AUTH
    ? {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || ''
      }
    : undefined,
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: false
});

// Test connection
const testConnection = async () => {
  try {
    const health = await elasticsearchClient.cluster.health();
    console.log('✅ Elasticsearch connected:', health.cluster_name);
    return true;
  } catch (error) {
    console.warn('⚠️ Elasticsearch connection failed:', error.message);
    console.warn('Suggestions will use fallback search');
    return false;
  }
};

// Initialize suggestions index
export const initializeSuggestionsIndex = async () => {
  try {
    const indexName = 'suggestions';
    
    // Check if index exists
    const exists = await elasticsearchClient.indices.exists({ index: indexName });
    
    if (!exists) {
      // Create index with mappings
      await elasticsearchClient.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                autocomplete: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'autocomplete_filter']
                },
                autocomplete_search: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase']
                }
              },
              filter: {
                autocomplete_filter: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 20
                }
              }
            }
          },
          mappings: {
            properties: {
              type: { type: 'keyword' }, // 'product', 'store', 'category'
              name: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard'
              },
              category: { type: 'keyword' },
              tags: { type: 'keyword' },
              popularity: { type: 'integer' },
              rating: { type: 'float' },
              price: { type: 'float' },
              image: { type: 'keyword' },
              storeId: { type: 'keyword' },
              storeName: { type: 'text' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
      console.log('✅ Suggestions index created');
    } else {
      console.log('ℹ️ Suggestions index already exists');
    }
  } catch (error) {
    console.error('Error initializing suggestions index:', error.message);
  }
};

// Index a document for suggestions
export const indexSuggestion = async (type, data) => {
  try {
    await elasticsearchClient.index({
      index: 'suggestions',
      id: `${type}_${data._id}`,
      document: {
        type,
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        tags: data.tags || [],
        popularity: data.popularity || 0,
        rating: data.rating || 0,
        price: data.price || 0,
        image: data.image || data.images?.[0] || '',
        storeId: data.storeId || data._id,
        storeName: data.storeName || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || new Date()
      }
    });
  } catch (error) {
    console.error(`Error indexing ${type}:`, error.message);
  }
};

// Bulk index suggestions
export const bulkIndexSuggestions = async (documents) => {
  try {
    const operations = documents.flatMap(doc => [
      { index: { _index: 'suggestions', _id: `${doc.type}_${doc._id}` } },
      {
        type: doc.type,
        name: doc.name,
        description: doc.description || '',
        category: doc.category || '',
        tags: doc.tags || [],
        popularity: doc.popularity || 0,
        rating: doc.rating || 0,
        price: doc.price || 0,
        image: doc.image || doc.images?.[0] || '',
        storeId: doc.storeId || doc._id,
        storeName: doc.storeName || '',
        isActive: doc.isActive !== false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt || new Date()
      }
    ]);

    const result = await elasticsearchClient.bulk({ operations });
    
    if (result.errors) {
      console.error('Bulk indexing had errors');
    } else {
      console.log(`✅ Bulk indexed ${documents.length} suggestions`);
    }
  } catch (error) {
    console.error('Error bulk indexing suggestions:', error.message);
  }
};

// Search suggestions
export const searchSuggestions = async (query, options = {}) => {
  try {
    const {
      type = null,
      limit = 10,
      minScore = 1.0
    } = options;

    const must = [
      {
        multi_match: {
          query,
          fields: ['name^3', 'description', 'tags^2', 'storeName'],
          type: 'bool_prefix',
          fuzziness: 'AUTO'
        }
      },
      { term: { isActive: true } }
    ];

    if (type) {
      must.push({ term: { type } });
    }

    const result = await elasticsearchClient.search({
      index: 'suggestions',
      body: {
        query: {
          bool: { must }
        },
        sort: [
          { _score: 'desc' },
          { popularity: 'desc' },
          { rating: 'desc' }
        ],
        size: limit,
        min_score: minScore
      }
    });

    return result.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error searching suggestions:', error.message);
    return [];
  }
};

// Delete suggestion
export const deleteSuggestion = async (type, id) => {
  try {
    await elasticsearchClient.delete({
      index: 'suggestions',
      id: `${type}_${id}`
    });
  } catch (error) {
    if (error.meta?.statusCode !== 404) {
      console.error(`Error deleting ${type}:`, error.message);
    }
  }
};

// Update suggestion
export const updateSuggestion = async (type, data) => {
  try {
    await elasticsearchClient.update({
      index: 'suggestions',
      id: `${type}_${data._id}`,
      doc: {
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        popularity: data.popularity,
        rating: data.rating,
        price: data.price,
        image: data.image || data.images?.[0],
        isActive: data.isActive,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error(`Error updating ${type}:`, error.message);
  }
};

export { elasticsearchClient, testConnection };
export default elasticsearchClient;
