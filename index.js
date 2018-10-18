const {asyncForEach, asyncMap} = require('./lib')
const sa = require('superagent')

const binance = require('node-binance-api')().options({
  APIKEY: process.env.APIKEY,//'e7hhPJkfx8STmlh1X96DvS94Q5rTqv5SE0C7fsHfSCbmwrHn6e3QPeckm533qoPy',
  APISECRET: process.env.APISECRET,//'yb5SlN4UXzsgk8hohrHSy2GyN61G7rbGqhTCcx9IIzX6qMfcN9lGf5GoARUgqp0e',
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  //test: true // If you want to use sandbox mode where orders are simulated
});

class Push{
	constructor(apiKey) {
		this.address = 'https://api.pushbullet.com/v2/'
		this.key = apiKey
		this.email = process.env.EMAIL
	}

	me() {
		return sa.get(this.address + `users/me`).set(`Access-Token`, this.key)
	}

	push({body, title, type = 'note'}) {
		return sa.post(this.address + `pushes`).set(`Access-Token`, this.key).send({body, title, type})
	}
}


class Binance{
	constructor(binance) {
		this.binance = binance
		this.orders = {}
	}

	async openOrders() {
		return new Promise((resolve, reject) => {
			this.binance.openOrders(false, (error, openOrders) => {
				if (error) reject(error)
			  	// console.log("openOrders()", openOrders);
			  	resolve(openOrders)
			});
		})
	}

	async orderStatus(order) {
		return new Promise((resolve, reject) => {
			binance.orderStatus(order.symbol, order.orderId, (error, orderStatus, symbol) => {
				if (error) reject(error)
			  	// console.log("openOrders()", openOrders);
			  	resolve(orderStatus)
			  	// console.log(symbol+" order status:", orderStatus);
			});
		})
	}
}


// const update = async () => {

// }


const main = async () => {
	const b = new Binance(binance)
	const p = new Push(process.env.PUSHTOKEN)
	const orders = {}

	const interval = setInterval(async () => {
		
		var openOrders = await b.openOrders();

		openOrders.forEach(order => {
		  	if (!(order.orderId in orders)) {
		  		console.log(`adding order ${order.orderId}`)
		  		orders[order.orderId] = order
		  	}
		 })

		// console.log('Orders:', orders)

		console.log('-----------')
		const canceled = []
		const filled = []

		asyncForEach(Object.keys(orders), async (orderId) => {
		// Object.keys(orders).forEach(async (orderId) => {
			const order = orders[orderId]
			console.log(`Order found in orders: ${order.orderId}, ${order.symbol}`)
			const orderUpdate = await b.orderStatus(order).catch(e => console.log(e))
			console.log(order.symbol+" order status:", orderUpdate);

			if (orderUpdate.status == 'CANCELED') canceled.push(orderUpdate)
			if (orderUpdate.status == 'FILLED') filled.push(orderUpdate)

			// binance.orderStatus(order.symbol, order.orderId, (error, orderStatus, symbol) => {
			  
			// });
		})

		canceled.forEach(order => {
			// await sendNotification()
			delete orders[order.orderId]
		})

		filled.forEach(async (order) => {
			await p.push({body:`${order.side} ${order.symbol}: $:${order.price}, q: ${order.origQty}`, title:'Filled'})
			delete orders[order.orderId]
		})



	}, 10000);
	
}


(async () => await main())()

