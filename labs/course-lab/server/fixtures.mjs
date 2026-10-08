import bcrypt from 'bcryptjs';
export const ids = {alice:'10000000-0000-4000-8000-000000000001',bob:'10000000-0000-4000-8000-000000000002',admin:'10000000-0000-4000-8000-000000000003',caseA:'20000000-0000-4000-8000-000000000001',caseB:'20000000-0000-4000-8000-000000000002'};
export async function seed(store,password) {
  if(typeof password!=='string'||password.length<12) throw new Error('LAB_PASSWORD 至少12字符；仅使用练习口令');
  const passwordHash=await bcrypt.hash(password,10);
  for(const username of ['alice','bob','admin']) await store.addUser({id:ids[username],username,passwordHash,role:username==='admin'?'admin':'student'});
  await store.insertSeedCase({id:ids.caseA,title:'链路中断',industry:'telecom',difficulty:'beginner',ownerId:ids.alice});
  await store.insertSeedCase({id:ids.caseB,title:'订单延迟',industry:'retail',difficulty:'intermediate',ownerId:ids.bob});
}
