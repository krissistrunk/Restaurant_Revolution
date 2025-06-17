import twilio from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private config: SMSConfig;

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || ''
    };

    if (this.config.accountSid && this.config.authToken) {
      this.client = twilio(this.config.accountSid, this.config.authToken);
    }
  }

  private isConfigured(): boolean {
    return !!(this.client && this.config.fromNumber);
  }

  async sendWaitlistNotification(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string, 
    position: number, 
    estimatedWaitTime: number
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `Hi ${customerName}! You're #${position} on the waitlist at ${restaurantName}. Estimated wait time: ${estimatedWaitTime} minutes. We'll text you when your table is ready!`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send waitlist notification:', error);
      return false;
    }
  }

  async sendTableReadyNotification(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `${customerName}, your table is ready at ${restaurantName}! Please come to the host stand within 10 minutes to be seated.`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send table ready notification:', error);
      return false;
    }
  }

  async sendPositionUpdateNotification(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string, 
    newPosition: number, 
    estimatedWaitTime: number
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `Update from ${restaurantName}: You're now #${newPosition} on the waitlist, ${customerName}. Estimated wait time: ${estimatedWaitTime} minutes.`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send position update:', error);
      return false;
    }
  }

  async sendReservationConfirmation(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string, 
    date: string, 
    time: string, 
    partySize: number
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `Reservation confirmed at ${restaurantName}! ${customerName}, your table for ${partySize} is set for ${date} at ${time}. Call us if you need to make changes.`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send reservation confirmation:', error);
      return false;
    }
  }

  async sendReservationReminder(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string, 
    time: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `Reminder: ${customerName}, your reservation at ${restaurantName} is today at ${time}. Looking forward to seeing you!`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send reservation reminder:', error);
      return false;
    }
  }

  async sendSpecialOccasionMessage(
    phoneNumber: string, 
    customerName: string, 
    restaurantName: string, 
    occasion: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('SMS not configured, skipping notification');
      return false;
    }

    const message = `Happy ${occasion}, ${customerName}! 🎉 ${restaurantName} has something special planned for your visit. See you soon!`;

    try {
      await this.client!.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send special occasion message:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();