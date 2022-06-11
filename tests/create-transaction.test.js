const {describe, expect, test} = require('@jest/globals');
const supertest = require('supertest');
const app = require('../src/app');
const TransactionModel = require('../src/models/transaction');
const transactionModel=new TransactionModel();

const request = supertest(app);
const mockData= {
    "customerId": "234b6742d6676e356218155a",
    "fromAmount": 57.15,
    "fromCurrency": "EUR",
    "toAmount": 26000.87,
    "toCurrency": "NGN"
}
const failedValidationMockData= {
    "customerId": "",
    "fromAmount": "rew",
    "fromCurrency": "EUR",
    "toAmount": 26000.8798943,
    "toCurrency": "Dollar"
}
let createdData=null;

beforeAll(async () => {
    await TransactionModel.connectDB();
});

describe('Create an fx transaction test', ()=> {

    //test: Should be able to save an fx transaction with well-formed data to the system
    test('Should be able to save an fx transaction with well-formed data', async () => {
        const response = await request.post('/transactions').send(mockData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const responseBody = (response && response.body) ? response.body : null;
        expect(response.status).toBe(201);
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).not.toBeNull();
        expect(responseBody.data).toHaveProperty('id');
        expect(responseBody.data.id).not.toBe('');
        if (responseBody && responseBody.success && responseBody.data) {
            createdData = responseBody.data;
        }
    });

    /** test: Should be able to validate post data for required and well-formed data
     * and return failed response if not pass validation
     */
    test('Should be able validate post data for required and well-formed data and return errors if failed', async () => {
        const response = await request.post('/transactions').send(failedValidationMockData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const responseBody = (response && response.body) ? response.body : null;
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('success', false);
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).not.toBeNull();
        expect(responseBody.errors).toHaveProperty('customerId');
        expect(responseBody.errors.customerId).not.toBe('');
    });

    /** test: Should be able to handle unexpected internal system/server error
     * and present user with user-friendly feedback message
     */
    test('Should be able to handle unexpected internal system error when creating a transaction', async () => {
        if (createdData && createdData.id) {
            await transactionModel.delete(createdData.id);
        }
        await TransactionModel.closeDBConnection();
        const response = await request.post('/transactions').send(mockData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const responseBody = (response && response.body) ? response.body : null;
        expect(response.status).toBe(500);
        expect(responseBody).toHaveProperty('success', false);
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).not.toBeNull();
        expect(responseBody.errors).toHaveProperty('app');
        expect(responseBody.errors.app).not.toBe('');
    });
});