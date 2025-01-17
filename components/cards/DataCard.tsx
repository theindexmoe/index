import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { canEdit } from '../../lib/session'
import styles from './Card.module.css'
import DataItem from '../data/DataItem'
import IconEdit from '../icons/IconEdit'
import { FC } from 'react'
import { Column } from '../../types/Column'

type Props = {
  data: boolean | string | string[]
  column: Column
  onChange?: (value: any) => void
}

const DataCard: FC<Props> = ({ data, column, onChange }) => {
  const { data: session } = useSession()

  return (
    <div className={'card bg-4 mb-2 me-2'}>
      <div className={'card-body'}>
        <h5 className={'card-title'}>
          <Link
            href={'/column/' + column.urlId}
            data-tooltip-content={'View column ' + column.name}
          >
            {column.name}
          </Link>
          {canEdit(session) && (
            <Link
              href={'/edit/column/' + column._id}
              className={'ms-2'}
              data-tooltip-content={'Edit column'}
            >
              <IconEdit />
            </Link>
          )}
        </h5>

        {typeof onChange === 'undefined' && (
          <p className={styles.description + ' card-text'}>
            {column.description}
          </p>
        )}
        <DataItem data={data} column={column} onChange={onChange} />
      </div>
    </div>
  )
}

export default DataCard
