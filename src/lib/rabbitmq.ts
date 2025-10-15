import amqp, { Connection, Channel, Options } from 'amqplib';
import { NotificationPayload } from '@/lib/types/notification';
interface RabbitMQConfig {
  url: string;
  exchange: string;
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  exchangeOptions?: Options.AssertExchange;
}

interface PublishOptions {
  routingKey: string;
  message: string | object;
  messageOptions?: Options.Publish;
}

// RabbitMQ Producer Class
class RabbitMQProducer {
  private config: RabbitMQConfig;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(config: RabbitMQConfig) {
    this.config = {
      exchangeType: 'direct',
      exchangeOptions: { durable: true },
      ...config,
    };
  }

  // Connect and setup channel
  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(
        this.config.exchange,
        this.config.exchangeType!,
        this.config.exchangeOptions
      );

      console.log('✅ Connected to RabbitMQ');
    } catch (error) {
      console.error('❌ Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  // Publish message
  async publish(options: PublishOptions): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('Channel not initialized. Call connect() first.');
      }

      const messageBuffer = Buffer.from(
        typeof options.message === 'string'
          ? options.message
          : JSON.stringify(options.message)
      );

      const result = this.channel.publish(
        this.config.exchange,
        options.routingKey,
        messageBuffer,
        options.messageOptions
      );

      console.log(`✅ Sent [${options.routingKey}]:`, options.message);
      return result;
    } catch (error) {
      console.error('❌ Error publishing message:', error);
      throw error;
    }
  }

  // Close connection
  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('✅ Connection closed');
    } catch (error) {
      console.error('❌ Error closing connection:', error);
      throw error;
    }
  }

  // Send and close (one-off message)
  async sendAndClose(options: PublishOptions): Promise<void> {
    await this.connect();
    await this.publish(options);
    await this.close();
  }
}

// Simplified function-based approach
async function publishToRabbitMQ(
  config: RabbitMQConfig,
  options: PublishOptions
): Promise<void> {
  let connection: Connection | null = null;
  let channel: Channel | null = null;

  try {
    connection = await amqp.connect(config.url);
    channel = await connection.createChannel();

    await channel.assertExchange(
      config.exchange,
      config.exchangeType || 'direct',
      config.exchangeOptions || { durable: true }
    );

    const messageBuffer = Buffer.from(
      typeof options.message === 'string'
        ? options.message
        : JSON.stringify(options.message)
    );

    channel.publish(
      config.exchange,
      options.routingKey,
      messageBuffer,
      options.messageOptions
    );

    console.log(`✅ Sent [${options.routingKey}]:`, options.message);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

export async function pushToWhatsappQueue(payload: NotificationPayload) {
  const send = new RabbitMQProducer({
    url: process.env.RABBIT_URL || 'amqp://localhost:5672/sasuai',
    exchange: 'SASUAI',
  });

  await send.sendAndClose({
    routingKey: 'whatsapp',
    message: payload,
  });
}
// Export
export { RabbitMQProducer, publishToRabbitMQ };
export type { RabbitMQConfig, PublishOptions };
