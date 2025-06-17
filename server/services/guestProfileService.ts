import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { 
  userPreferences, 
  guestVisits, 
  reservations, 
  orders, 
  users,
  restaurants 
} from '../../shared/schema';
import type { 
  UserPreference, 
  InsertUserPreference, 
  GuestVisit,
  InsertGuestVisit 
} from '../../shared/schema';
import { smsService } from './smsService';

export class GuestProfileService {
  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreference>): Promise<UserPreference> {
    const existingPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existingPrefs.length > 0) {
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...preferences,
          lastUpdated: new Date()
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({
          userId,
          ...preferences
        })
        .returning();
      return created;
    }
  }

  async getUserPreferences(userId: number): Promise<UserPreference | null> {
    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return prefs[0] || null;
  }

  async recordVisit(visitData: InsertGuestVisit): Promise<GuestVisit> {
    const [visit] = await db
      .insert(guestVisits)
      .values(visitData)
      .returning();

    // Update visit history in user preferences
    const preferences = await this.getUserPreferences(visitData.userId);
    const visitHistory = preferences?.visitHistory as any || {};
    
    // Update statistics
    visitHistory.totalVisits = (visitHistory.totalVisits || 0) + 1;
    visitHistory.lastVisit = visit.visitDate;
    visitHistory.favoriteSection = visitData.tableSection;
    
    // Track special occasions
    if (visitData.specialOccasion) {
      const occasions = visitHistory.specialOccasions || {};
      occasions[visitData.specialOccasion] = (occasions[visitData.specialOccasion] || 0) + 1;
      visitHistory.specialOccasions = occasions;
    }

    await this.updateUserPreferences(visitData.userId, {
      visitHistory
    });

    return visit;
  }

  async getGuestVisitHistory(userId: number, restaurantId?: number): Promise<GuestVisit[]> {
    const query = db.select().from(guestVisits).where(eq(guestVisits.userId, userId));
    
    if (restaurantId) {
      query.where(and(eq(guestVisits.userId, userId), eq(guestVisits.restaurantId, restaurantId)));
    }

    return query.orderBy(desc(guestVisits.visitDate)).limit(20);
  }

  async getVisitAnalytics(userId: number, restaurantId: number) {
    const visits = await this.getGuestVisitHistory(userId, restaurantId);
    const preferences = await this.getUserPreferences(userId);

    const analytics = {
      totalVisits: visits.length,
      averageSpend: visits.reduce((sum, v) => sum + (v.totalSpent || 0), 0) / visits.length || 0,
      averagePartySize: visits.reduce((sum, v) => sum + v.partySize, 0) / visits.length || 0,
      favoriteSection: this.getMostFrequent(visits.map(v => v.tableSection).filter(Boolean)),
      commonOccasions: this.getMostFrequent(visits.map(v => v.specialOccasion).filter(Boolean)),
      averageWaitTime: visits.reduce((sum, v) => sum + (v.waitTime || 0), 0) / visits.length || 0,
      lastVisit: visits[0]?.visitDate || null,
      seatingPreferences: preferences?.seatingPreferences || [],
      specialOccasions: preferences?.specialOccasions || []
    };

    return analytics;
  }

  private getMostFrequent(items: string[]): string | null {
    if (items.length === 0) return null;
    
    const frequency = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency).reduce((a, b) => frequency[a[0]] > frequency[b[0]] ? a : b)[0];
  }

  async checkSpecialOccasions(userId: number, restaurantId: number): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    const specialOccasions = preferences?.specialOccasions as any;

    if (!specialOccasions) return;

    const today = new Date();
    const todayStr = `${today.getMonth() + 1}-${today.getDate()}`;

    for (const [occasion, date] of Object.entries(specialOccasions)) {
      if (typeof date === 'string' && date === todayStr) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1);

        if (user[0] && restaurant[0] && user[0].phone) {
          await smsService.sendSpecialOccasionMessage(
            user[0].phone,
            user[0].name,
            restaurant[0].name,
            occasion
          );
        }
      }
    }
  }

  async getPersonalizedRecommendations(userId: number, restaurantId: number) {
    const preferences = await this.getUserPreferences(userId);
    const visitHistory = await this.getGuestVisitHistory(userId, restaurantId);
    const analytics = await this.getVisitAnalytics(userId, restaurantId);

    const recommendations = {
      suggestedItems: [], // Would integrate with menu recommendations
      preferredSeating: analytics.favoriteSection || 'main dining',
      specialOccasionOffers: [],
      loyaltyStatus: this.calculateLoyaltyStatus(analytics.totalVisits, analytics.averageSpend),
      nextVisitIncentive: this.generateNextVisitIncentive(analytics)
    };

    return recommendations;
  }

  private calculateLoyaltyStatus(visits: number, averageSpend: number) {
    if (visits >= 20 || averageSpend >= 100) return 'VIP';
    if (visits >= 10 || averageSpend >= 50) return 'Frequent';
    if (visits >= 5) return 'Regular';
    return 'New';
  }

  private generateNextVisitIncentive(analytics: any) {
    const daysSinceLastVisit = analytics.lastVisit 
      ? Math.floor((Date.now() - new Date(analytics.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (daysSinceLastVisit && daysSinceLastVisit > 30) {
      return "We miss you! Come back for 15% off your next meal.";
    }

    if (analytics.totalVisits >= 10) {
      return "You're one of our regulars! Ask about our VIP perks.";
    }

    return "Try something new on your next visit - ask about our chef's recommendations!";
  }
}

export const guestProfileService = new GuestProfileService();