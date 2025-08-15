import { ConfigurationResultUtils } from '../client/src/services/category/enterprise/patterns/Result';

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

assert(typeof ConfigurationResultUtils === 'object', 'ConfigurationResultUtils not exported as object');
assert(typeof ConfigurationResultUtils.success === 'function', 'ConfigurationResultUtils.success missing');
assert(typeof ConfigurationResultUtils.failure === 'function', 'ConfigurationResultUtils.failure missing');

const ok = ConfigurationResultUtils.success(123);
assert(ok.isSuccess === true && ok.isFailure === false && ok.value === 123, 'success shape invalid');

const err = ConfigurationResultUtils.failure(new Error('x'));
assert(err.isSuccess === false && err.isFailure === true && err.error instanceof Error, 'failure shape invalid');

console.log('[smoke] ConfigurationResultUtils OK');



