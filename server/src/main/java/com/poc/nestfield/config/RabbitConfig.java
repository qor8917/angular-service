package com.poc.nestfield.config;

import org.springframework.amqp.core.AnonymousQueue;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.poc.nestfield.amqp.Receiver;


@Configuration
public class RabbitConfig {

	@Bean
	public static TopicExchange topic() {
		return new TopicExchange("amq.topic");
	}

	private static class ReceiverConfig {
		
		@Bean
		public Receiver receiver() {
			return new Receiver();
		}

		@Bean
		public Queue autoDeleteQueue1() {
			return new AnonymousQueue();
		}

		@Bean
		public Queue autoDeleteQueue2() {
			return new AnonymousQueue();
		}
		
		@Bean
		public Binding binding1a(TopicExchange topic, Queue autoDeleteQueue1) {
			return BindingBuilder.bind(autoDeleteQueue1).to(topic).with("sensors.#");
		}

		
//		@Bean
//		public Binding binding1b(TopicExchange topic, Queue autoDeleteQueue1) {
//			return BindingBuilder.bind(autoDeleteQueue1).to(topic).with("*.*.rabbit");
//		}
//		
//
//		@Bean
//		public Binding binding2a(TopicExchange topic, Queue autoDeleteQueue2) {
//			return BindingBuilder.bind(autoDeleteQueue2).to(topic).with("lazy.#");
//		}

	}
}
