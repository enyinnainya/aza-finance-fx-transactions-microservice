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
let createdData=null;
beforeAll(async () => {
    await TransactionModel.connectDB();
});

describe('List all existing fx transactions test', ()=> {

    /** test: Should be able to list all the existing fx transactions in the system
     * and return fetched data to client
     */
    test('Should be able to list all existing fx transactions', async () => {
        const createResponse = await request.post('/transactions').send(mockData).set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const createResponseBody = (createResponse && createResponse.body) ? createResponse.body : null;
        if (createResponseBody && createResponseBody.success && createResponseBody.data) {
            createdData = createResponseBody.data;
            const response = await request.get('/transactions').set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
            const responseBody = (response && response.body) ? response.body : null;
            expect(response.status).toBe(200);
            expect(responseBody).toHaveProperty('success', true);
            expect(responseBody).toHaveProperty('data');
            expect(responseBody.data).not.toBeNull();
            expect(responseBody.data[0]).not.toBeNull();
            expect(responseBody.data[0]).toHaveProperty('id');
            expect(responseBody.data[0].id).not.toBe('');
        }
    });

    /** test: Should be able to handle unexpected internal system error when fetching transactions
    * and present user with user-friendly feedback message
     **/
    test('Should be able to handle unexpected internal system error when fetching transactions', async () => {
        if (createdData && createdData.id) {
            await transactionModel.delete(createdData.id);
        }
        await TransactionModel.closeDBConnection();
        const response = await request.get("/transactions").set({Authorization: `${process.env.ACCESS_TOKEN || ''}`});
        const responseBody = (response && response.body) ? response.body : null;
        expect(response.status).toBe(500);
        expect(responseBody).toHaveProperty('success', false);
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).not.toBeNull();
        expect(responseBody.errors).toHaveProperty('app');
        expect(responseBody.errors.app).not.toBe('');
    })
});