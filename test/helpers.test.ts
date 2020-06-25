// external libraries
import 'mocha';
import { mockRequest } from 'mock-req-res';
import { expect } from 'chai';

// internal libraries
import { getQueryParamAsList } from '../src/helpers';

describe('Test helper getQueryParamAsList controller', () => {
  it('Should return an array when an array is given', () => {
    const dataToTest = ['id1', 'id'];
    const req = mockRequest({
      query: {
        ids: dataToTest,
      },
    });
    const expectedResult = dataToTest;
    const result = getQueryParamAsList(req.query.ids);

    expect(result).to.be.deep.equal(expectedResult);
  });
  it('Should return an array when a comma separated list is given', () => {
    const dataToTest = 'id1,id';
    const req = mockRequest({
      query: {
        ids: dataToTest,
      },
    });
    const expectedResult = ['id1', 'id'];
    const result = getQueryParamAsList(req.query.ids);

    expect(result).to.be.deep.equal(expectedResult);
  });
});
