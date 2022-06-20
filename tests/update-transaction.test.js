const {describe, expect, test} = require('@jest/globals');
const supertest = require('supertest');
const app = require('../src/app');
const TransactionModel = require('../src/models/transaction');
const transactionModel=new TransactionModel();

const request = supertest(app);
const mockCreateData= {
    "customerId": "234b6742d6676e356218155a",
    "fromAmount": 57.15,
    "fromCurrency": "EUR",
    "toAmount": 26000.87,
    "toCurrency": "NGN"
}

let mockUpdateData= {
    "customerId": "113b6742d6676e356218155a",
    "fromAmount": 23.15,
    "fromCurrency": "EUR",
    "toAmount": 12000.12,
    "toCurrency": "NGN"
}
let failedValidationMockUpdateData= {
    "customerId": 22,
    "fromAmount": "rew",
    "fromCurrency": "EUR",
    "toAmount": 22.84,
    "toCurrency": "Dollar"
}
let createdData=null;
beforeAll(async () => {
    await TransactionModel.connectDB();
});

describe('Update an fx transaction', ()=> {

    //test: Should be able to update an existing fx transaction with well-formed data
    test('Should be able to update an existing fx transaction with well-formed data', async () => {
        const createResponse = await request.post('/transactions').send(mockCreateData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const createResponseBody = (createResponse && createResponse.body) ? createResponse.body : null;
        if (createResponseBody && createResponseBody.success && createResponseBody.data && createResponseBody.data.id) {
            createdData = createResponseBody.data;
            mockUpdateData.id=createdData.id?createdData.id:"";
            const response = await request.post(`/transactions/update`).send(mockUpdateData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
            const responseBody = (response && response.body) ? response.body : null;
            expect(response.status).toBe(200);
            expect(responseBody).toHaveProperty('success', true);
            expect(responseBody).toHaveProperty('data');
            expect(responseBody.data).not.toBeNull();
            expect(responseBody.data).toHaveProperty('id');
            expect(responseBody.data.id).not.toBe('');
        }
    });

     /** test: Should be able to validate post data for required and well-formed data
     * and return failed response if not pass validation
     */
    test('Should be able validate post data for required and well-formed data and return errors if failed', async () => {
        //deleting earlier created test transaction if any
        if (createdData && createdData.id) {
            await transactionModel.delete(createdData.id);
        }
        const createResponse = await request.post('/transactions').send(mockCreateData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const createResponseBody = (createResponse && createResponse.body) ? createResponse.body : null;
        console.log("failed createResponseBody",createResponseBody);
        if (createResponseBody && createResponseBody.success && createResponseBody.data && createResponseBody.data.id) {
            createdData = createResponseBody.data;
            failedValidationMockUpdateData.id=createdData.id?createdData.id:"";
            const response = await request.post(`/transactions/update`).send(failedValidationMockUpdateData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
            const responseBody = (response && response.body) ? response.body : null;
            console.log("failed responseBody",responseBody);
            console.log("failed response.status",response.status);
            expect(response.status).toBe(400);
            expect(responseBody).toHaveProperty('success', false);
            expect(responseBody).toHaveProperty('errors');
            expect(responseBody.errors).not.toBeNull();
            expect(responseBody.errors).toHaveProperty('toCurrency');
            expect(responseBody.errors.toCurrency).not.toBe('');
        }
    });


    /** test: Should be able to handle unexpected internal system/server error
     * and present user with user-friendly feedback message
     */
    test('Should be able to handle unexpected internal system error when updating a transaction', async () => {
        if (createdData && createdData.id) {
            await transactionModel.delete(createdData.id);
        }
        await TransactionModel.closeDBConnection();
        const response = await request.post('/transactions/update').send(mockUpdateData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const responseBody = (response && response.body) ? response.body : null;
        expect(response.status).toBe(500);
        expect(responseBody).toHaveProperty('success', false);
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).not.toBeNull();
        expect(responseBody.errors).toHaveProperty('app');
        expect(responseBody.errors.app).not.toBe('');
    })
});