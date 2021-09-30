import * as cdk from '@aws-cdk/core';
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import {AttributeType, Table} from "@aws-cdk/aws-dynamodb";




export class ProjectRestfullApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    

    const dynamoTable = new Table(this , "book" ,{
       partitionKey: {
         name: "bookId",
         type: AttributeType.STRING
       }
    });
    

    const getOneLambda = new lambda.Function(this , "getOneLambda", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambdas"),
      handler: "getOneLambda.handler",
      memorySize : 1024,
      environment: {
        PRIMARY: "bookId",
        TABLE_NAME : dynamoTable.tableName,
      }
    })
    const getAllLambda = new lambda.Function(this , "getAllLambda", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambdas"),
      handler: "getAllLambda.handler",
      memorySize : 1024,
      environment: {
        PRIMARY: "bookId",
        TABLE_NAME : dynamoTable.tableName,
      }
    });

    const createOneLambda = new lambda.Function(this , "addBook", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambdas"),
      handler: "addBook.handler",
      memorySize : 1024,
      environment: {
        PRIMARY: "bookId",
        TABLE_NAME : dynamoTable.tableName,
      }
    })

    const updateOneLambda = new lambda.Function(this , "updateBook", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambdas"),
      handler: "updateBook.handler",
      memorySize : 1024,
      environment: {
        PRIMARY: "bookId",
        TABLE_NAME : dynamoTable.tableName,
      }
    })
 
    const deleteOneLambda = new lambda.Function(this , "deleteBook", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambdas"),
      handler: "deleteBook.handler",
      memorySize : 1024,
      environment: {
        PRIMARY: "bookId",
        TABLE_NAME : dynamoTable.tableName,
      },
    });
    
    // // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(updateOneLambda);    
    dynamoTable.grantReadWriteData(deleteOneLambda);
    
     // Integrate the Lambda functions with the API Gateway resource
    
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration =  new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);

    // Create an API Gateway resource for each of the CRUD operations

    const api = new RestApi(this , 'booksApi',{
      restApiName: "Simple Books",
    });

    const items = api.root.addResource("books");
    items.addMethod("GET",getAllIntegration);
    items.addMethod("POST", createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource("{id}");
    singleItem.addMethod("GET", getAllIntegration);
    singleItem.addMethod("PATCH",updateOneIntegration);
    singleItem.addMethod('DELETE',deleteOneIntegration);
    addCorsOptions(singleItem);
     
}
  
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
