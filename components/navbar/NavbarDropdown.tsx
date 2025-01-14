import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import styles from './NavbarDropdown.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'

export default function NavbarDropdown({
  targetId,
  toggler,
  contentList,
  viewAllUrl,
  onClick,
}: {
  targetId: string
  toggler: ReactNode
  contentList: ReactNode[]
  viewAllUrl?: string
  onClick: () => void
}) {
  const [show, setShow] = useState(false)

  return (
    <li className={'nav-item'}>
      <button
        className={
          styles.toggle + ' collapsed nav-link' + (show ? ' show' : '')
        }
        role='button'
        data-bs-toggle={'collapse'}
        data-bs-target={'#' + targetId}
        aria-expanded={show}
        onClick={() => setShow(!show)}
      >
        <div className={styles.chevron}>
          <FontAwesomeIcon icon={show ? faChevronDown : faChevronRight} />
        </div>
        {toggler}
      </button>

      <div id={targetId} className={'collapse' + (show ? ' show' : '')}>
        <ul className={'list-unstyled rounded bg-3 ms-4'}>
          {contentList.map((c, i) => (
            <li className={'nav-item'} onClick={onClick} key={i}>
              {c}
            </li>
          ))}
          {viewAllUrl && (
            <>
              <hr className={'dropdown-divider'} />
              <li className={'nav-item'} onClick={onClick}>
                <Link href={viewAllUrl} className={'nav-link small text-end'}>
                  View all
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </li>
  )
}
