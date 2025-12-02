package vn.cnpm.delivery_service.config;

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
    public static final String RESTAURANT_EXCHANGE = "restaurant.exchange";
    public static final String DELIVERY_EXCHANGE = "delivery.exchange";
    public static final String ORDER_EXCHANGE = "order.exchange";

    // Queue names
    public static final String ORDER_READY_QUEUE = "order.ready.queue";
    public static final String ORDER_PICKED_UP_QUEUE = "order.pickedup.queue";
    public static final String ORDER_DELIVERING_QUEUE = "order.delivering.queue";
    public static final String ORDER_COMPLETED_QUEUE = "order.completed.queue";
    public static final String DRONE_LOCATION_UPDATE_QUEUE = "drone.location.update.queue";

    // Routing keys
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

    // Order Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // Order Ready Queue (nhận từ Restaurant Service)
    @Bean
    public Queue orderReadyQueue() {
        return new Queue(ORDER_READY_QUEUE, true);
    }

    // Order Picked Up Queue (gửi đến Order Service)
    @Bean
    public Queue orderPickedUpQueue() {
        return new Queue(ORDER_PICKED_UP_QUEUE, true);
    }

    // Order Delivering Queue (thông báo bắt đầu giao hàng)
    @Bean
    public Queue orderDeliveringQueue() {
        return new Queue(ORDER_DELIVERING_QUEUE, true);
    }

    // Order Completed Queue (thông báo hoàn thành)
    @Bean
    public Queue orderCompletedQueue() {
        return new Queue(ORDER_COMPLETED_QUEUE, true);
    }

    // Drone Location Update Queue (cập nhật GPS real-time)
    @Bean
    public Queue droneLocationUpdateQueue() {
        return new Queue(DRONE_LOCATION_UPDATE_QUEUE, true);
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
