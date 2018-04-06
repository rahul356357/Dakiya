'use strict';
const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient
var aws = require('aws-sdk');
const transporter = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: 'rahulbora2068@gmail.com',
  }
});
const MLAB_URL = 'mongodb://<dbname>:<passsword>@ds123499.mlab.com:23499/dakiya';
const DBNAME = 'dakiya';
const COLLECTIONNAME = 'courier';

///////////// register tod database /////////////////////
module.exports.registerToDatabase = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const id = body.id;
  const rmail = body.rmail;
  const createResponse = (statusCode, message, event) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({message: message})
    }
  }
  if (id === null || rmail === null) {
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
      rmail: rmail
    }, {upsert: true}).then(d => {
      console.log('db save result');
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

  const createResponse = (statusCode, message, success) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({message: message, success: success})
    }
  }

  const body = JSON.parse(event.body);
  const id = body.id;
  const rmail = body.rmail;
  if (id === null || rmail === null) {
    callback(null, createResponse(400, 'Required Missing Field'))
  }

  MongoClient.connect(MLAB_URL, (err, database) => {
    if (err) {
      console.log('error in connection to database')
      callback(null, createResponse(500, 'Unable to connect to Database'))
      database.close()
    }
    const db = database.db(DBNAME);
    const collection = db.collection(COLLECTIONNAME);
    const bookingData = [];
    const travellingData = [];
    const deliveryData = []
    let documentLink = ''
  
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
      return {
        crawledData: bookingData[0].split(/\n/),
        link: documentLink,
        travellingInfo: {
          date: travellingData[0],
          message: travellingData[1]
        }
      }
    }).then(data=> {
      const deliveryRegex = new RegExp(/DELIVERED/);
      if (deliveryRegex.test(data.crawledData[7])) {
        console.log("inside success" , rmail);
        collection.findOneAndUpdate({
          courierId: id,
          rmail: rmail
        }, {
          courierId: id,
          rmail: rmail,
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
          emailSend: true
        }, {upsert: true}).then(successObject => {
          const mailOptions = {
            from: 'rahulbora2068@gmail.com', // sender address
            to: `${rmail}`, // list of receivers
            subject: 'Delivered', // Subject line
            html: '<p>Your html here</p>' // plain text body
          };
            transporter
              .sendMail(mailOptions,  (error, info) => {
                if (error) {
                  console.log('error in sending mail herer')
                  throw new Error({success:false, message:'error in mailer'})
                } else {
                  return({success:true , message:"mail sent successfully"})
                }
              });
          }).then(mailerResponse => {
          return({success: true, message:"mail sent success"})
        }).catch(err => {
          console.log('errror in saving to database ###############')
          throw new Error  ({success: false, message: "error in save database"})
        })
      } else {
        collection.findOneAndUpdate({
          courierId: id,
          rmail: rmail
        }, {
          courierId: id,
          rmail: rmail,
          time: new Date().toString(),
          emailSend: false
        }, {upsert: true}).then(successObject => {
          return ({success: true, message: 'saved successfully to database'})
        }).catch(err => {
          console.log('errror in saving to database ###############%%%%%%%%%%%%%%%%')
          throw new Error({success: false, message: err})
        })
      }
      }).then(response => {
      callback(null, createResponse(200, "successfull opertaion"  , true))
      database.close()
    }).catch(err => {
      console.log(err);
      console.log('errror in saving to database')
      callback(null, createResponse(500, "line 204 " , false ))
      database.close()
    })
  })
}

// //  ---------------crawlCourier   ------------------------//////////
module.exports.checkCourierStatus = (event, context, callback) => {
  const createResponse = (statusCode, message, event) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({message: message})
    }
  }
  console.log(new Date().toLocaleString())
  callback(null, createResponse(200, "in herererererer"))
}
