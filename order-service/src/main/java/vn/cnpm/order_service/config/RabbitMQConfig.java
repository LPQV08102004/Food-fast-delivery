package vn.cnpm.order_service.config;

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
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String RESTAURANT_EXCHANGE = "restaurant.exchange";
    public static final String DELIVERY_EXCHANGE = "delivery.exchange";

    // Queue names
    public static final String ORDER_CREATED_QUEUE = "order.created.queue";
    public static final String PAYMENT_PROCESSED_QUEUE = "payment.processed.queue";
    public static final String ORDER_PAID_QUEUE = "order.paid.queue";
    public static final String ORDER_READY_QUEUE = "order.ready.queue";
    public static final String ORDER_PICKED_UP_QUEUE = "order.pickedup.queue";
    public static final String ORDER_DELIVERING_QUEUE = "order.delivering.queue";
    public static final String ORDER_COMPLETED_QUEUE = "order.completed.queue";
    public static final String DRONE_LOCATION_UPDATE_QUEUE = "drone.location.update.queue";

    // Routing keys
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String PAYMENT_PROCESSED_ROUTING_KEY = "payment.processed";
    public static final String ORDER_PAID_ROUTING_KEY = "order.paid";
    public static final String ORDER_READY_ROUTING_KEY = "order.ready";
    public static final String ORDER_PICKED_UP_ROUTING_KEY = "order.pickedup";
    public static final String ORDER_DELIVERING_ROUTING_KEY = "order.delivering";
    public static final String ORDER_COMPLETED_ROUTING_KEY = "order.completed";
    public static final String DRONE_LOCATION_UPDATE_ROUTING_KEY = "drone.location.update";

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

    // Order Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
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

    // Delivery Exchange
    @Bean
    public TopicExchange deliveryExchange() {
        return new TopicExchange(DELIVERY_EXCHANGE);
    }

    // Order Created Queue
    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE, true);
    }

    // Payment Processed Queue
    @Bean
    public Queue paymentProcessedQueue() {
        return new Queue(PAYMENT_PROCESSED_QUEUE, true);
    }

    // Order Paid Queue (cho Restaurant Service)
    @Bean
    public Queue orderPaidQueue() {
        return new Queue(ORDER_PAID_QUEUE, true);
    }

    // Order Ready Queue (cho Delivery Service)
    @Bean
    public Queue orderReadyQueue() {
        return new Queue(ORDER_READY_QUEUE, true);
    }

    // Order Picked Up Queue
    @Bean
    public Queue orderPickedUpQueue() {
        return new Queue(ORDER_PICKED_UP_QUEUE, true);
    }

    // Order Delivering Queue
    @Bean
    public Queue orderDeliveringQueue() {
        return new Queue(ORDER_DELIVERING_QUEUE, true);
    }

    // Order Completed Queue
    @Bean
    public Queue orderCompletedQueue() {
        return new Queue(ORDER_COMPLETED_QUEUE, true);
    }

    // Drone Location Update Queue
    @Bean
    public Queue droneLocationUpdateQueue() {
        return new Queue(DRONE_LOCATION_UPDATE_QUEUE, true);
    }

    // Binding: Order Created Queue -> Order Exchange
    @Bean
    public Binding orderCreatedBinding() {
        return BindingBuilder
                .bind(orderCreatedQueue())
                .to(orderExchange())
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    // Binding: Payment Processed Queue -> Payment Exchange
    @Bean
    public Binding paymentProcessedBinding() {
        return BindingBuilder
                .bind(paymentProcessedQueue())
                .to(paymentExchange())
                .with(PAYMENT_PROCESSED_ROUTING_KEY);
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

    // Binding: Order Picked Up Queue -> Delivery Exchange
    @Bean
    public Binding orderPickedUpBinding() {
        return BindingBuilder
                .bind(orderPickedUpQueue())
                .to(deliveryExchange())
                .with(ORDER_PICKED_UP_ROUTING_KEY);
    }

    // Binding: Order Delivering Queue -> Delivery Exchange
    @Bean
    public Binding orderDeliveringBinding() {
        return BindingBuilder
                .bind(orderDeliveringQueue())
                .to(deliveryExchange())
                .with(ORDER_DELIVERING_ROUTING_KEY);
    }

    // Binding: Order Completed Queue -> Delivery Exchange
    @Bean
    public Binding orderCompletedBinding() {
        return BindingBuilder
                .bind(orderCompletedQueue())
                .to(deliveryExchange())
                .with(ORDER_COMPLETED_ROUTING_KEY);
    }

    // Binding: Drone Location Update Queue -> Delivery Exchange
    @Bean
    public Binding droneLocationUpdateBinding() {
        return BindingBuilder
                .bind(droneLocationUpdateQueue())
                .to(deliveryExchange())
                .with(DRONE_LOCATION_UPDATE_ROUTING_KEY);
    }
}

