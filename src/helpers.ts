/**
 * This helper takes in an express querystring parameter and return it
 * as an array of values
 * @param param - the parameter to return array shaped
 * @param splitter - the splitter to use to convert a string to an array
 */
export const getQueryParamAsList = (param: any, splitter = ',') => {
  if (Array.isArray(param)) return param;
  if (typeof param === 'string') return param.split(splitter);
  throw new Error('Type not handled by getQueryParamAsList helper');
};

export default { getQueryParamAsList };
