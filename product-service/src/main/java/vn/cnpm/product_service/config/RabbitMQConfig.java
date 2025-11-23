package vn.cnpm.product_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange names
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String RESTAURANT_EXCHANGE = "restaurant.exchange";

    // Queue names
    public static final String ORDER_PAID_QUEUE = "order.paid.queue";
    public static final String ORDER_READY_QUEUE = "order.ready.queue";

    // Routing keys
    public static final String ORDER_PAID_ROUTING_KEY = "order.paid";
    public static final String ORDER_READY_ROUTING_KEY = "order.ready";

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

    // Payment Exchange
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    // Restaurant Exchange
    @Bean
    public TopicExchange restaurantExchange() {
        return new TopicExchange(RESTAURANT_EXCHANGE);
    }

    // Order Paid Queue (nh?n t? Payment Service)
    @Bean
    public Queue orderPaidQueue() {
        return new Queue(ORDER_PAID_QUEUE, true);
    }

    // Order Ready Queue (g?i d?n Delivery Service)
    @Bean
    public Queue orderReadyQueue() {
        return new Queue(ORDER_READY_QUEUE, true);
    }

    // Binding: Order Paid Queue -> Payment Exchange
    @Bean
    public Binding orderPaidBinding() {
        return BindingBuilder
                .bind(orderPaidQueue())
                .to(paymentExchange())
                .with(ORDER_PAID_ROUTING_KEY);
    }

    // Binding: Order Ready Queue -> Restaurant Exchange
    @Bean
    public Binding orderReadyBinding() {
        return BindingBuilder
                .bind(orderReadyQueue())
                .to(restaurantExchange())
                .with(ORDER_READY_ROUTING_KEY);
    }
}
