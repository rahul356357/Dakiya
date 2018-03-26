'use strict';
const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient
const transporter = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: 'rahulbora2068@gmail.com',
    pass: 'tanuja@2068'
  }
});
const MLAB_URL = 'mongodb://boris:boris@ds123499.mlab.com:23499/dakiya';
const DBNAME = 'dakiya';
const COLLECTIONNAME = 'courier';


///////////// register tod database /////////////////////
module.exports.registerToDatabase = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const id = body.id;
  const receiverEmail = body.receiverEmail;
  const createResponse = (statusCode, message, event) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({message: message})
    }
  }
  if (id === null || receiverEmail === null) {
    callback(null, createResponse(400, 'Required Field Missing'))
  }
  MongoClient.connect(MLAB_URL, (err, database) => {
    if (err) {
      console.log('error in connectind to db')
      callback(null, createResponse(500, 'error in connecting to db'))
    }
    const db = database.db(DBNAME);
    const collection = db.collection(COLLECTIONNAME);

    collection.update({
      courierId: id
    }, {
      courierId: id,
      receiverEmail: receiverEmail
    }, {upsert: true}).then(d => {
      console.log('db save result')
      console.log(d);
      callback(null, createResponse(200, 'Courier Successfully Registered'))
      database.close()
    }).catch(err => {
      console.log('err occured')
      callback(null, createResponse(400, 'Unable to Register Courier'))
      database.close()
    })
  })
}

module.exports.crawlCourier = (event, context, callback) => {
  const createResponse = (statusCode, message, event) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({message: message})
    }
  }
  
  const body = JSON.parse(event.body);
  const id = body.id;
  if (id === null) {
    callback(null, createResponse(400, 'Required Missing Field'))
  }
  MongoClient.connect(MLAB_URL, (err, database) => {
    console.log('in herer in mongodb connection');
    if (err) {
      console.log('error in connection to database')
      callback(null, createResponse(500, 'Unable to connect to Database'))
      database.close()
    }
    const db = database.db(DBNAME);
    const collection = db.collection(COLLECTIONNAME);
    const bookingData = [];
    const travellingData = [];
    const deliveryData= []
    let documentLink =''
    const options = {
      uri: `http://www.shreemaruticourier.com/track-your-shipment/?tracking_id=${id}`,
      transform: (body) => {
        return cheerio.load(body);
      }
    };
    rp(options).then($ => {
      $('.table_shippment  tbody  tr').each((index, element) => {
        if (index === 1) {
          const t = $(element)
            .text()
            .trim();
          bookingData.push(t);
        }
      })
      $('#traveling_div  .table_shippment  tbody  .date_header').each((index, element) => {
        const t = $(element).text();
        travellingData.push(t);
      })
      $('#delivery_information tbody tr').each((index, element) => {
        const c = $(element)
          .find('td')
          .text();
        const a = $(element)
          .find('a')
          .attr('href');
        deliveryData.push({key: c});
        if (a) {
          documentLink = a;
        }
      });
      console.log(bookingData);
      console.log(travellingData);
      console.log(deliveryData);
      console.log(documentLink)

      return {
        crawledData: bookingData[0].split(/\n/),
        link: documentLink,
        travellingInfo: {
          date: travellingData[0],
          message: travellingData[1]
        }
      }
    }).then(data => {
      console.log('in herer in collection');
      collection.findOneAndUpdate({
        courierId: id
      }, {
        courierId:id,
        deliveryStatus: data.crawledData[7],
        reciever: data.crawledData[4],
        bookingDate: data.crawledData[1],
        fromCenter: data.crawledData[2],
        toCenter: data.crawledData[3],
        courierType: data.crawledData[5],
        deliveryDate: data.crawledData[6],
        documentLink: data.link,
        travellingInfo: data.travellingInfo,
        time: new Date().toString(),
        emailSend: false
      }, {upsert:true}).then(d => {
        console.log('in herereererer data saved')
        callback(null, createResponse(200, 'successfully crawled'))
        database.close()
      }).catch(() => {
        throw new Error('Unable to Save to Database');
      })
    }).catch(err => {
      callback(null, createResponse(500, err))
      database.close()
    })
  })
}

// //  ---------------crawlCourier   ------------------------//////////
// module.exports.checkCourierStatus = (event, context, callback) => { const
// body = JSON.parse(event.body); const id = body.id; const createResponse =
// (statusCode, message, event) => {   return {     statusCode: statusCode,
// body: JSON.stringify({message: message})   } } callback(null,
// createResponse(200, "in herererererer")) }