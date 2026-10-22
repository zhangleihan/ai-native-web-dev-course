import TicketDetail from '../../../../components/repair/TicketDetail.jsx';
export default async function Page({params}) { const {id} = await params; return <TicketDetail id={id}/>; }
