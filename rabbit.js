const amqp = require('amqplib/callback_api');
const sqlite3 = require('sqlite3').verbose();

// Connect to RabbitMQ
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    
    const queue = 'task_queue';
    
    channel.assertQueue(queue, {
      durable: true
    });
    
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
    channel.consume(queue, function(msg) {
      const task = JSON.parse(msg.content.toString());
      const db = new sqlite3.Database('test.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the database.');
      });

      const sql = `DELETE FROM your_table`;

      db.run(sql, [], function(err) {
        if (err) {
          throw err;
        }
        console.log(`Deleted ${this.changes} rows from the table.`);
      });
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Close the database connection.');
      });

    }, {
      noAck: true
    });
  });
});
