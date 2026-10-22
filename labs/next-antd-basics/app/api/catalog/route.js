import { queryCatalog } from '../../../lib/catalog.js';
export function GET(request){
  const params=new URL(request.url).searchParams;
  const headers={'Cache-Control':'no-store'};
  if(params.get('demoError')==='1') return Response.json({error:'课堂演示：服务暂时不可用，请关闭模拟失败后重试。'},{status:503,headers});
  try{return Response.json(queryCatalog(params),{headers});}
  catch(error){return Response.json({error:error.message},{status:400,headers});}
}
