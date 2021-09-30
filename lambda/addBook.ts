import * as AWS from "aws-sdk";
import {v4 as uuidv4} from "uuid";

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

const db = new AWS.DynamoDB.DocumentClient();


export async function handler(event: any = {}): Promise<any> {
  console.log("request:", JSON.stringify(event, undefined, 2));
  if (!event.body) {
    return {
      statusCode : 400,
      body: "invalid request , you are missing the parameter body",
    };
  }
  
  const item = typeof event.body == "object" ? event.body: JSON.parse(event.body);
  item[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body:""};

  }
  catch(err){
    console.log("DynamoDB error ", err);
    return {statusCode: 500, body: err};
  };
}