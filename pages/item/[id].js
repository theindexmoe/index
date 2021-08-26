import Layout, {siteName} from "../../components/layout/Layout"
import Head from "next/head"
import Link from "next/link"
import {getTabsWithTables} from "../../lib/db/tabs"
import {useRouter} from "next/router"
import {useSession} from "next-auth/client"
import Loader from "../../components/loading"
import {canEdit} from "../../lib/session"
import {getItem, getItems} from "../../lib/db/items"
import {find} from "../../lib/db/db"
import {getColumns} from "../../lib/db/columns"
import DataItem from "../../components/data/DataItem"
import IconEdit from "../../components/icons/IconEdit"
import DataBadge from "../../components/data/DataBadge"
import {splitColumnsIntoTypes} from "../../lib/item";

export default function Item({tabs, tablesContainingItem, columns, item}) {
    const router = useRouter()
    const [session] = useSession()

    if (router.isFallback) {
        return <Loader/>
    }

    const column = splitColumnsIntoTypes(Object.keys(item.data).map(k => columns.find(c => c._id === k)), item)

    return <Layout tabs={tabs}>
        <Head>
            <title>
                {item.name + " | " + siteName}
            </title>
            {item.blacklist ?
                <meta name="robots" content="noindex, archive, follow"/> :
                <meta name="description" content={item.description}/>
            }
        </Head>

        <div className={"card bg-2"}>
            <div className="card-body">
                <div className={"card-title"}>
                    <h3>
                        {item.blacklist ? <span className={"text-danger"}>
                            Blacklisted: <del>{item.name}</del>
                        </span> : item.name}
                        <span style={{fontSize: "1.2rem"}}>
                            {tablesContainingItem.map(t => {
                                return <Link href={"/table/" + t.urlId} key={t._id}>
                                    <a className={"ms-2"} title={"View table " + t.name}>
                                        <DataBadge name={t.name} style={"primary"}/>
                                    </a>
                                </Link>
                            })}
                            <div className={"float-end"}>
                                {item.sponsor ? <DataBadge name={"Sponsor"} style={"warning text-dark"}/> : <></>}
                                {item.nsfw ? <span className={"ms-2"}>
                                    <DataBadge data={false} name={"NSFW"}/>
                                </span> : <></>}
                                {canEdit(session) ? <Link href={"/edit/item/" + item._id}>
                                    <a title={"Edit table"} className={"ms-2"}>
                                        <IconEdit/>
                                    </a>
                                </Link> : <></>}
                            </div>
                        </span>
                    </h3>
                </div>
                <div className={"d-flex flex-wrap"}>
                    {item.urls.map(url => <a href={url} target={"_blank"} rel={"noreferrer"} key={url}
                                             className={"me-2"}>
                        <DataBadge name={url} style={"primary"}/>
                    </a>)}
                </div>
                <p className={"card-text"}>
                    {item.description}
                </p>
            </div>
        </div>

        {item.blacklist ? <div className={"card bg-2 my-2"}>
            <div className={"card-body"}>
                <p className={"card-text"}>
                    This item has been <span className={"text-danger"}>blacklisted</span> due to misconduct of their
                    stuff or breaking our rules.
                    <br/>
                    You can apply to be un-<span className={"text-danger"}>blacklisted</span> by contacting our team on
                    discord.
                </p>
            </div>
        </div> : <></>}
        {!item.blacklist || canEdit(session) ? <>
            <div className={"card bg-2 my-2"}>
                <div className={"card-body"}>
                    <h5 className={"card-title"}>
                        It has
                    </h5>
                    <div className={"d-flex flex-wrap"}>
                        {column.yes.length === 0 ? <span className={"text-muted"}>No data found</span> : <></>}
                        {column.yes.map(c => {
                            return <DataItem data={item.data[c._id]} column={c} key={c._id}/>
                        })}
                    </div>
                </div>
            </div>
            <div className={"card bg-2 my-2"}>
                <div className={"card-body"}>
                    <h5 className={"card-title"}>
                        It does <span className={"text-danger"}>not</span> have
                    </h5>
                    <div className={"d-flex flex-wrap"}>
                        {column.no.length === 0 ? <span className={"text-muted"}>No data found</span> : <></>}
                        {column.no.map(c => {
                            return <DataItem data={item.data[c._id]} column={c} key={c._id}/>
                        })}
                    </div>
                </div>
            </div>
            <div className={"card bg-2 my-2"}>
                <div className={"card-body"}>
                    <h5 className={"card-title"}>
                        Other features are
                    </h5>
                    <div className={"d-flex flex-wrap"}>
                        {column.array.length === 0 ? <span className={"text-muted"}>No data found</span> : <></>}
                        {column.array.map(c => {
                            return <div key={c._id}>
                                <Link href={"/column/" + c.urlId}>
                                    <a className={"me-2"} title={"View column " + c.name}>
                                        {c.name}:
                                    </a>
                                </Link>
                                <DataItem data={item.data[c._id]} column={c}/>
                            </div>
                        })}
                    </div>
                </div>
            </div>
            {column.text.length > 0 ? column.text.map(c =>
                <div className={"card bg-2 my-2"} key={c._id}>
                    <div className={"card-body"}>
                        <h5 className={"card-title"}>
                            {c.name}
                        </h5>
                        <p className={"card-text"}>
                            {item.data[c._id]}
                        </p>
                    </div>
                </div>) : <></>}
        </> : <></>}
    </Layout>
}

export async function getStaticPaths() {
    const items = await getItems()
    const paths = items.map(i => {
        return {
            params: {
                id: i._id
            }
        }
    })

    return {
        paths,
        fallback: true
    }
}

export async function getStaticProps({params}) {
    const tabs = await getTabsWithTables()
    const tablesContainingItem = await find("tables", {items: [params.id]})
    const columns = await getColumns()
    const item = await getItem(params.id)

    return {
        props: {
            tabs,
            tablesContainingItem,
            columns,
            item
        },
        revalidate: 10
    }
}
