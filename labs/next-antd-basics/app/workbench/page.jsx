import CaseEditor from '../../components/CaseEditor.jsx';
import {catalog} from '../../lib/catalog.js';
export default function Page(){return <main><h1>案例编辑工作台</h1><p>新增、编辑和删除只影响当前页面；刷新恢复6条初始记录，不会修改服务端目录。</p><CaseEditor initialItems={catalog}/></main>;}
