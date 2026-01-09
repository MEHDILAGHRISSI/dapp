package ma.fstt.bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.cancelled}")
    private String cancelledRoutingKey;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.expired:booking.expired}")
    private String expiredRoutingKey;

    // ========== EXCHANGES ==========

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(exchange);
    }

    // ========== NOUVEAU : Dead Letter Exchange ==========

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange("rental.dlx");
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue("rental.dlq", true);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder
                .bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with("*.dead");
    }

    // ========== MODIFIER : Queues avec DLX ==========

    @Bean
    public Queue bookingCancelledQueue() {
        return QueueBuilder.durable("booking.cancelled.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.cancelled.dead")
                .build();
    }

    @Bean
    public Queue bookingConfirmedQueue() {
        return QueueBuilder.durable("booking.confirmed.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.confirmed.dead")
                .withArgument("x-message-ttl", 300000)  // 5 minutes TTL
                .build();
    }

    @Bean
    public Queue bookingExpiredQueue() {
        return QueueBuilder.durable("booking.expired.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.expired.dead")
                .build();
    }

    // ========== BINDINGS ==========

    @Bean
    public Binding bookingCancelledBinding() {
        return BindingBuilder
                .bind(bookingCancelledQueue())
                .to(bookingExchange())
                .with(cancelledRoutingKey);
    }

    @Bean
    public Binding bookingConfirmedBinding() {
        return BindingBuilder
                .bind(bookingConfirmedQueue())
                .to(bookingExchange())
                .with(confirmedRoutingKey);
    }

    @Bean
    public Binding bookingExpiredBinding() {
        return BindingBuilder
                .bind(bookingExpiredQueue())
                .to(bookingExchange())
                .with(expiredRoutingKey);
    }

    // ========== CONVERTERS ==========

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}