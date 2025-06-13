/**
 * CMS Service - Integration with Strapi CMS
 * Handles fetching restaurant data, menus, and AI knowledge from Strapi
 */

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiRestaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: StrapiMedia;
  images?: StrapiMedia[];
  opening_hours?: OpeningHours[];
  cuisine_types?: string[];
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  features?: string[];
}

interface StrapiMenuCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  menu_items?: StrapiMenuItem[];
}

interface StrapiMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  images?: StrapiMedia[];
  allergens?: string[];
  dietary_info?: string[];
  ingredients?: string[];
  prep_time?: number;
  calories?: number;
  is_featured: boolean;
  is_available: boolean;
}

interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
}

interface StrapiAIKnowledge {
  id: number;
  faq_data: FAQ[];
  policies: Policy[];
  brand_voice: string;
  special_instructions: string;
  common_responses: CommonResponse[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
  priority: number;
}

interface Policy {
  title: string;
  content: string;
  type: 'cancellation' | 'dietary' | 'payment' | 'general';
}

interface CommonResponse {
  trigger: string[];
  response: string;
  context?: string;
}

interface OpeningHours {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
}

export class CMSService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.apiToken = process.env.STRAPI_API_TOKEN || '';
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CMS request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`CMS Service Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Restaurant Management
  async getRestaurant(id: number): Promise<StrapiRestaurant | null> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiRestaurant>>(
        `/restaurants/${id}?populate=*`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch restaurant from CMS:', error);
      return null;
    }
  }

  async getAllRestaurants(): Promise<StrapiRestaurant[]> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiRestaurant[]>>(
        '/restaurants?populate=*'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch restaurants from CMS:', error);
      return [];
    }
  }

  // Menu Management
  async getMenuCategories(restaurantId: number): Promise<StrapiMenuCategory[]> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiMenuCategory[]>>(
        `/menu-categories?filters[restaurant][id][$eq]=${restaurantId}&populate=*&sort=display_order:asc`
      );
      return response.data.filter(category => category.is_active);
    } catch (error) {
      console.error('Failed to fetch menu categories from CMS:', error);
      return [];
    }
  }

  async getMenuItems(categoryId: number): Promise<StrapiMenuItem[]> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiMenuItem[]>>(
        `/menu-items?filters[category][id][$eq]=${categoryId}&populate=*`
      );
      return response.data.filter(item => item.is_available);
    } catch (error) {
      console.error('Failed to fetch menu items from CMS:', error);
      return [];
    }
  }

  async getFeaturedMenuItems(restaurantId: number): Promise<StrapiMenuItem[]> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiMenuItem[]>>(
        `/menu-items?filters[category][restaurant][id][$eq]=${restaurantId}&filters[is_featured][$eq]=true&populate=*`
      );
      return response.data.filter(item => item.is_available);
    } catch (error) {
      console.error('Failed to fetch featured menu items from CMS:', error);
      return [];
    }
  }

  // AI Knowledge Management
  async getAIKnowledge(restaurantId: number): Promise<StrapiAIKnowledge | null> {
    try {
      const response = await this.makeRequest<StrapiResponse<StrapiAIKnowledge[]>>(
        `/ai-knowledge-bases?filters[restaurant][id][$eq]=${restaurantId}&populate=*`
      );
      return response.data[0] || null;
    } catch (error) {
      console.error('Failed to fetch AI knowledge from CMS:', error);
      return null;
    }
  }

  // Media URL Helper
  getMediaUrl(media: StrapiMedia): string {
    if (media.url.startsWith('http')) {
      return media.url;
    }
    return `${this.baseUrl}${media.url}`;
  }

  // Convert Strapi data to internal format
  convertRestaurantData(strapiRestaurant: StrapiRestaurant): any {
    return {
      id: strapiRestaurant.id,
      name: strapiRestaurant.name,
      description: strapiRestaurant.description,
      address: strapiRestaurant.address,
      phone: strapiRestaurant.phone,
      email: strapiRestaurant.email,
      website: strapiRestaurant.website,
      logoUrl: strapiRestaurant.logo ? this.getMediaUrl(strapiRestaurant.logo) : null,
      images: strapiRestaurant.images?.map(img => this.getMediaUrl(img)) || [],
      openingHours: strapiRestaurant.opening_hours || [],
      cuisineTypes: strapiRestaurant.cuisine_types || [],
      priceRange: strapiRestaurant.price_range || '$$',
      features: strapiRestaurant.features || [],
    };
  }

  convertMenuItemData(strapiItem: StrapiMenuItem): any {
    return {
      id: strapiItem.id,
      name: strapiItem.name,
      description: strapiItem.description,
      price: strapiItem.price,
      images: strapiItem.images?.map(img => this.getMediaUrl(img)) || [],
      allergens: strapiItem.allergens || [],
      dietaryInfo: strapiItem.dietary_info || [],
      ingredients: strapiItem.ingredients || [],
      prepTime: strapiItem.prep_time,
      calories: strapiItem.calories,
      isFeatured: strapiItem.is_featured,
      isAvailable: strapiItem.is_available,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/_health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const cmsService = new CMSService();