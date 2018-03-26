const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient
const MLAB_URL = 'mongodb://boris:boris@ds123499.mlab.com:23499/dakiya';
const DBNAME = 'dakiya';
const COLLECTIONNAME = 'courier';
// const body = JSON.parse(event.body);
const receiverEmail = 'tkumar@gmail.com'
const bookingData = [];
const travellingData = [];
const deliveryData = [];
let documentLink = ''

const transporter = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: 'rahulbora2068@gmail.com',
    pass: 'tanuja@2068'
  }
});


// const createResponse = (statusCode, message, event) => {
  //     return {
    //       statusCode: statusCode,
    //       body: JSON.stringify({message: message})
    //     }
    //   }
const callback = (event , message)=>{
   console.log('message');
}
// if (id === null || receiverEmailAddress === null) {
//   callback(null, createResponse(400, 'Required Field Missing'), event)
// }
const createResponse = (statusCode, message, event) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({message: message})
  }
}
// MongoClient.connect(MONGO_URL, (err, database) => {
//   const c = database.db(DBNAME);
//   const collection = c.collection(COLLECTIONNAME);
//   if (err) {
//     callback(null, createResponse(500, 'Error in Connecting To DATABASE'), event)
//     database.close();
//   }
//   const options = {
//     uri: `http://www.shreemaruticourier.com/track-your-shipment/?tracking_id=${id}`,
//     transform: (body) => {
//       return cheerio.load(body);
//     }
//   }
//   rp(options).then($ => {
//     $('.table_shippment  tbody  tr').each((index, element) => {
//       if (index === 1) {
//         const t = $(element)
//           .text()
//           .trim();
//         bookingData.push(t);
//       }
//     })
//     $('#traveling_div  .table_shippment  tbody  .date_header').each((index, element) => {
//       const t = $(element).text();
//       travellingData.push(t);
//     })
//     $('#delivery_information tbody tr').each((index, element) => {
//       const c = $(element)
//         .find('td')
//         .text();
//       const a = $(element)
//         .find('a')
//         .attr('href');
//       deliveryData.push({key: c});
//       if (a) {
//         documentLink = a;
//       }
//     });
//     return  {
//       crawledData: bookingData[0].split(/\n/),
//       link: documentLink,
//       travellingInfo: {
//         date: travellingData[0],
//         message: travellingData[1]
//       }
//     }
//   }).then((data) => {
//     console.log(data.crawledData[0])
//     collection.insertOne({
//             courierNumber: data.crawledData[0],
//             bookignDeliveryStatus: data.crawledData[7],
//             bookingReciever: data.crawledData[4],
//             bookingDate: data.crawledData[1],
//             bookingFromCenter: data.crawledData[2],
//             bookingToCenter: data.crawledData[3],
//             bookingType: data.crawledData[5],
//             bookingDeliveryData: data.crawledData[6],
//             bookingDocumentLink: data.link,
//             travellingInfo: data.travellingInfo  ,
//             receiverEmailAddress:receiverEmailAddress,
//             time:new Date().toString()
//     }, (x) => {
//       callback(null, createResponse(200, "Successfully Stored"))
//       database.close()
//     })
//   }).catch(err => {
//     console.log(err)
//     callback(null, createResponse(500, 'Error in saving data'), event)
//     database.close()
//   })
// });

const createHTML = (data)=>{
 return `
 <p>${JSON.stringify(data)}  </p>
 `
}

// MongoClient.connect(MONGO_URL , (err, database)=>{
   
//   if(err){
//     callback(null , createResponse(500 , 'Error In Connecting to Database'))
//   }   
//   const c = database.db(DBNAME);
//   const collection = c.collection(COLLECTIONNAME);
//   // collection.findOne({}).then(data=>{
//   //   console.log(data)
//   // })
//   collection.findOneAndUpdate({courierNumber:"779083001697", emailSend:false , }, {$set:{emailSend:true}},
//   {upsert: true}).then(d=>{
//     // console.log(d)
//     if(d===null){
//       throw new Error('Document Does  Not Exist in Db');
//     }
//     const mailOptions = {
//       from: 'rahulbora2068@gmail.com', // sender address
//       to: 'rahul.bora@treebohotels.com', // list of receivers
//       subject: `Courier ${d.courierNumber} has been DELIVERED`, // Subject line
//       html: createHTML(d)// plain text body
//     };
//     transporter.sendMail(mailOptions, function(error, info){
//       if (error) {
//         throw new Error('Error in sending mail')
//       } else {
//        console.log({statusCode:200 , message:'email send successfully' , })
//       }
//     });
//     database.close()
//   }).catch(err=>{
//     console.log(err)
//     database.close()
//   })

