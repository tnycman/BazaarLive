import { getLayoutPolicyForCategory } from '../client/src/services/category/utils/LayoutPolicy';

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const fashion = getLayoutPolicyForCategory('fashion');
assert(fashion.containerClass === 'w-full', 'fashion container should be w-full');
assert(fashion.showRightSidebar === false, 'fashion should hide right sidebar');
assert(fashion.dynamicPadding === 'px-0', 'fashion padding should be px-0');

const general = getLayoutPolicyForCategory('electronics');
assert(general.containerClass.includes('max-w-7xl'), 'general container should be centered');
assert(general.showRightSidebar === true, 'general should show right sidebar');

console.log('[smoke] LayoutPolicy OK');



