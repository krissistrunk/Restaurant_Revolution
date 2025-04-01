import twilio from 'twilio';
import { QueueEntry } from '@shared/schema';

// Get Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Sends an SMS notification to a customer when their table is ready
 */
export async function sendTableReadySMS(queueEntry: QueueEntry, restaurantName: string): Promise<boolean> {
  // Don't attempt to send if no phone number is available
  if (!queueEntry.phone) {
    console.log('No phone number provided for queue entry, skipping SMS notification');
    return false;
  }

  // Don't attempt to send if Twilio credentials are not configured
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured. Cannot send SMS notification.');
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    const message = await client.messages.create({
      body: `Your table at ${restaurantName} is now ready! Please check in with the host within the next 10 minutes.`,
      from: twilioPhoneNumber,
      to: queueEntry.phone
    });

    console.log(`SMS notification sent successfully. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

/**
 * Sends a confirmation SMS when a customer joins the queue
 */
export async function sendQueueConfirmationSMS(queueEntry: QueueEntry, restaurantName: string): Promise<boolean> {
  // Don't attempt to send if no phone number is available
  if (!queueEntry.phone) {
    console.log('No phone number provided for queue entry, skipping SMS notification');
    return false;
  }

  // Don't attempt to send if Twilio credentials are not configured
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured. Cannot send SMS notification.');
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    const waitTime = queueEntry.estimatedWaitTime || 'unknown';
    
    const message = await client.messages.create({
      body: `You've been added to the waitlist at ${restaurantName}. 
Estimated wait time: ${waitTime} minutes. 
Party size: ${queueEntry.partySize}.
We'll text you when your table is ready!`,
      from: twilioPhoneNumber,
      to: queueEntry.phone
    });

    console.log(`Queue confirmation SMS sent successfully. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}