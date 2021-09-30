import * as AWS from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME || "";


const db = new AWS.DynamoDB.DocumentClient();


export async function handler(): Promise<any> {
  
  const params = {
    TableName: TABLE_NAME,
  
  };

  try {
      
    const response = await db.scan(params).promise();
    return { statusCode: 201, body: JSON.stringify(response.Items)};

  }
  catch(err){
    console.log("DynamoDB error ", err);
    return {statusCode: 500, body: err};
  };
}