// })


// MongoClient.connect(MLAB_URL, (err, database) => {
//   if (err) {
//     console.log('error in connectind to db')
//     callback(null, createResponse(500, 'error in connecting to db'))
//   }
//   const db = database.db(DBNAME);
//   const collection = db.collection(COLLECTIONNAME);

//   collection.update({
//     courierId: id
//   }, {
//     courierId: id,
//     receiverEmail: receiverEmail
//   }, {upsert: true})
//   .then(d => {
//     console.log('db save result')
//     console.log(d);
//     callback(null, createResponse(200, 'Courier Successfully Registered'))
//     database.close()
//   }).catch(err => {
//     console.log('err occured')
//     callback(null, createResponse(400, 'Unable to Register Courier'))
//     database.close()
//   })
// })


// module.exports.crawlCourier = (event, context, callback) => {
//   const body = JSON.parse(event.body);
//   const id = body.id
//   const bookingData = [];
//   const travellingData = [];
//   const deliveryData = [];
//   let documentLink = ''
//   if (id === null) {
//     callback(null, createResponse(400, 'Required Field Missing'), event)
//   }
//   const createResponse = (statusCode, message, event) => {
//     return {
//       statusCode: statusCode,
//       body: JSON.stringify({message: message})
//     }
//   }
  // MongoClient.connect(MONGO_URL, (err, database) => {
  //   const c = database.db(DBNAME);
  //   const collection = c.collection(COLLECTIONNAME);
  //   if (err) {
  //     callback(null, createResponse(500, 'Error in Connecting To DATABASE'), event)
  //     database.close();
  //   }
  //   const options = {
  //     uri: `http://www.shreemaruticourier.com/track-your-shipment/?tracking_id=${id}`,
  //     transform: (body) => {
  //       return cheerio.load(body);
  //     }
  //   }
  //   rp(options).then($ => {
  //     $('.table_shippment  tbody  tr').each((index, element) => {
  //       if (index === 1) {
  //         const t = $(element)
  //           .text()
  //           .trim();
  //         bookingData.push(t);
  //       }
  //     })
  //     $('#traveling_div  .table_shippment  tbody  .date_header').each((index, element) => {
  //       const t = $(element).text();
  //       travellingData.push(t);
  //     })
  //     $('#delivery_information tbody tr').each((index, element) => {
  //       const c = $(element)
  //         .find('td')
  //         .text();
  //       const a = $(element)
  //         .find('a')
  //         .attr('href');
  //       deliveryData.push({key: c});
  //       if (a) {
  //         documentLink = a;
  //       }
  //     });
  //     return {
  //       crawledData: bookingData[0].split(/\n/),
  //       link: documentLink,
  //       travellingInfo: {
  //         date: travellingData[0],
  //         message: travellingData[1]
  //       },
       
  //   }).then((data) => {
  //     console.log(data)
  //     collection.findOneAndUpdate({
  //       courierId: id
  //     }, {
  //       courierNumber: data.crawledData[0],
  //       deliveryStatus: data.crawledData[7],
  //       reciever: data.crawledData[4],
  //       bookingDate: data.crawledData[1],
  //       fromCenter: data.crawledData[2],
  //       toCenter: data.crawledData[3],
  //       courierType: data.crawledData[5],
  //       deliveryDate: data.crawledData[6],
  //       documentLink: data.link,
  //       travellingInfo: data.travellingInfo,
  //       time: new Date().toString(),
  //       emailSend: false
  //     }}).then(status => {
  //     callback(null, createResponse(200, 'successfully crawled data stored in database'))
  //     database.close()
  //   }).catch(err => {
  //     console.log(err)
  //     callback(null, createResponse(500, 'error in saving data'))
  //     database.close()
  //   })});};
  const id = 779083003832;

  MongoClient.connect(MLAB_URL, (err, database) => {
    if (err) {
      console.log('error in connection to database')
      callback(null, createResponse(500, 'Unable to connect to Database'))
      database.close()
    }
    const db = database.db(DBNAME);
    const collection = db.collection(COLLECTIONNAME);
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
    }).then(data => {
      console.log(data)
      console.log('in herer incollection');
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
        time: new Date(),
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