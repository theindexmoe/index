import CardRowBoard from "./CardRowBoard"

export default function ItemBoard(
    {
        _id,
        items,
        allItems,
        columns,
        updateURL = "/api/edit/table/items",
        updateKey = "items",
        deleteURL = "",
    }) {
    return <CardRowBoard type={"item"} _id={_id} content={items} allContent={allItems} columns={columns}
                         updateContentURL={updateURL} updateContentKey={updateKey} deleteContentURL={deleteURL}/>
}
