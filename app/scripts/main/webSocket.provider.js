(function() {
	'use strict';

	angular
	  .module('app.main')
	  .provider('$socket', $socket);

	function $socket() {

		var options = {
			address: null,
			broadcastPrefix: '$socket.',
			reconnectInterval: 5000,
			receiveInterval: 500,
			parser: null,
			formatter: null,
			logger: function() {}
		};

		function parser(msg) {
			return angular.fromJson(msg);
		}

		function formatter(event, data) {
			return angular.toJson([event, data]);
		}

		var queue = [];
		var fireQueue = [];
		var firePromise = null;
		var socket = null;
		var socketConnected;
		var reconect = false;
		var intervalo;

		function socketFactory($rootScope, $interval, $timeout) {

			/**
			 * attaches listener on $rootScope or to the provided scope
			 */
			function on(event, listener, scope) {
				return (scope || $rootScope).$on(options.broadcastPrefix + event, listener);
			}

			/**
	sends the message if connected or queues it for later
	*/
			function send(event, data) {
				var message = (options.formatter || formatter)(event, data);
				if (socketConnected) {
					socket.send(message);
				} else {
					queue.push(message);
				}
			}

			function emit(token, data, wsCalibracion) {
				var message = angular.toJson({token: token, data: data});
				if (wsCalibracion) {
					message = angular.toJson({name: token, data: data});
				}
				if (socketConnected) {
					socket.send(message);
				} else {
					queue.push(message);
				}
			}

			function newSocket(url) {
				options.address = url || options.address;
				socketConnected = false;
				reconect = false;
				socket = null;
				if (!window.SockJS) {
					return options.logger(new Error("Must include SockJS for ng-socket to work"));
				}
				if (!options.address) {
					return options.logger(new Error("Must configure the address"));
				}
				socket = new SockJS(options.address);
				socket.onopen = function() {
					socketConnected = true;
					reconect = true;
					$interval.cancel(intervalo);
					$rootScope.$broadcast(options.broadcastPrefix + "open");
					for (var i in queue) {
						socket.send(queue[i]);
					}
					queue = [];
				};

				socket.onmessage = function(msg) {
					msg = (options.parser || parser)(msg.data);
					if (!Array.isArray(msg) || msg.length !== 2) {
						return options.logger(new Error("Invalid message " + msg.toString()));
					}

					fire(msg[0], msg[1]);
				};

				socket.onclose = function(e) {
					socketConnected = false;
					socket = null;
					if (reconect) {
	                	intervalo = $interval(function () {
	                		if (navigator.onLine) {
	                			newSocket();
	                		}
	                	}, options.reconnectInterval);
					}
					
				};

			}

			function close () {
				reconect = false;
				if (!socket) {
					return false;
				}
				socket.close();
				socket = null;
				console.log('Web socket Desconectado...');
			}

			function fireAll() {
				for (var i in fireQueue) {
					$rootScope.$broadcast(options.broadcastPrefix + fireQueue[i].event, fireQueue[i].data);
				}
				fireQueue = [];
			}

			function fire(event, data) {
				fireQueue.push({
					event: event,
					data: data
				});
				if (!firePromise) {
					firePromise = $timeout(fireAll, options.receiveInterval, true)['finally'](function() {
						firePromise = null;
					});
				}
			}

			function getState() {
				return socketConnected;
			}

			return {
				start: newSocket,
				send: send,
				emit: emit,
				on: on,
				close: close,
				getState: getState,
				socket: function() {
					return socket;
				}
			};
		}


		this.$get = socketFactory;

		this.configure = function(opt) {
			angular.extend(options, opt);
		};

	}
})();