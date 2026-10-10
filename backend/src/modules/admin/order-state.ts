import {AppError} from '../../utils/errors.js';
export function orderUpdate(existing:Record<string,unknown>,body:Record<string,unknown>) {
 const transitions:Record<string,string[]>={pending:['pending','processing'],processing:['processing','shipped'],shipped:['shipped','completed'],completed:['completed']};
 const status=String(body.order_status??existing.order_status);
 if(!transitions[String(existing.order_status)]?.includes(status))throw new AppError(409,'Orders must move pending → processing → shipped → completed');
 const payment=String(body.payment_status??existing.payment_status);
 if(!['pending','paid'].includes(payment))throw new AppError(400,'Invalid payment status');
 if(payment!==existing.payment_status&&(String(existing.payment_method).toLowerCase()!=='cash on delivery'||payment!=='paid'||existing.payment_status!=='pending'))throw new AppError(409,'Only pending COD payments can be marked collected. Card payments are verified by Stripe.');
 if(status==='completed'&&payment!=='paid')throw new AppError(409,'Collect payment before completing the order');
 return {order_status:status,payment_status:payment,updated_at:new Date().toISOString()};
}
