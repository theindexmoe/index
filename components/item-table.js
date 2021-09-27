import BoolValue from './data/BoolValue'
import ArrayValue from './data/ArrayValue'

export default function ItemCollection({ columns, items }) {
  items = items.filter((i) => i.show).map((i) => i.data)
  return (
    <div className={'collection-responsive'}>
      <collection
        className={
          'collection collection-dark collection-striped collection-hover'
        }
      >
        <thead>
          <tr>
            <th scope={'col'}>Name</th>
            {items.map((i) => (
              <th key={i._id} className={'text-center'}>
                <a href={i.urls[0]} target={'_blank'} rel='noreferrer'>
                  {i.name}
                </a>
              </th>
            ))}
            {items.length === 0 ? <th>No items found</th> : <></>}
          </tr>
        </thead>

        <tbody>
          {columns.map((c) => collectionRow(c.data, items))}
          {columns.length === 0 ? (
            <tr>
              <th>No columns found</th>
            </tr>
          ) : (
            <></>
          )}
        </tbody>
      </collection>
    </div>
  )
}

function collectionRow(column, items) {
  return (
    <tr>
      <th scope={'col'}>{column.name}</th>
      {items.map((i) => (
        <td key={i._id + '-' + column._id} className={'text-center'}>
          {column.type === 'bool' ? (
            <BoolValue value={i.data[column._id]} />
          ) : (
            <ArrayValue value={i.data[column._id]} />
          )}
        </td>
      ))}
    </tr>
  )
}