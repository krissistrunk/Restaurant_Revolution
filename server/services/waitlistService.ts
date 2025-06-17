import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from '../db';
import { queueEntries, users, restaurants, guestVisits } from '../../shared/schema';
import type { QueueEntry, InsertQueueEntry, GuestVisit, InsertGuestVisit } from '../../shared/schema';
import { smsService } from './smsService';
import { broadcastToRestaurant } from '../websocket';

export class WaitlistService {
  async joinWaitlist(data: InsertQueueEntry): Promise<QueueEntry> {
    const highestPosition = await db
      .select({ position: queueEntries.position })
      .from(queueEntries)
      .where(and(
        eq(queueEntries.restaurantId, data.restaurantId),
        eq(queueEntries.status, 'waiting')
      ))
      .orderBy(desc(queueEntries.position))
      .limit(1);

    const newPosition = (highestPosition[0]?.position || 0) + 1;

    const [newEntry] = await db.insert(queueEntries).values({
      ...data,
      position: newPosition,
      status: 'waiting'
    }).returning();

    // Get user and restaurant info for SMS
    const user = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
    const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, data.restaurantId)).limit(1);

    if (user[0] && restaurant[0] && data.phone && newEntry.smsNotifications) {
      await smsService.sendWaitlistNotification(
        data.phone,
        user[0].name,
        restaurant[0].name,
        newPosition,
        data.estimatedWaitTime
      );
    }

    // Broadcast to restaurant staff
    broadcastToRestaurant(data.restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'joined', entry: newEntry }
    });

    return newEntry;
  }

  async updateWaitlistPosition(entryId: number, newPosition: number): Promise<void> {
    const [entry] = await db
      .select({
        id: queueEntries.id,
        userId: queueEntries.userId,
        restaurantId: queueEntries.restaurantId,
        phone: queueEntries.phone,
        estimatedWaitTime: queueEntries.estimatedWaitTime,
        smsNotifications: queueEntries.smsNotifications
      })
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1);

    if (!entry) return;

    await db
      .update(queueEntries)
      .set({ 
        position: newPosition,
        lastNotificationSent: new Date()
      })
      .where(eq(queueEntries.id, entryId));

    // Send SMS update if notifications enabled
    if (entry.phone && entry.smsNotifications) {
      const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, entry.restaurantId)).limit(1);

      if (user[0] && restaurant[0]) {
        await smsService.sendPositionUpdateNotification(
          entry.phone,
          user[0].name,
          restaurant[0].name,
          newPosition,
          entry.estimatedWaitTime
        );
      }
    }

    // Broadcast update
    broadcastToRestaurant(entry.restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'position_updated', entryId, newPosition }
    });
  }

  async callCustomer(entryId: number): Promise<void> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1);

    if (!entry) return;

    await db
      .update(queueEntries)
      .set({ 
        status: 'called',
        lastNotificationSent: new Date()
      })
      .where(eq(queueEntries.id, entryId));

    // Send table ready SMS
    if (entry.phone && entry.smsNotifications) {
      const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, entry.restaurantId)).limit(1);

      if (user[0] && restaurant[0]) {
        await smsService.sendTableReadyNotification(
          entry.phone,
          user[0].name,
          restaurant[0].name
        );
      }
    }

    broadcastToRestaurant(entry.restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'called', entryId }
    });
  }

  async seatCustomer(entryId: number, tableSection?: string): Promise<void> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1);

    if (!entry) return;

    const seatedAt = new Date();
    const actualWaitTime = Math.floor((seatedAt.getTime() - entry.joinedAt.getTime()) / 60000);

    await db
      .update(queueEntries)
      .set({ 
        status: 'seated',
        seatedAt,
        actualWaitTime
      })
      .where(eq(queueEntries.id, entryId));

    // Record the visit
    const visitData: InsertGuestVisit = {
      userId: entry.userId,
      restaurantId: entry.restaurantId,
      partySize: entry.partySize,
      tableSection: tableSection || entry.seatingPreference || 'main dining',
      waitTime: actualWaitTime,
      notes: entry.note
    };

    await db.insert(guestVisits).values(visitData);

    // Reorder remaining waitlist
    await this.reorderWaitlist(entry.restaurantId);

    broadcastToRestaurant(entry.restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'seated', entryId }
    });
  }

  async cancelWaitlistEntry(entryId: number): Promise<void> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1);

    if (!entry) return;

    await db
      .update(queueEntries)
      .set({ status: 'cancelled' })
      .where(eq(queueEntries.id, entryId));

    // Reorder remaining waitlist
    await this.reorderWaitlist(entry.restaurantId);

    broadcastToRestaurant(entry.restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'cancelled', entryId }
    });
  }

  private async reorderWaitlist(restaurantId: number): Promise<void> {
    const waitingEntries = await db
      .select()
      .from(queueEntries)
      .where(and(
        eq(queueEntries.restaurantId, restaurantId),
        eq(queueEntries.status, 'waiting')
      ))
      .orderBy(asc(queueEntries.joinedAt));

    for (let i = 0; i < waitingEntries.length; i++) {
      const newPosition = i + 1;
      if (waitingEntries[i].position !== newPosition) {
        await db
          .update(queueEntries)
          .set({ position: newPosition })
          .where(eq(queueEntries.id, waitingEntries[i].id));
      }
    }
  }

  async getWaitlist(restaurantId: number): Promise<QueueEntry[]> {
    return await db
      .select()
      .from(queueEntries)
      .where(and(
        eq(queueEntries.restaurantId, restaurantId),
        eq(queueEntries.status, 'waiting')
      ))
      .orderBy(asc(queueEntries.position));
  }

  async updateEstimatedWaitTime(restaurantId: number, averageTableTurnover: number): Promise<void> {
    const waitingEntries = await this.getWaitlist(restaurantId);
    
    for (const entry of waitingEntries) {
      const estimatedWait = entry.position * averageTableTurnover;
      
      await db
        .update(queueEntries)
        .set({ estimatedWaitTime: estimatedWait })
        .where(eq(queueEntries.id, entry.id));
    }

    broadcastToRestaurant(restaurantId, {
      type: 'waitlist_updated',
      data: { action: 'times_updated' }
    });
  }
}

export const waitlistService = new WaitlistService();