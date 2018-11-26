const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient
const transporter = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});
const MLAB_URL = 'mongodb://boris:boris@ds123499.mlab.com:23499/dakiya';
const DBNAME = 'dakiya';
const COLLECTIONNAME = 'courier';

const id = 779083001734
const recieverEmail = 'rahubora11@gmail.com'



const createResponse  = (statusCode, message , success) =>{
 return {
     status:statusCode, 
     body:JSON.stringify({message:message , success:success })
 }
}

const  callback= ( func , response )=>{
 console.log(response);
}

// const createHTMl=()=>{
//     return `
//     <p>   </p>
//     `
// }
// const mailOptions = {
//     from: 'rahulbora2068@gmail.com', // sender address
//     to: 'rahul.bora@treebohotels.com', // list of receivers
//     subject: 'Deleivered', // Subject line
//     html: createHTMl()// plain text body
//   };



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

    const mailer = (recieverEmail)=> {
      const mailOptions = {
        from: 'rahulbora2068@gmail.com', // sender address
        to: `${recieverEmail}`, // list of receivers
        subject: 'Deleivered', // Subject line
        html: '<p>Your html here</p>'// plain text body
      };
      return new Promise ((resolve , reject)=>{
       transporter.sendMail(mailOptions, function(error, info){
         if (error) {
             reject('Error in sending mail')
          } else {
             resolve(`Email Successfully Send to ${info.message}` ) 
          }
        });
      })
    } 


   const  saveToDatabase = (data)=>{
       return new Promise ( (resolve , reject)=>{
         const deliveryRegex = new RegExp(/DELIVERED/);
         if(deliveryRegex.test(data.crawledData[7])){
             collection.findOneAndUpdate({
                 courierId: id , 
                 recieverEmail:recieverEmail
                }, {
                    courierId:id,
                    recieverEmail:recieverEmail ,
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
                    emailSend: true,
                }, {upsert:true}).then(successObject=>{
                    const recieverEmail = successObject.value.recieverEmail;
                    return mailer(recieverEmail)
                }).then(mailerResponse=>{
                  console.log(mailerResponse)
                    resolve({success:true , message:'saved and mail send successfully'})
                }).catch(err=>{
                    reject({success:false  , message:err})
                })
            }
            else {
              collection.findOneAndUpdate({
                courierId: id , 
                recieverEmail:recieverEmail
               },{
                   courierId:id,
                   recieverEmail:recieverEmail ,
                   time: new Date().toString(),
                   emailSend: false,
               },{upsert:true}).then(successObject=>{
                   resolve({success:true , message:'saved successfully to database'})
               }).catch(err=>{
                   reject({success:false  , message:err})
               })
            }
            })    
        }
        

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
     return  saveToDatabase(data)
    })
    .then(data=>{
        callback(null ,createResponse(200, data.message, data.success))
        database.close()
    }).catch(err => {
      callback(null, createResponse(500, err))
      database.close()
    })
  })
